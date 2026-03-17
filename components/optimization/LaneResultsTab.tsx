import { useState, useEffect } from "react"
import { Loader2, TrendingUp, TrendingDown, Clock, Download, PencilRuler, Terminal } from "lucide-react"

interface LaneResultsTabProps {
  projectId: string;
  selectedAreaId?: string;
}

const BACKEND_URL = "http://localhost:6002"

export function LaneResultsTab({ projectId, selectedAreaId }: LaneResultsTabProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [launchingNetedit, setLaunchingNetedit] = useState<string | null>(null)

  useEffect(() => {
    async function fetchResults() {
        if (!selectedAreaId) {
            setLoading(false)
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}/areas/${selectedAreaId}/results`)
            const json = await res.json()
            
            if (!res.ok) {
                throw new Error(json.error || "Area not processed yet")
            }
            
            setData(json)
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }
    fetchResults()
  }, [projectId, selectedAreaId])

  const handleDownload = (filename: string) => {
      window.open(`${BACKEND_URL}/api/projects/${projectId}/areas/${selectedAreaId}/files/${filename}`, '_blank')
  }

  const handleLaunchNetedit = async (mapType: 'original' | 'optimized') => {
      setLaunchingNetedit(mapType)
      try {
          await fetch(`${BACKEND_URL}/api/projects/${projectId}/areas/${selectedAreaId}/netedit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ mapType })
          })
      } catch (e) {
          console.error("Failed to launch netedit", e)
      } finally {
          setLaunchingNetedit(null)
      }
  }

  if (loading) {
     return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
  }

  if (error || !data) {
      return (
          <div className="h-96 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-lg">
              <p>{error || "No results found for this area."}</p>
              <p className="text-sm mt-2">Run the Planning tool first to generate structural optimizations.</p>
          </div>
      )
  }

  const travelTimeVal = parseFloat(data.stats.travelTime)
  const congestionVal = parseFloat(data.stats.congestion)
  const travelTrend = travelTimeVal > 0 ? "up" : "down"
  const constTrend = congestionVal > 0 ? "up" : "down"

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
       
       {/* Metrics Overview */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex items-center justify-between">
                <div>
                   <h4 className="text-sm font-medium text-muted-foreground mb-1">Travel Time</h4>
                   <div className="text-2xl font-bold flex items-center gap-2">
                       {data.stats.travelTime}
                       {travelTrend === 'up' && <TrendingUp size={20} className="text-green-500" />}
                       {travelTrend === 'down' && <TrendingDown size={20} className="text-red-500" />}
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">Compared to Baseline</p>
                </div>
                <Clock className="text-muted-foreground opacity-20" size={48} />
            </div>

            <div className="bg-card p-4 rounded-lg border border-border shadow-sm flex items-center justify-between">
                <div>
                   <h4 className="text-sm font-medium text-muted-foreground mb-1">Congestion Reduction</h4>
                   <div className="text-2xl font-bold flex items-center gap-2">
                       {data.stats.congestion}
                       {constTrend === 'up' && <TrendingUp size={20} className="text-green-500" />}
                       {constTrend === 'down' && <TrendingDown size={20} className="text-red-500" />}
                   </div>
                   <p className="text-xs text-muted-foreground mt-1">Total intersection wait times</p>
                </div>
                <TrendingDown className="text-muted-foreground opacity-20" size={48} />
            </div>
       </div>

       {/* Maps & Tools */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Download & View Tools */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
                <div className="border-b border-border px-4 py-3 font-medium text-sm flex justify-between items-center">
                    Files & Analysis Tools
                </div>
                <div className="p-4 space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                        Download the raw OSM-extracted network or the AI-optimized final network. You can also launch <span className="font-mono text-primary bg-primary/10 px-1 rounded">netedit</span> directly to compare structural changes.
                    </p>
                    
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={() => handleDownload("map.net.xml")}
                            className="w-full bg-secondary text-secondary-foreground py-2 text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> Download Input Map (map.net.xml)
                        </button>
                        
                        <button 
                            onClick={() => handleDownload("best_map.net.xml")}
                            className="w-full bg-secondary text-secondary-foreground py-2 text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={16} /> Download Output Map (best_map.net.xml)
                        </button>
                        
                        <div className="relative py-2">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Local Tools</span></div>
                        </div>

                        <button 
                            onClick={() => handleLaunchNetedit('original')}
                            disabled={launchingNetedit !== null}
                            className="w-full bg-blue-600/10 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 py-2 text-sm font-medium rounded-md hover:bg-blue-600/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {launchingNetedit === 'original' ? <Loader2 className="animate-spin" size={16} /> : <PencilRuler size={16} />}
                            Open Original in Netedit
                        </button>
                        
                        <button 
                            onClick={() => handleLaunchNetedit('optimized')}
                            disabled={launchingNetedit !== null}
                            className="w-full bg-primary text-primary-foreground py-2 text-sm font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                        >
                            {launchingNetedit === 'optimized' ? <Loader2 className="animate-spin" size={16} /> : <PencilRuler size={16} />}
                            Open Optimized in Netedit
                        </button>
                    </div>
                </div>
            </div>

            {/* AI Logs */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm flex flex-col">
                 <div className="border-b border-border px-4 py-3 font-medium text-sm flex items-center gap-2">
                     <Terminal size={16} />
                     Training Episode Logs
                 </div>
                 <div className="flex-1 bg-slate-950 p-4 font-mono text-xs space-y-2 text-slate-300 overflow-y-auto max-h-[300px]">
                    {data.logs && data.logs.map((log: string, i: number) => (
                        <div key={i}>
                            <span className="text-slate-500 mr-2">{'>'}</span> {log}
                        </div>
                    ))}
                 </div>
            </div>
       </div>

       {/* Construction Logs Table */}
       {data.construction_logs && data.construction_logs.length > 0 && (
           <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm mt-6">
                <div className="border-b border-border px-4 py-3 font-medium text-sm flex items-center gap-2">
                    <PencilRuler size={16} />
                    AI Construction Decisions
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium">Episode Built</th>
                                <th className="px-4 py-3 font-medium">Modification Type</th>
                                <th className="px-4 py-3 font-medium">Target Edge / Corridor</th>
                                <th className="px-4 py-3 font-medium">Est. Cost Penalty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {data.construction_logs.map((log: any, i: number) => (
                                <tr key={i} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">Ep {log.episode}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                            log.type === 'Flyover' 
                                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 border border-orange-200 dark:border-orange-800'
                                        }`}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{log.target}</td>
                                    <td className="px-4 py-3 font-medium text-destructive">{log.cost} units</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
           </div>
       )}

    </div>
  )
}
