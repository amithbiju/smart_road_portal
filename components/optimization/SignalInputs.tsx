"use client"

import { useState } from "react"
import { Play, RotateCw } from "lucide-react"

export function SignalInputs({ onRun, isRunning }: { onRun: () => void, isRunning: boolean }) {
  const [junction, setJunction] = useState("J001")
  
  return (
    <div className="space-y-6">
       
       <div className="space-y-4">
          <label className="text-sm font-medium">Target Junction</label>
          <select 
             className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
             value={junction}
             onChange={(e) => setJunction(e.target.value)}
             disabled={isRunning}
          >
             <option value="J001">J_Central_Stk (Central Station)</option>
             <option value="J002">J_Pmg_Jnc (PMG Junction)</option>
             <option value="J003">J_Palayam (Palayam Underpass)</option>
          </select>
       </div>

       <div className="p-4 bg-muted/20 rounded-md border border-border space-y-4">
          <div className="flex items-center justify-between">
             <span className="font-medium text-sm">Phase Editor</span>
             <span className="text-xs text-muted-foreground">Cycle: 120s</span>
          </div>
          
          <div className="space-y-3">
             <div className="grid grid-cols-4 gap-2 text-xs text-center font-medium text-muted-foreground">
                <div className="col-span-1">Phase</div>
                <div>G(s)</div>
                <div>Y(s)</div>
                <div>R(s)</div>
             </div>
             
             {[1, 2, 3, 4].map(p => (
                <div key={p} className="grid grid-cols-4 gap-2 items-center">
                   <div className="text-xs font-mono ml-1">P{p}</div>
                   <input type="number" className="h-8 rounded border border-input px-2 text-center text-sm" defaultValue={25} disabled={isRunning} />
                   <input type="number" className="h-8 rounded border border-input px-2 text-center text-sm" defaultValue={4} disabled />
                   <input type="number" className="h-8 rounded border border-input px-2 text-center text-sm" defaultValue={91} disabled />
                </div>
             ))}
          </div>
       </div>

       <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-sm">
             <label className="font-medium">Use Live Traffic?</label>
             <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked disabled={isRunning} />
          </div>
          
          <div className="flex items-center justify-between text-sm">
             <label className="font-medium">Adaptive Control</label>
             <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked disabled={isRunning} />
          </div>
       </div>

       <div className="pt-4 border-t border-border">
          <button 
             onClick={onRun}
             disabled={isRunning}
             className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {isRunning ? (
                <>
                   <RotateCw className="animate-spin" size={18} />
                   Optimizing...
                </>
             ) : (
                <>
                   <Play size={18} className="fill-current" />
                   Run Optimization
                </>
             )}
          </button>
       </div>
    </div>
  )
}
