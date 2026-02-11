import Link from "next/link"
import { MOCK_PROJECTS } from "@/lib/mock-data"
import { ArrowRight, MapPin, Calendar, MoreHorizontal } from "lucide-react"

export function ActiveProjects() {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-lg">Active Projects</h3>
        <button className="text-sm text-primary hover:underline flex items-center gap-1">
          View All <ArrowRight size={14} />
        </button>
      </div>
      
      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[400px]">
        {MOCK_PROJECTS.map((project) => (
          <div 
            key={project.id} 
            className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer"
          >
            <div className="mb-3 sm:mb-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-foreground">{project.name}</h4>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs rounded-full">
                  In Progress
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{project.description}</p>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>{project.areas.length} Areas</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                href={`/projects/${project.id}/area`}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-md shadow hover:bg-primary/90 transition-colors"
              >
                Open Project
              </Link>
              <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-md display-none sm:block">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>
        ))}
        
        {MOCK_PROJECTS.length === 0 && (
           <div className="text-center py-8 text-muted-foreground">
             No active projects found.
           </div>
        )}
      </div>
    </div>
  )
}
