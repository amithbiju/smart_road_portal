"use client"

import { useState } from "react"
import { Play, Grid } from "lucide-react"

export function RoadGenInputs({ onRun, isRunning }: { onRun: () => void, isRunning: boolean }) {
  return (
    <div className="space-y-6">
       
       <div className="space-y-4">
          <label className="text-sm font-medium">Network Type</label>
          <div className="grid grid-cols-2 gap-2">
             <button className="h-10 border border-primary bg-primary/5 text-primary rounded-md text-sm font-medium">Grid</button>
             <button className="h-10 border border-input bg-card hover:bg-muted rounded-md text-sm text-muted-foreground">Organic</button>
          </div>
       </div>
       
       <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
             <Grid size={16} /> Parameters
          </div>
          
          <div className="space-y-3">
             <InputGroup label="Construction Cost Cap ($M)" defaultValue="50" disabled={isRunning} />
             <InputGroup label="Min Block Size (m)" defaultValue="120" disabled={isRunning} />
             <InputGroup label="Road Density (km/km²)" defaultValue="15" disabled={isRunning} />
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
                   <Grid className="animate-spin" size={18} />
                   Generating...
                </>
             ) : (
                <>
                   <Play size={18} className="fill-current" />
                   Generate Network
                </>
             )}
          </button>
       </div>
    </div>
  )
}

function InputGroup({ label, defaultValue, disabled }: { label: string, defaultValue: string, disabled: boolean }) {
    return (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{label}</label>
            <input 
               type="text" 
               className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
               defaultValue={defaultValue} 
               disabled={disabled}
            />
        </div>
    )
}
