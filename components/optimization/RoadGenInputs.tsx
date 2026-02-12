"use client"

import { useState } from "react"
import { Play, Grid, Loader2, SlidersHorizontal } from "lucide-react"

// These match the cost parameters in road-gen.py
export interface RoadGenParams {
  gridRes: number
  costObstacle: number
  costExistingRoad: number
  costCongestionCore: number
  costCongestionNear: number
  costCongestionFar: number
  costEmpty: number
}

export const DEFAULT_PARAMS: RoadGenParams = {
  gridRes: 5.0,
  costObstacle: 9999,
  costExistingRoad: 60,
  costCongestionCore: 200,
  costCongestionNear: 40,
  costCongestionFar: 5,
  costEmpty: 1,
}

interface Props {
  onRun: (params: RoadGenParams) => void
  isRunning: boolean
}

export function RoadGenInputs({ onRun, isRunning }: Props) {
  const [params, setParams] = useState<RoadGenParams>({ ...DEFAULT_PARAMS })

  const update = (key: keyof RoadGenParams, value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      setParams(prev => ({ ...prev, [key]: num }))
    }
  }

  return (
    <div className="space-y-5">
       {/* Algorithm Parameters */}
       <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
             <SlidersHorizontal size={16} />
             Road Generation Parameters
          </div>
          
          <div className="space-y-3">
             <InputGroup 
                label="Grid Resolution (m)" 
                tooltip="Size of each grid cell in meters. Smaller = more accurate but slower."
                value={params.gridRes} 
                onChange={v => update('gridRes', v)}
                disabled={isRunning} 
             />
          </div>
       </div>

       {/* Cost Function */}
       <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground pb-2 border-b border-border">
             <Grid size={16} />
             Cost Function Weights
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed">
            Higher costs make the algorithm avoid those zones more aggressively. The bypass road will swing wider around congestion with higher core/near values.
          </p>
          
          <div className="space-y-3">
             <InputGroup 
                label="Congestion Core Cost" 
                tooltip="Cost for the inner congestion zone (forbidden zone around bottleneck)."
                value={params.costCongestionCore} 
                onChange={v => update('costCongestionCore', v)}
                disabled={isRunning} 
             />
             <InputGroup 
                label="Congestion Near Cost" 
                tooltip="Cost for the zone close to congestion. High values push the bypass further away."
                value={params.costCongestionNear} 
                onChange={v => update('costCongestionNear', v)}
                disabled={isRunning} 
             />
             <InputGroup 
                label="Congestion Far Cost" 
                tooltip="Influence zone cost. Slight drag to discourage paths near congestion."
                value={params.costCongestionFar} 
                onChange={v => update('costCongestionFar', v)}
                disabled={isRunning} 
             />
             <InputGroup 
                label="Existing Road Cost" 
                tooltip="Penalty for overlapping with existing roads."
                value={params.costExistingRoad} 
                onChange={v => update('costExistingRoad', v)}
                disabled={isRunning} 
             />
             <InputGroup 
                label="Empty Space Cost" 
                tooltip="Base cost for open terrain. Lower = cheaper to build on empty land."
                value={params.costEmpty} 
                onChange={v => update('costEmpty', v)}
                disabled={isRunning} 
             />
          </div>
       </div>

       {/* Run Button */}
       <div className="pt-4 border-t border-border">
          <button 
             onClick={() => onRun(params)}
             disabled={isRunning}
             className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md font-medium text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
             {isRunning ? (
                <>
                   <Loader2 className="animate-spin" size={18} />
                   Generating...
                </>
             ) : (
                <>
                   <Play size={18} className="fill-current" />
                   Generate Road Network
                </>
             )}
          </button>
          
          <button
            onClick={() => setParams({ ...DEFAULT_PARAMS })}
            disabled={isRunning}
            className="w-full mt-2 h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
          >
            Reset to Defaults
          </button>
       </div>
    </div>
  )
}

function InputGroup({ label, tooltip, value, onChange, disabled }: { 
  label: string
  tooltip?: string
  value: number
  onChange: (val: string) => void
  disabled: boolean 
}) {
    return (
        <div className="space-y-1 group">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground">{label}</label>
              {tooltip && (
                <span className="relative cursor-help">
                  <span className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors">ⓘ</span>
                  <span className="absolute right-0 bottom-full mb-1 w-48 p-2 bg-popover text-popover-foreground text-[11px] rounded-md shadow-lg border opacity-0 group-hover:opacity-100 pointer-events-none z-50 leading-tight">
                    {tooltip}
                  </span>
                </span>
              )}
            </div>
            <input 
               type="number" 
               step="any"
               className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
               value={value} 
               onChange={(e) => onChange(e.target.value)}
               disabled={disabled}
            />
        </div>
    )
}
