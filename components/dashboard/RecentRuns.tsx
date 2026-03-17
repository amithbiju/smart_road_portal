import { getProjects } from "@/lib/firebase-services"
import { Clock, CheckCircle2, XCircle, Loader2, Play, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

export async function RecentRuns() {
  const projects = await getProjects();
  const allAreas = projects.flatMap(p => 
    (p.areas || []).map(a => ({
      ...a,
      projectId: p.id,
      projectName: p.name
    }))
  ).sort((a, b) => new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime())
   .slice(0, 5)

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-lg">Recent Simulation Runs / Areas</h3>
      </div>
      
      <div className="divide-y divide-border overflow-hidden rounded-b-lg flex-1 overflow-y-auto">
        {allAreas.map((area) => (
          <div key={area.id} className="p-4 hover:bg-muted/30 transition-colors flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-green-500">
                <CheckCircle2 size={18} />
              </div>
              
              <div>
                <div className="font-medium text-sm text-foreground">{area.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                   <span className="font-mono truncate w-20" title={area.projectId}>{area.projectId.substring(0,8)}</span>
                   <span>•</span>
                   <span className="line-clamp-1">{area.projectName}</span>
                </div>
              </div>
            </div>

            <div className="text-right">
               <div className="text-sm font-medium">
                  {area.createdAt ? new Date(area.createdAt).toLocaleDateString() : 'Unknown'}
               </div>
               <div className="text-xs text-muted-foreground capitalize flex justify-end mt-0.5 gap-1 items-center">
                  <MapPin size={12}/> Area
               </div>
            </div>
          </div>
        ))}

        {allAreas.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No recent areas found.
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-border bg-muted/20 text-center mt-auto">
         <button className="text-xs text-muted-foreground hover:text-foreground">View Full History</button>
      </div>
    </div>
  )
}
