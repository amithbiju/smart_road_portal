"use client"

import { useEffect, useState } from "react"
import { getProjects } from "@/lib/firebase-services"
import { Project } from "@/types"
import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog"
import { Calendar, MapPin, ArrowRight, Loader2, FolderOpen } from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProjects = async () => {
    setLoading(true)
    const data = await getProjects()
    setProjects(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your traffic optimization studies.
          </p>
        </div>
        <CreateProjectDialog onProjectCreated={fetchProjects} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
           <Loader2 className="animate-spin mr-2" /> Loading projects...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
             <div className="col-span-full text-center py-20 border border-dashed border-border rounded-lg bg-muted/10">
                <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
                <h3 className="text-lg font-medium">No projects found</h3>
                <p className="text-muted-foreground mb-4 max-w-sm mx-auto">Get started by creating your first traffic optimization project.</p>
             </div>
          ) : (
             projects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-card rounded-lg border border-border shadow-sm p-6 hover:border-primary/50 transition-all group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-primary/10 text-primary rounded-md">
                       <FolderOpen size={24} />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                       {project.id.slice(0, 8)}...
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">{project.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-6">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} />
                      <span>{project.areas.length} Areas</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/projects/${project.id}/area`}
                    className="w-full mt-auto flex items-center justify-center gap-2 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md font-medium text-sm transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Open Project <ArrowRight size={16} />
                  </Link>
                </div>
             ))
          )}
        </div>
      )}
    </div>
  )
}
