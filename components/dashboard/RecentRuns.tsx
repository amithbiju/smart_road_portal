import { MOCK_RUNS } from "@/lib/mock-data"
import { Clock, CheckCircle2, XCircle, Loader2, Play } from "lucide-react"
import { cn } from "@/lib/utils"

export function RecentRuns() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-lg">Recent Simulation Runs</h3>
      </div>
      
      <div className="divide-y divide-border overflow-hidden rounded-b-lg">
        {MOCK_RUNS.map((run) => (
          <div key={run.runId} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={cn(
                "mt-0.5",
                run.status === 'completed' && "text-green-500",
                run.status === 'failed' && "text-red-500",
                run.status === 'running' && "text-blue-500",
              )}>
                {run.status === 'completed' && <CheckCircle2 size={18} />}
                {run.status === 'failed' && <XCircle size={18} />}
                {run.status === 'running' && <Loader2 size={18} className="animate-spin" />}
              </div>
              
              <div>
                <div className="font-medium text-sm text-foreground">{run.section}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                   <span className="font-mono">{run.runId}</span>
                   <span>•</span>
                   <span>{run.date}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
               <div className="text-sm font-medium">
                  {run.duration || "--"}
               </div>
               <div className="text-xs text-muted-foreground capitalize">
                  {run.status}
               </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-3 border-t border-border bg-muted/20 text-center">
         <button className="text-xs text-muted-foreground hover:text-foreground">View Full History</button>
      </div>
    </div>
  )
}
