"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionLayoutProps {
  inputs: ReactNode
  visualizer: ReactNode
  logs: ReactNode
  title: string
  status?: string
}

export function SectionLayout({ inputs, visualizer, logs, title, status }: SectionLayoutProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px] gap-4">
      <div className="flex items-center justify-between shrink-0">
         <h2 className="text-xl font-bold tracking-tight">{title}</h2>
         {status && (
            <div className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
               Status: {status}
            </div>
         )}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-full overflow-hidden">
         {/* Left: Inputs Panel */}
         <div className="w-full lg:w-80 shrink-0 flex flex-col bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 bg-muted/30 border-b border-border font-medium text-sm">
               Configuration
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
               {inputs}
            </div>
         </div>

         {/* Center: Visualizer */}
         <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden shadow-sm relative flex flex-col">
             {visualizer}
         </div>

         {/* Right: Logs & Metrics */}
         <div className="w-full lg:w-80 shrink-0 flex flex-col bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="p-3 bg-muted/30 border-b border-border font-medium text-sm">
               Simulation Logs & Metrics
            </div>
            <div className="flex-1 overflow-hidden flex flex-col">
               {logs}
            </div>
         </div>
      </div>
    </div>
  )
}
