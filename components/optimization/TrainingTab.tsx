"use client"

import { useState, useEffect, useRef } from "react"
import { Area, Project } from "@/types"
import { Play, Terminal, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
// Dynamic map import
import dynamic from 'next/dynamic'
import { startTraining, getLogStreamUrl } from "@/lib/traffic-api"

const Map = dynamic(() => import('@/components/map/Map'), { 
  ssr: false,
  loading: () => <div className="h-full bg-slate-100 flex items-center justify-center">Loading Map...</div>
})

interface TrainingTabProps {
  project: Project
  projectId: string
}

export function TrainingTab({ project, projectId }: TrainingTabProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string>("")
  const [minGreen, setMinGreen] = useState(25)
  const [episodes, setEpisodes] = useState(100)
  const [isTraining, setIsTraining] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const logContainerRef = useRef<HTMLDivElement>(null)

  const selectedArea = project.areas?.find(a => a.id === selectedAreaId)

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
        logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [logs])

  const handleStartTraining = async () => {
    if (!selectedArea) return
    setIsTraining(true)
    setLogs(["Initializing training session..."])

    try {
        // Start streaming logs
        const eventSource = new EventSource(getLogStreamUrl(projectId))
        
        eventSource.onmessage = (event) => {
            setLogs(prev => [...prev, event.data])
        }

        eventSource.onerror = (e) => {
            console.error("SSE Error", e);
            eventSource.close();
        }

        // Trigger training
        await startTraining({
            project_id: projectId,
            bbox: {
                north: selectedArea.coordinates[0] + 0.005, // Mock bounds if not explicit, but ideally we use area.bounds
                south: selectedArea.coordinates[0] - 0.005,
                east: selectedArea.coordinates[1] + 0.005,
                west: selectedArea.coordinates[1] - 0.005,
                // If we updated Area type to include 'bounds', use that:
                // ...selectedArea.bounds 
            },
            min_green: minGreen,
            episodes: episodes
        })

    } catch (error) {
        console.error("Failed to start training", error)
        setLogs(prev => [...prev, `Error: ${error}`])
        setIsTraining(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
       {/* Left: Configuration */}
       <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm">
             <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin size={18} />
                Select Target Area
             </h3>
             
             {project.areas && project.areas.length > 0 ? (
                 <div className="space-y-2">
                     {project.areas.map(area => (
                         <div 
                            key={area.id}
                            onClick={() => setSelectedAreaId(area.id)}
                            className={cn(
                                "p-3 rounded-md border cursor-pointer transition-all",
                                selectedAreaId === area.id 
                                ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary" 
                                : "border-border hover:bg-muted"
                            )}
                         >
                            <div className="font-medium text-sm">{area.name}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                Created: {new Date(area.createdAt || new Date()).toLocaleDateString()}
                            </div>
                         </div>
                     ))}
                 </div>
             ) : (
                 <div className="text-sm text-muted-foreground italic border border-dashed p-4 rounded-md text-center">
                    No areas found. Go to the "Areas" page to create one.
                 </div>
             )}
          </div>

          <div className="bg-card border border-border rounded-lg p-5 shadow-sm flex-1">
              <h3 className="font-semibold mb-4">Training Parameters</h3>
              
              <div className="space-y-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium">Min Green Time (sec)</label>
                      <input 
                         type="number" 
                         value={minGreen}
                         onChange={(e) => setMinGreen(Number(e.target.value))}
                         className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium">Episodes</label>
                      <input 
                         type="number" 
                         value={episodes}
                         onChange={(e) => setEpisodes(Number(e.target.value))}
                         className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                      />
                  </div>

                  <button
                    onClick={handleStartTraining}
                    disabled={!selectedArea || isTraining}
                    className="w-full mt-4 bg-primary text-primary-foreground py-2 rounded-md font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                     <Play size={16} />
                     {isTraining ? "Training Started..." : "Start Training"}
                  </button>
              </div>
          </div>
       </div>

       {/* Middle/Right: Map & Logs */}
       <div className="lg:col-span-2 flex flex-col gap-6">
           <div className="h-1/2 bg-slate-100 rounded-lg border border-border overflow-hidden relative">
               {selectedArea ? (
                   <Map 
                      center={selectedArea.coordinates}
                      zoom={15}
                      interactive={false}
                      selectionBounds={
                        selectedArea.bounds 
                          ? [[selectedArea.bounds.south, selectedArea.bounds.west], [selectedArea.bounds.north, selectedArea.bounds.east]]
                          : [[selectedArea.coordinates[0] - 0.005, selectedArea.coordinates[1] - 0.005], [selectedArea.coordinates[0] + 0.005, selectedArea.coordinates[1] + 0.005]]
                      }
                   />
               ) : (
                   <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/20">
                      Select an area to preview
                   </div>
               )}
           </div>

           <div className="h-1/2 bg-slate-950 rounded-lg border border-border flex flex-col overflow-hidden">
               <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                   <Terminal size={14} className="text-slate-400" />
                   <span className="text-xs font-mono text-slate-400">Live Training Logs</span>
               </div>
               <div 
                 ref={logContainerRef}
                 className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 text-slate-300"
               >
                   {logs.length === 0 ? (
                       <span className="text-slate-600 italic">Waiting for process start...</span>
                   ) : (
                       logs.map((log, i) => (
                           <div key={i} className="break-words">{log}</div>
                       ))
                   )}
               </div>
           </div>
       </div>
    </div>
  )
}
