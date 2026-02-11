"use client"

import { useState } from "react"
import { SectionLayout } from "@/components/shared/SectionLayout"
import { LogStream } from "@/components/shared/LogStream"
import { LaneInputs } from "@/components/optimization/LaneInputs"
import { LaneVisualizer } from "@/components/optimization/LaneVisualizer"
import { LogEntry } from "@/types"
import { LOG_TEMPLATES, METRICS_DATA } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react"

export default function LanePlanningPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleRun = () => {
    setIsRunning(true)
    setLogs([])
    setShowResults(false)
    
    // Simulate logging
    let step = 0
    const interval = setInterval(() => {
       const timestamp = new Date().toLocaleTimeString('en-US', {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})
       
       if (step < 3) {
          addLog("Analyzing current road capacity...", 'info', timestamp)
       } else if (step < 8) {
          addLog(`Evaluating route cost-benefit (Iteration ${step})...`, 'info', timestamp)
       } else {
          addLog("Proposal generated. 2 Lane additions, 1 Flyover.", 'success', timestamp)
          setIsRunning(false)
          setShowResults(true)
          clearInterval(interval)
       }
       step++
    }, 800)
  }
  
  const addLog = (msg: string, level: LogEntry['level'], timestamp: string) => {
    setLogs(prev => [...prev, {
       id: Math.random().toString(),
       timestamp,
       level,
       message: msg
    }])
  }

  return (
    <SectionLayout 
       title="Lane Addition & Flyover Planning"
       status={isRunning ? "Planning..." : showResults ? "Completed" : "Idle"}
       inputs={<LaneInputs onRun={handleRun} isRunning={isRunning} />}
       visualizer={<LaneVisualizer isRunning={isRunning} />}
       logs={
          <>
             <LogStream logs={logs} isRunning={isRunning} />
             {showResults && <ResultMetrics />}
          </>
       }
    />
  )
}

function ResultMetrics() {
    const metrics = METRICS_DATA["Lane Planning"]
    return (
        <div className="p-4 bg-muted/20 border-t border-border space-y-3">
            <h4 className="font-medium text-sm">Projected Outcomes</h4>
            <div className="space-y-2">
                {metrics.map((m, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-card p-2 rounded border border-border">
                        <span className="text-muted-foreground">{m.label}</span>
                        <div className="flex items-center gap-2 font-mono font-medium">
                            {m.value}
                            {m.trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
                            {m.trend === 'down' && <TrendingDown size={14} className="text-red-500" />}
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full text-xs text-primary hover:underline text-center mt-2">
                Download Detailed Report
            </button>
        </div>
    )
}
