import { getResults, getPlotUrl, getSimulationData, runSimulation, getLogStreamUrl, ResultsResponse, SimulationResponse } from "@/lib/traffic-api"
import { Loader2, TrendingUp, TrendingDown, Clock, MoveRight, Play, Terminal } from "lucide-react"
import { SimulationPlayback } from "./SimulationPlayback"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface ResultsTabProps {
  projectId: string
}

export function ResultsTab({ projectId }: ResultsTabProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ResultsResponse | null>(null)
  const [simData, setSimData] = useState<SimulationResponse | null>(null)
  
  // Simulation Run States
  const [isRunningSim, setIsRunningSim] = useState(false)
  const [simLogs, setSimLogs] = useState<string[]>([])
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to bottom of logs
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simLogs]);

  useEffect(() => {
    async function fetchResults() {
        try {
            const [res, sim] = await Promise.all([
                getResults(projectId),
                getSimulationData(projectId)
            ])
            setData(res)
            setSimData(sim)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    fetchResults()
  }, [projectId])

  const handleRunSimulation = async () => {
      setIsRunningSim(true);
      setSimLogs(["Starting new simulation run..."]);
      
      try {
          // Open Log Stream
          const eventSource = new EventSource(getLogStreamUrl(projectId));
          
          eventSource.onmessage = (event) => {
              setSimLogs(prev => [...prev, event.data]);
          }
          
          eventSource.onerror = (e) => {
             console.error("SSE Error", e); // Connection closed or error
             eventSource.close();
             setIsRunningSim(false);
          }

          // Trigger Sim
          await runSimulation(projectId);
          
      } catch (error) {
          console.error("Failed to run simulation", error);
          setSimLogs(prev => [...prev, "Error: Failed to start simulation."]);
          setIsRunningSim(false);
      }
  }

  if (loading) {
     return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
  }

  if (!data || data.waiting_time_comparison.length === 0) {
      return (
          <div className="h-96 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg">
              <p>No results found for this project.</p>
              <p className="text-sm mt-2">Run training first to generate metrics.</p>
          </div>
      )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       {/* Simulation Playback */}
       {simData && simData.simulation_log.length > 0 && (
           <>
             <SimulationPlayback data={simData} />
             
             {/* Simulation Data Table */}
             <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-border px-4 py-3 font-medium text-sm flex items-center justify-between">
                    <span>Simulation Phase Log</span>
                    <span className="text-xs text-muted-foreground">{simData.simulation_log.length} events</span>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/30 sticky top-0 z-10 backdrop-blur-sm">
                            <tr>
                                <th className="px-4 py-2 font-medium">Episode</th>
                                <th className="px-4 py-2 font-medium">Junction</th>
                                <th className="px-4 py-2 font-medium">Phase ID</th>
                                <th className="px-4 py-2 font-medium">Duration (s)</th>
                                <th className="px-4 py-2 font-medium">Signal Def</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {simData.simulation_log.map((log, i) => (
                                <tr key={i} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-4 py-2 font-mono text-xs">{log.episode}</td>
                                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground truncate max-w-[120px]" title={log.junction_id}>
                                        {log.junction_id.slice(-8)}
                                    </td>
                                    <td className="px-4 py-2">{log.phase_id}</td>
                                    <td className="px-4 py-2 font-medium">{log.duration.toFixed(1)}s</td>
                                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                                        {simData.phase_definitions[log.junction_id]?.[log.phase_id] || "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
           </>
       )}

       {/* Metrics Overview */}
       <div className="grid grid-cols-1 md://grid-cols-2 lg:grid-cols-4 gap-4">
           {data.waiting_time_comparison.map((m, i) => (
               <MetricCard 
                  key={i} 
                  title="Avg Waiting Time" 
                  baseline={m.baseline} 
                  rl={m.rl} 
                  improvement={m.improvement_pct} 
                  unit="s"
               />
           ))}
           {data.queue_length_comparison.map((m, i) => (
               <MetricCard 
                  key={i} 
                  title="Avg Queue Length" 
                  baseline={m.baseline} 
                  rl={m.rl} 
                  improvement={m.improvement_pct} 
                  unit="veh"
               />
           ))}
       </div>

       {/* Visual Plots & Simulation Trigger */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="space-y-6">
                <PlotCard 
                    title="Training Progress" 
                    src={getPlotUrl(projectId, "reward_vs_episode.png")} 
                    alt="Reward vs Episode"
                />
                <PlotCard 
              title="Metric Comparison" 
              src={getPlotUrl(projectId, "waiting_time_comparison.png")} 
              alt="Waiting Time Comparison"
           />
                
                {/* Simulation Trigger Card */}
                <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                    <div className="border-b border-border px-4 py-3 font-medium text-sm flex justify-between items-center">
                        <span className="flex items-center gap-2">
                           <Play size={16} className="text-primary" /> Run New Simulation
                        </span>
                        {isRunningSim && <Loader2 className="animate-spin text-muted-foreground" size={14} />}
                    </div>
                    <div className="p-4 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Trigger a new SUMO simulation run using the trained models to generate fresh metrics and logs.
                        </p>
                        
                        <div className="bg-slate-950 rounded-md border border-slate-800 flex flex-col overflow-hidden h-48">
                             <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center gap-2">
                                <Terminal size={12} className="text-slate-400" />
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Simulation Output</span>
                             </div>
                             <div className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1 text-slate-300">
                                {simLogs.length === 0 ? (
                                    <span className="text-slate-600 italic">Ready to run...</span>
                                ) : (
                                    simLogs.map((log, i) => (
                                        <div key={i} className="break-words">{log}</div>
                                    ))
                                )}
                                <div ref={logEndRef} />
                             </div>
                        </div>

                        <button 
                           onClick={handleRunSimulation}
                           disabled={isRunningSim}
                           className="w-full bg-primary text-primary-foreground py-2 text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {isRunningSim ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
                            {isRunningSim ? "Running Simulation..." : "Start Simulation"}
                        </button>
                    </div>
                </div>
           </div>

           
       </div>
    </div>
  )
}

function MetricCard({ title, baseline, rl, improvement, unit }: any) {
    const isPositive = improvement > 0
    
    // Helper to format numbers safely
    const format = (val: any) => {
        if (val === null || val === undefined) return "N/A"
        return typeof val === 'number' ? val.toFixed(2) : val
    }

    return (
        <div className="bg-card p-4 rounded-lg border border-border shadow-sm">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">{title}</h4>
            <div className="flex items-end justify-between">
                <div>
                   <div className="text-2xl font-bold">{format(rl)}<span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span></div>
                   <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                       Baseline: <span className="font-mono">{format(baseline)}</span>
                   </div>
                </div>
                <div className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                    {isPositive ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                    {improvement !== null && improvement !== undefined ? Math.abs(improvement).toFixed(1) : '-'}%
                </div>
            </div>
        </div>
    )
}

function PlotCard({ title, src, alt }: { title: string, src: string, alt: string }) {
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border px-4 py-3 font-medium text-sm">
                {title}
            </div>
            <div className="p-4 bg-white flex items-center justify-center min-h-[300px]">
                {/* Use a normal img tag for external backend images to avoid Next.js image domain config issues for localhost */}
                <img 
                   src={src} 
                   alt={alt} 
                   className="max-w-full h-auto object-contain"
                   onError={(e) => {
                       (e.target as HTMLImageElement).style.display = 'none';
                       (e.target as HTMLImageElement).parentElement!.innerText = "Plot not available yet";
                   }}
                />
            </div>
        </div>
    )
}
