"use client"

import { Play, Route, Settings2 } from "lucide-react"

export function LaneInputs({ onRun, isRunning }: { onRun: () => void, isRunning: boolean }) {
  return (
    <div className="space-y-6">
       <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
             <label className="font-medium">Live Traffic Data</label>
             <input type="checkbox" className="h-4 w-4 rounded border-gray-300" defaultChecked disabled={isRunning} />
          </div>
       </div>

       <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
             <Settings2 size={16} /> Cost Parameters
          </div>
          
          <div className="space-y-3">
             <InputGroup label="Add. Lane Cost ($/km)" defaultValue="1.2M" disabled={isRunning} />
             <InputGroup label="Flyover Cost ($/km)" defaultValue="15M" disabled={isRunning} />
             <InputGroup label="Land Acq. Cost ($/m²)" defaultValue="850" disabled={isRunning} />
          </div>
       </div>

       <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
             <Settings2 size={16} /> Constraints
          </div>
          
          <div className="space-y-3">
             <InputGroup label="Max Flyovers" defaultValue="2" disabled={isRunning} />
             <InputGroup label="Max Land Use (m²)" defaultValue="5000" disabled={isRunning} />
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
                   <Route className="animate-pulse" size={18} />
                   Planning...
                </>
             ) : (
                <>
                   <Play size={18} className="fill-current" />
                   Run Planning
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
