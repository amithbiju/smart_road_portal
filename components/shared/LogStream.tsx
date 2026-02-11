"use client"

import { useEffect, useRef, useState } from "react"
import { LogEntry } from "@/types"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react"

export function LogStream({ 
   logs, 
   isRunning 
}: { 
  logs: LogEntry[]
  isRunning: boolean 
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-200 font-mono text-xs overflow-hidden">
       {/* Logs Area */}
       <div 
         ref={scrollRef}
         className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar"
       >
          {logs.length === 0 && !isRunning && (
             <div className="text-slate-500 italic text-center mt-10">
                Ready to start simulation...
             </div>
          )}

          {logs.map((log) => (
             <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={cn(
                   "break-words",
                   log.level === 'error' && "text-red-400",
                   log.level === 'warning' && "text-amber-400",
                   log.level === 'success' && "text-green-400",
                   log.level === 'info' && "text-slate-200"
                )}>
                   {log.level === 'error' && <AlertCircle className="inline w-3 h-3 mr-1" />}
                   {log.level === 'success' && <CheckCircle2 className="inline w-3 h-3 mr-1" />}
                   {log.message}
                </span>
             </div>
          ))}

          {isRunning && (
             <div className="flex gap-2 text-slate-400 animate-pulse">
                <span className="text-slate-500">[{new Date().toLocaleTimeString('en-US', {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                <span className="flex items-center gap-1">
                   Processing... <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                </span>
             </div>
          )}
       </div>
    </div>
  )
}
