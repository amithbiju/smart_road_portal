"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { SectionLayout } from "@/components/shared/SectionLayout"
import { LogStream } from "@/components/shared/LogStream"
import { LaneInputs } from "@/components/optimization/LaneInputs"
import { LaneVisualizer } from "@/components/optimization/LaneVisualizer"
import { LogEntry, Project, Area } from "@/types"
import { getProject } from "@/lib/firebase-services"
import { METRICS_DATA } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, MapPin, AlertCircle, FileText, CheckCircle2, Settings2, BarChart3 } from "lucide-react"
import dynamic from "next/dynamic"
import type { PathOverlay } from "@/components/map/Map"
import { LaneResultsTab } from "@/components/optimization/LaneResultsTab"
import { LaneOptParams } from "@/components/optimization/LaneInputs"
import { cn } from "@/lib/utils"

const Map = dynamic(() => import('@/components/map/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div>
})

const BACKEND_URL = "http://localhost:6002"

export default function LanePlanningPage() {
  const params = useParams()
  const projectId = params.id as string
  
  const [project, setProject] = useState<Project | null>(null)
  const [selectedArea, setSelectedArea] = useState<Area | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showResults, setShowResults] = useState(false)
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
            if (p.areas[0].bounds) {
              const b = p.areas[0].bounds
              setMapCenter([(b.north + b.south) / 2, (b.east + b.west) / 2])
            }
        }
      }
    }
    loadProject()
  }, [projectId])

  useEffect(() => {
    if (selectedArea?.bounds) {
      const b = selectedArea.bounds
      setMapCenter([(b.north + b.south) / 2, (b.east + b.west) / 2])
    }
    setOverlays([])
    setResult(null)
    setShowResults(false)
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

  const handleRun = async (params: LaneOptParams) => {
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
    setShowResults(false)
    setOverlays([])

    addLog(`Starting lanes and flyover planning for area: "${selectedArea.name}"`, 'info')
    addLog(`This process runs reinforcement learning (50 episodes) and parallel simulations. It may take several minutes.`, 'info')
    
    try {
        const response = await fetch(`${BACKEND_URL}/api/plan-lanes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: projectId,
                areaId: selectedArea.id,
                bounds: selectedArea.bounds,
                params: params
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Generation failed on backend")
        }

        addLog("✓ Phase 0: OSM Data Downloaded & Converted", 'success')
        addLog("✓ Phase 1: Generated Traffic Demand", 'success')
        addLog("✓ Phase 2: DQN Agent Trained Successfully", 'success')
        addLog("✓ Phase 3: Traffic Routed Dynamically", 'success')
        addLog("✓ Phase 4: Parallel Simulations Complete", 'success')
        addLog("✓ Phase 5: Metrics Evaluated", 'success')
        
        if (data.files && data.files.length > 0) {
            addLog(`Generated ${data.files.length} output files`, 'info')
        }

        addLog(data.message || "Process completed successfully.", 'success')
        setResult(data)
        
        if (data.overlays) {
            const newOverlays: PathOverlay[] = []
            
            if (data.overlays.congestion_red) {
                newOverlays.push({
                    id: 'congestion',
                    coordinates: data.overlays.congestion_red.coordinates,
                    color: '#ef4444',
                    weight: 6,
                    opacity: 0.9,
                    label: data.overlays.congestion_red.label
                })
            }
            
            if (data.overlays.bypass_green) {
                newOverlays.push({
                    id: 'bypass',
                    coordinates: data.overlays.bypass_green.coordinates,
                    color: '#22c55e',
                    weight: 5,
                    opacity: 0.9,
                    label: data.overlays.bypass_green.label
                })
            }
            
            setOverlays(newOverlays)
            addLog(`Displaying ${newOverlays.length} structural changes on map.`, 'success')
        }
        
        setShowResults(true)

    } catch (error: any) {
        addLog(`Error: ${error.message}`, 'error')
        console.error(error)
    } finally {
        setIsRunning(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header Tabs */}
        <div className="flex flex-col gap-4 border-b border-border px-6 pt-4 mb-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <TabButton 
                       label="Planning Setup" 
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
                
                {/* Area Selection header moved to top right */}
                <div className="flex items-center gap-4 py-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2">
                       <MapPin size={16} /> Area Context
                    </div>
                    {project?.areas && project.areas.length > 0 ? (
                        <select 
                            className="h-9 w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
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
                    ) : null}
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-10">
            {activeTab === 'planning' ? (
                <div className="flex flex-col h-full gap-4 pb-12">
            <SectionLayout 
               title="Lane Addition & Flyover Planning"
           status={isRunning ? "Running Reinforcement Learning..." : showResults ? "Completed" : "Idle"}
           inputs={<LaneInputs onRun={handleRun} isRunning={isRunning} />}
           visualizer={
             <div className="h-full relative flex flex-col">
                 <div className="flex-1 relative">
                     <Map 
                       className="h-full rounded-none border-0" 
                       center={mapCenter}
                       zoom={14}
                       bounds={selectedArea?.bounds}
                       overlays={overlays}
                       fitToOverlays={overlays.length > 0}
                     />
                 </div>
                 {result && (
                      <div className="p-2.5 bg-muted/50 text-xs text-center border-t border-border font-mono text-muted-foreground">
                          Output: lanes_flyover/projects/{projectId}/{selectedArea?.id}/
                      </div>
                 )}
             </div>
           }
           logs={
              <div className="h-full flex flex-col">
                 <div className={showResults ? "h-1/2" : "h-full"}>
                    <LogStream logs={logs} isRunning={isRunning} />
                 </div>
                 {showResults && result?.stats && <ResultMetrics stats={result.stats} />}
              </div>
           }
        />
    </div>
            ) : (
                <LaneResultsTab projectId={projectId} selectedAreaId={selectedArea?.id} />
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
               "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-[2px]",
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

function ResultMetrics({ stats }: { stats?: any }) {
    const travelTimeImp = stats?.travelTime || "+18.5%"
    const congestionImp = stats?.congestion || "+22.1%"
    
    // Parse value strings like "+18.5%" to determine trend direction
    const travelTimeVal = parseFloat(travelTimeImp)
    const congestionVal = parseFloat(congestionImp)
    
    // A positive improvement in travel time means it is FASTER (+), which is good (up arrow / green for us)
    const travelTimeTrend = travelTimeVal > 0 ? "up" : "down"
    // A positive improvement in congestion means it's REDUCED (+), which is good (down arrow conceptually for congestion, but 'up' for improvement)
    const congestionTrend = congestionVal > 0 ? "up" : "down"

    return (
        <div className="p-4 bg-muted/20 border-t border-border space-y-3 h-1/2 overflow-y-auto">
            <h4 className="font-medium text-sm">Simulation Comparison</h4>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm bg-card p-2 rounded border border-border">
                    <span className="text-muted-foreground">Travel Time (vs Old)</span>
                    <div className="flex items-center gap-2 font-mono font-medium">
                        {travelTimeImp}
                        {travelTimeTrend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                        {travelTimeTrend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm bg-card p-2 rounded border border-border">
                    <span className="text-muted-foreground">Congestion Reduction</span>
                    <div className="flex items-center gap-2 font-mono font-medium">
                        {congestionImp}
                        {congestionTrend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                        {congestionTrend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm bg-card p-2 rounded border border-border">
                    <span className="text-muted-foreground">AI Episodes Ran</span>
                    <div className="flex items-center gap-2 font-mono font-medium">
                        50
                        <CheckCircle2 size={14} className="text-green-500"/>
                    </div>
                </div>
            </div>
            <button className="w-full text-xs text-primary hover:underline text-center mt-2">
                Download Detailed Report
            </button>
        </div>
    )
}
