import { cn } from "@/lib/utils"
import { CheckCircle2, Cloud, Server } from "lucide-react"

export function StatusWidgets() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatusCard 
        label="Traffic API" 
        status="Connected" 
        icon={Cloud} 
        active={true}
      />
      <StatusCard 
        label="Optimization Engine" 
        status="Idle" 
        icon={Server} 
        active={false}
      />
      <StatusCard 
        label="System Health" 
        status="Healthy" 
        icon={CheckCircle2} 
        active={true}
      />
       {/* Placeholder for project count or other metric */}
       <div className="bg-card rounded-lg p-4 border border-border shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Total Projects</div>
            <div className="text-2xl font-bold mt-1">2</div>
          </div>
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <span className="font-bold">#</span>
          </div>
       </div>
    </div>
  )
}

function StatusCard({ 
  label, 
  status, 
  icon: Icon, 
  active 
}: { 
  label: string, 
  status: string, 
  icon: any, 
  active: boolean 
}) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2 rounded-md",
          active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
        )}>
          <Icon size={20} />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="font-medium flex items-center gap-2">
            {status}
            {active && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
