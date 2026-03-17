"use client"

import { Play, Route, Settings2 } from "lucide-react"
import { useState } from "react"

export interface LaneOptParams {
    maxStandardLanes: number;
    flyoverSpeedLimit: number;
    landAcqCostFactor: number;
    flyoverMinCongestion: number;
}

export function LaneInputs({ onRun, isRunning }: { onRun: (params: LaneOptParams) => void, isRunning: boolean }) {
  const [params, setParams] = useState<LaneOptParams>({
      maxStandardLanes: 4,
      flyoverSpeedLimit: 27.78,
      landAcqCostFactor: 4.5,
      flyoverMinCongestion: 0.4
  })

  const handleChange = (field: keyof LaneOptParams, value: string) => {
      setParams(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

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
             <Settings2 size={16} /> Civil Engineering Constraints
          </div>
          
          <div className="space-y-3">
             <InputGroup 
                 label="Max Standard Lanes" 
                 value={params.maxStandardLanes} 
                 onChange={(v) => handleChange('maxStandardLanes', v)}
                 disabled={isRunning} 
             />
             <InputGroup 
                 label="Flyover Speed Limit (m/s)" 
                 value={params.flyoverSpeedLimit} 
                 onChange={(v) => handleChange('flyoverSpeedLimit', v)}
                 disabled={isRunning} 
             />
          </div>
       </div>

       <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
             <Settings2 size={16} /> Cost & Trigger Parameters
          </div>
          
          <div className="space-y-3">
             <InputGroup 
                 label="Land Acq. Cost Multiplier" 
                 value={params.landAcqCostFactor} 
                 onChange={(v) => handleChange('landAcqCostFactor', v)}
                 disabled={isRunning} 
             />
             <InputGroup 
                 label="Min Congestion triggering Flyover" 
                 value={params.flyoverMinCongestion} 
                 onChange={(v) => handleChange('flyoverMinCongestion', v)}
                 disabled={isRunning} 
             />
          </div>
       </div>

       <div className="pt-4 border-t border-border">
          <button 
             onClick={() => onRun(params)}
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

function InputGroup({ label, value, onChange, disabled }: { label: string, value: number, onChange: (v: string) => void, disabled: boolean }) {
    return (
        <div className="space-y-1">
            <label className="text-xs text-muted-foreground">{label}</label>
            <input 
               type="number" 
               step="any"
               className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
               value={value} 
               onChange={(e) => onChange(e.target.value)}
               disabled={disabled}
            />
        </div>
    )
}
