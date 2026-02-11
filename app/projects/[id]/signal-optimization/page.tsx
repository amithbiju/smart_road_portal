"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { getProject } from "@/lib/firebase-services"
import { Project } from "@/types"
import { BrainCircuit, BarChart3, Settings2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { TrainingTab } from "@/components/optimization/TrainingTab"
import { ResultsTab } from "@/components/optimization/ResultsTab"

export default function SignalOptimizationPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = useState<Project | null>(null)
  const [activeTab, setActiveTab] = useState<'training' | 'results'>('training')

  useEffect(() => {
    async function load() {
        if (projectId) {
            const p = await getProject(projectId)
            setProject(p)
        }
    }
    load()
  }, [projectId])

  if (!project) return <div className="p-10 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
        {/* Header Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b border-border px-6 pt-4">
            <TabButton 
               label="Training & Configuration" 
               icon={Settings2} 
               isActive={activeTab === 'training'} 
               onClick={() => setActiveTab('training')}
            />
            <TabButton 
               label="Results & Analysis" 
               icon={BarChart3} 
               isActive={activeTab === 'results'} 
               onClick={() => setActiveTab('results')}
            />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-10">
            {activeTab === 'training' ? (
                <TrainingTab project={project} projectId={projectId} />
            ) : (
                <ResultsTab projectId={projectId} />
            )}
        </div>
    </div>
  )
}

function TabButton({ label, icon: Icon, isActive, onClick }: any) {
    return (
        <button
           onClick={onClick}
           className={cn(
               "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-[2px]",
               isActive 
                 ? "border-primary text-primary" 
                 : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
           )}
        >
            <Icon size={16} />
            {label}
        </button>
    )
}
