"use client"

import { useState } from "react"
import { SectionLayout } from "@/components/shared/SectionLayout"
import { LogStream } from "@/components/shared/LogStream"
import { RoadGenInputs } from "@/components/optimization/RoadGenInputs"
import Map from "@/components/map" // Reusing generic map for now
import { LogEntry } from "@/types"

export default function RoadGenPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const handleRun = () => {
    setIsRunning(true)
    setLogs([])
    
    // Simulate logging
    let step = 0
    const interval = setInterval(() => {
       const timestamp = new Date().toLocaleTimeString('en-US', {hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit'})
       
       if (step < 3) {
          addLog("Initializing geometry constraints...", 'info', timestamp)
       } else if (step < 6) {
          addLog(`Generative iteration ${step}...`, 'info', timestamp)
       } else {
          addLog("Network generated successfully.", 'success', timestamp)
          setIsRunning(false)
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
       title="Road Network Generation"
       status={isRunning ? "Generating..." : "Idle"}
       inputs={<RoadGenInputs onRun={handleRun} isRunning={isRunning} />}
       visualizer={<div className="h-full relative"><Map className="h-full rounded-none border-0" /></div>}
       logs={<LogStream logs={logs} isRunning={isRunning} />}
    />
  )
}
