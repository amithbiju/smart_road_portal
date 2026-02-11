"use client"

import { useState, useEffect } from "react"
import { getResults, getPlotUrl, ResultsResponse } from "@/lib/traffic-api"
import { Loader2, TrendingUp, TrendingDown, Clock, MoveRight } from "lucide-react"

interface ResultsTabProps {
  projectId: string
}

export function ResultsTab({ projectId }: ResultsTabProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ResultsResponse | null>(null)
  
  useEffect(() => {
    async function fetchResults() {
        try {
            const res = await getResults(projectId)
            setData(res)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    fetchResults()
  }, [projectId])

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
       {/* Metrics Overview */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

       {/* Visual Plots */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
