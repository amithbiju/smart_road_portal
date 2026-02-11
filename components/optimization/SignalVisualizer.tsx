"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function SignalVisualizer({ isRunning }: { isRunning: boolean }) {
  const [activePhase, setActivePhase] = useState(0)
  
  // Mock phase cycling
  useEffect(() => {
    if (!isRunning) return
    
    // Cycle every 1.5s for visuals
    const interval = setInterval(() => {
       setActivePhase(prev => (prev + 1) % 4)
    }, 1500)
    
    return () => clearInterval(interval)
  }, [isRunning])

  return (
    <div className="flex-1 bg-slate-50 relative flex items-center justify-center overflow-hidden">
       {/* Instruction Overlay */}
       {!isRunning && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-10">
             <div className="text-muted-foreground text-sm font-medium">
                Run optimization to view simulation
             </div>
          </div>
       )}
    
       {/* Simple SVG Junction Diagram */}
       <div className="w-[80%] aspect-square max-w-[500px] relative">
          <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-lg">
             {/* Roads */}
             <rect x="0" y="160" width="400" height="80" fill="#cbd5e1" />{/* Horizontal */}
             <rect x="160" y="0" width="80" height="400" fill="#cbd5e1" />{/* Vertical */}
             
             {/* Intersection Patch */}
             <rect x="160" y="160" width="80" height="80" fill="#94a3b8" />
             
             {/* Lane Markings */}
             <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="2" strokeDasharray="10 10" />
             <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="2" strokeDasharray="10 10" />
             
             {/* Stop Lines */}
             <line x1="150" y1="200" x2="150" y2="240" stroke="white" strokeWidth="4" /> {/* West */}
             <line x1="250" y1="160" x2="250" y2="200" stroke="white" strokeWidth="4" /> {/* East */}
             <line x1="160" y1="150" x2="200" y2="150" stroke="white" strokeWidth="4" /> {/* North */}
             <line x1="200" y1="250" x2="240" y2="250" stroke="white" strokeWidth="4" /> {/* South */}
             
             {/* Vehicles (Animated mock) */}
             {isRunning && (
                <>
                   {/* Eastbound */}
                   <motion.circle 
                     r="6" fill="#ef4444" 
                     initial={{ cx: 0, cy: 185 }} 
                     animate={{ cx: 400 }} 
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                    />
                   {/* Southbound */}
                   <motion.circle 
                     r="6" fill="#3b82f6" 
                     initial={{ cx: 185, cy: 0 }} 
                     animate={{ cx: 185, cy: 400 }} 
                     transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 1 }} 
                    />
                </>
             )}
             
             {/* Signals */}
             {/* North Signal */}
             <g transform="translate(250, 120)">
                <rect width="20" height="50" rx="4" fill="#1e293b" />
                <circle cx="10" cy="12" r="6" fill={activePhase === 0 ? "#ef4444" : "#334155"} />{/* Red */}
                <circle cx="10" cy="38" r="6" fill={activePhase === 2 ? "#22c55e" : "#334155"} />{/* Green */}
             </g>
             
             {/* East Signal */}
             <g transform="translate(280, 250) rotate(90)">
                <rect width="20" height="50" rx="4" fill="#1e293b" />
                <circle cx="10" cy="12" r="6" fill={activePhase === 1 ? "#ef4444" : "#334155"} />
                <circle cx="10" cy="38" r="6" fill={activePhase === 3 ? "#22c55e" : "#334155"} />
             </g>
             
          </svg>
       </div>
       
       {/* Legend */}
       <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur rounded p-2 text-xs border border-border">
          <div className="font-semibold mb-1">Phase Status</div>
          <div className="flex gap-2 items-center">
             <div className="w-2 h-2 rounded-full bg-green-500" />
             Phase {activePhase + 1}
          </div>
       </div>
    </div>
  )
}
