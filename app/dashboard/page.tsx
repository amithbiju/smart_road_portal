import { StatusWidgets } from "@/components/dashboard/StatusWidgets"
import { ActiveProjects } from "@/components/dashboard/ActiveProjects"
import { RecentRuns } from "@/components/dashboard/RecentRuns"
import { Plus } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your traffic optimization projects.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors shadow-sm font-medium">
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      <StatusWidgets />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px]">
          <ActiveProjects />
        </div>
        <div className="lg:col-span-1 h-[500px]">
          <RecentRuns />
        </div>
      </div>
    </div>
  )
}
