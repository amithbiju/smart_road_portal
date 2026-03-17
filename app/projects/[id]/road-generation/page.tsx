"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { SectionLayout } from "@/components/shared/SectionLayout"
import { LogStream } from "@/components/shared/LogStream"
import { RoadGenInputs, RoadGenParams } from "@/components/optimization/RoadGenInputs"
import dynamic from "next/dynamic"
import { LogEntry, Project, Area } from "@/types"
import { getProject } from "@/lib/firebase-services"
import { AlertCircle, CheckCircle2, MapPin, FileText, Settings2, BarChart3 } from "lucide-react"
import type { PathOverlay } from "@/components/map/Map"
import { RoadGenResultsTab } from "@/components/optimization/RoadGenResultsTab"
import { cn } from "@/lib/utils"

const Map = dynamic(() => import('@/components/map/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div>
})

const BACKEND_URL = "http://localhost:6001"

export default function RoadGenPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [result, setResult] = useState<any>(null)
  const [overlays, setOverlays] = useState<PathOverlay[]>([])
  const [mapCenter, setMapCenter] = useState<[number, number]>([8.5241, 76.9366])
  const [activeTab, setActiveTab] = useState<'planning' | 'results'>('planning')

  useEffect(() => {
    async function loadProject() {
      if (projectId) {
        const p = await getProject(projectId)
        setProject(p)
        if (p?.areas && p.areas.length > 0) {
            setSelectedArea(p.areas[0])
            // Center map on first area
            if (p.areas[0].bounds) {
              const b = p.areas[0].bounds
              setMapCenter([(b.north + b.south) / 2, (b.east + b.west) / 2])
            }
        }
      }
    }
    loadProject()
  }, [projectId])

  // When area changes, center the map on it
  useEffect(() => {
    if (selectedArea?.bounds) {
      const b = selectedArea.bounds
      setMapCenter([(b.north + b.south) / 2, (b.east + b.west) / 2])
    }
    // Clear previous results when area changes
    setOverlays([])
    setResult(null)
  }, [selectedArea?.id])

  const addLog = (msg: string, level: LogEntry['level']) => {
    const timestamp = new Date().toLocaleTimeString('en-US', {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})
    setLogs(prev => [...prev, {
       id: Math.random().toString(),
       timestamp,
       level,
       message: msg
    }])
  }

  const handleRun = async (genParams: RoadGenParams) => {
    if (!selectedArea) {
        addLog("No area selected. Please select an area first.", 'error')
        return
    }

    if (!selectedArea.bounds) {
        addLog("Selected area has no bounds defined. Please re-create the area.", 'error')
        return
    }

    setIsRunning(true)
    setLogs([])
    setResult(null)
    setOverlays([])

    addLog(`Starting road generation for area: "${selectedArea.name}"`, 'info')
    addLog(`Project ID: ${projectId}`, 'info')
    addLog(`Bounds: N=${selectedArea.bounds.north.toFixed(4)}, S=${selectedArea.bounds.south.toFixed(4)}, E=${selectedArea.bounds.east.toFixed(4)}, W=${selectedArea.bounds.west.toFixed(4)}`, 'info')
    addLog(`Grid Resolution: ${genParams.gridRes}m`, 'info')
    addLog(`Cost Config: Core=${genParams.costCongestionCore}, Near=${genParams.costCongestionNear}, Far=${genParams.costCongestionFar}`, 'info')
    addLog("Sending request to backend...", 'info')

    try {
        // Step 1: Start generation and get jobId
        const startResponse = await fetch(`${BACKEND_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: projectId,
                areaId: selectedArea.id,
                bounds: selectedArea.bounds,
                params: genParams
            }),
        })

        const startData = await startResponse.json()

        if (!startResponse.ok) {
            throw new Error(startData.error || "Failed to start generation")
        }

        const jobId = startData.jobId
        addLog(`Job started: ${jobId}`, 'info')

        // Step 2: Connect to SSE stream for real-time progress
        await new Promise<void>((resolve, reject) => {
            const eventSource = new EventSource(`${BACKEND_URL}/api/generate/${jobId}/stream`)

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)

                    if (data.type === 'log') {
                        // Map backend levels to our LogEntry levels
                        const levelMap: Record<string, LogEntry['level']> = {
                            'info': 'info',
                            'success': 'success',
                            'warning': 'warning',
                            'error': 'error',
                        }
                        const level = levelMap[data.level] || 'info'
                        addLog(data.message, level)
                    } else if (data.type === 'complete') {
                        eventSource.close()
                        
                        const result = data.result
                        addLog(result.message || "Process completed successfully.", 'success')
                        setResult(result)
                        
                        // Process file list
                        if (result.files && result.files.length > 0) {
                            result.files.forEach((f: any) => {
                                const sizeKB = (f.size / 1024).toFixed(1)
                                addLog(`  → ${f.name} (${sizeKB} KB)`, 'info')
                            })
                        }

                        // Set map overlays from response
                        if (result.overlays) {
                            const newOverlays: PathOverlay[] = []
                            
                            Object.entries(result.overlays).forEach(([key, val]: [string, any]) => {
                                newOverlays.push({
                                    id: key,
                                    coordinates: val.coordinates,
                                    color: val.color || (key.includes('red') || key.includes('congestion') ? '#ef4444' : key.includes('green') || key.includes('bypass') ? '#22c55e' : '#3b82f6'),
                                    weight: val.weight || 6,
                                    opacity: val.opacity || 0.9,
                                    dashArray: val.dashArray,
                                    label: val.label || key.replace(/_/g, ' ')
                                })
                            })
                            
                            setOverlays(newOverlays)
                            addLog(`Displaying ${newOverlays.length} overlay(s) on map.`, 'success')
                        }

                        resolve()
                    } else if (data.type === 'error') {
                        eventSource.close()
                        reject(new Error(data.error || "Generation failed on backend"))
                    }
                } catch (parseErr) {
                    console.error("Failed to parse SSE event:", parseErr)
                }
            }

            eventSource.onerror = () => {
                eventSource.close()
                // Try polling status as fallback
                fetch(`${BACKEND_URL}/api/generate/${jobId}/status`)
                    .then(r => r.json())
                    .then(statusData => {
                        if (statusData.status === 'complete') {
                            setResult(statusData.result)
                            addLog("Process completed (reconnected).", 'success')
                            resolve()
                        } else if (statusData.status === 'failed') {
                            reject(new Error(statusData.error || "Generation failed"))
                        } else {
                            reject(new Error("SSE connection lost while job is still running. Check backend logs."))
                        }
                    })
                    .catch(() => reject(new Error("Lost connection to backend.")))
            }
        })

    } catch (error: any) {
        if (error.message === 'Failed to fetch') {
            addLog('Error: Could not connect to the Road Generation backend. Make sure it is running on port 6001.', 'error')
        } else {
            addLog(`Error: ${error.message}`, 'error')
        }
        console.error(error)
    } finally {
        setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header Tabs */}
        <div className="flex flex-col gap-4 border-b border-border px-6 pt-4 mb-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto disable-scrollbar">
                    <TabButton 
                       label="Generation Setup" 
                       icon={Settings2} 
                       isActive={activeTab === 'planning'} 
                       onClick={() => setActiveTab('planning')}
                    />
                    <TabButton 
                       label="Results & Analysis" 
                       icon={BarChart3} 
                       isActive={activeTab === 'results'} 
                       onClick={() => setActiveTab('results')}
                    />
                </div>
                
                {/* Area Selection Header */}
                <div className="flex items-center gap-4 py-2 border-l border-border pl-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2 whitespace-nowrap">
                       <MapPin size={16} /> Area Context
                    </div>
                    {project?.areas && project.areas.length > 0 ? (
                        <div className="flex items-center gap-3">
                            <select 
                                className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={selectedArea?.id || ""}
                                onChange={(e) => {
                                    const area = project.areas.find(a => a.id === e.target.value)
                                    setSelectedArea(area || null)
                                }}
                                disabled={isRunning}
                            >
                                {project.areas.map(area => (
                                    <option key={area.id} value={area.id}>{area.name}</option>
                                ))}
                            </select>
                            
                            {activeTab === 'planning' && result?.files && (
                                <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                    <FileText size={14} />
                                    {result.files.length} files
                                </div>
                            )}
                            {activeTab === 'planning' && result && (
                                <div className="hidden lg:flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded border border-green-200 dark:border-green-900/50">
                                    <CheckCircle2 size={14} />
                                    <span>Complete</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle size={16} />
                            No areas found.
                        </span>
                    )}
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10">
            {activeTab === 'planning' ? (
                <div className="flex flex-col h-full gap-4 pb-12">
                    <SectionLayout 
                      title="Road Network Generation"
                      status={isRunning ? "Generating..." : result ? "Complete" : "Idle"}
                      inputs={<RoadGenInputs onRun={handleRun} isRunning={isRunning} />}
                      visualizer={
                        <div className="h-full relative flex flex-col">
                            <div className="flex-1 relative">
                                <Map 
                                  className="h-full rounded-none border-0" 
                                  center={mapCenter}
                                  zoom={14}
                                  overlays={overlays}
                                  fitToOverlays={overlays.length > 0}
                                />
                            </div>
                            {result && (
                                 <div className="p-2.5 bg-muted/50 text-xs text-center border-t border-border font-mono text-muted-foreground">
                                     Output: projects/{projectId}/{selectedArea?.id}/
                                 </div>
                            )}
                        </div>
                      }
                      logs={<LogStream logs={logs} isRunning={isRunning} />}
                    />
                </div>
            ) : (
                <RoadGenResultsTab projectId={projectId} selectedAreaId={selectedArea?.id} bounds={selectedArea?.bounds} />
            )}
        </div>
    </div>
  )
}

function TabButton({ label, icon: Icon, isActive, onClick }: any) {
    return (
        <button
           onClick={onClick}
           className={cn(
               "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-[2px] whitespace-nowrap",
               isActive 
                 ? "border-primary text-primary" 
                 : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
           )}
        >
            <Icon size={16} />
            {label}
        </button>
    )
}
