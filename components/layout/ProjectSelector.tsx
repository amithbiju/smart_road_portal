"use client"

import { useEffect, useState } from "react"
import { getProjects } from "@/lib/firebase-services"
import { Project } from "@/types"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, Folder, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

export function ProjectSelector() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  
  // Extract project ID from URL if present
  // /projects/[id]/...
  const currentProjectId = pathname.split('/')[2]
  const currentProject = projects.find(p => p.id === currentProjectId)

  useEffect(() => {
    getProjects().then(setProjects)
  }, [])

  // Close dropdown when clicking outside would be handled by a click-outside hook in prod
  // For now we rely on simple toggling

  const handleSelect = (projectId: string) => {
    setIsOpen(false)
    // If we are already in a project context, switch while keeping the sub-route (e.g. area, signal-optimization)
    // If not, go to the area page of the new project
    const segments = pathname.split('/')
    if (segments[1] === 'projects' && segments[2]) {
       segments[2] = projectId
       router.push(segments.join('/'))
    } else {
       router.push(`/projects/${projectId}/area`)
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-muted text-sm border border-transparent hover:border-border transition-all"
      >
        <div className="h-6 w-6 bg-primary/10 text-primary rounded flex items-center justify-center">
           <Folder size={14} />
        </div>
        <span className="font-medium max-w-[150px] truncate">
           {currentProject ? currentProject.name : "Select Project"}
        </span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-card rounded-lg border border-border shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
           <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border">
              Switch Project
           </div>
           
           <div className="max-h-[300px] overflow-y-auto">
              {projects.map(p => (
                 <button
                    key={p.id}
                    onClick={() => handleSelect(p.id)}
                    className={cn(
                       "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center gap-2",
                       currentProjectId === p.id && "bg-primary/5 text-primary font-medium"
                    )}
                 >
                    <Folder size={14} className={cn("shrink-0", currentProjectId === p.id ? "text-primary" : "text-muted-foreground")} />
                    <span className="truncate">{p.name}</span>
                 </button>
              ))}
              
              {projects.length === 0 && (
                 <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                    No projects found
                 </div>
              )}
           </div>

           <div className="p-2 border-t border-border mt-1">
              <button 
                 onClick={() => router.push('/projects')}
                 className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-md transition-colors"
              >
                 <Plus size={14} /> See All Projects
              </button>
           </div>
        </div>
      )}
    </div>
  )
}
