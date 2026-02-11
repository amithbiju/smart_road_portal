"use client"

import { useState } from "react"
import { MapPin, RefreshCw, Layers, CheckCircle, Save, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AreaStats, Bounds } from "@/types"

interface AreaDetailsProps {
  bounds: Bounds | null
  stats: AreaStats | null
  loading?: boolean
  onAnalyze?: () => void
  onSave?: (name: string) => void
  saving?: boolean
}

export function AreaDetails({ bounds, stats, loading, onAnalyze, onSave, saving }: AreaDetailsProps) {
  const [trafficEnabled, setTrafficEnabled] = useState(false)
  const [areaName, setAreaName] = useState("")

  const canSave = bounds && areaName.length > 0;

  return (
    <div className="w-80 border-l border-border bg-card p-4 flex flex-col h-full sticky top-0 overflow-y-auto">
      <div className="mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MapPin size={18} />
          Area Details
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Draw a box on the map to analyze a region.
        </p>
      </div>

      <div className="space-y-6 flex-1">
        {/* Selection Status */}
        <div className="bg-muted/30 p-4 rounded-lg border border-border">
          <div className="text-sm font-medium mb-2">Selection Status</div>
          {bounds ? (
              <>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mb-2">
                    <CheckCircle size={16} />
                    <span>Region Defined</span>
                </div>
                <div className="text-xs text-muted-foreground font-mono bg-background p-2 rounded border border-border/50">
                    N: {bounds.north.toFixed(4)}, E: {bounds.east.toFixed(4)}<br/>
                    S: {bounds.south.toFixed(4)}, W: {bounds.west.toFixed(4)}
                </div>
              </>
          ) : (
              <div className="text-sm text-muted-foreground italic">No area selected</div>
          )}
        </div>

        {/* Junction Metrics */}
        {stats && (
            <div>
            <div className="text-sm font-medium mb-3">Detected Infrastructure</div>
            <div className="grid grid-cols-2 gap-3">
                <MetricItem label="Junctions" value={stats.junctions} />
                <MetricItem label="Signals" value={stats.signals} />
                <MetricItem label="Road Segs" value={stats.roadSegments} />
                <MetricItem label="Density" value={stats.trafficDensity + "%"} />
            </div>
            </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-border pt-4 space-y-3">
           <button 
              onClick={onAnalyze}
              disabled={!bounds || loading}
              className="w-full flex items-center justify-center gap-2 py-2 border border-border rounded-md text-sm hover:bg-muted transition-colors disabled:opacity-50"
           >
              <RefreshCw size={14} className={cn(loading && "animate-spin")} />
              {loading ? "Analyzing..." : "Analyze Infrastructure"}
           </button>
        </div>

        {/* Save Area */}
        <div className="border-t border-border pt-4">
             <div className="space-y-2">
                <label className="text-sm font-medium">Area Name</label>
                <input 
                    type="text" 
                    placeholder="e.g. East Fort Junction"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                />
             </div>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-border">
         <button 
            onClick={() => onSave && onSave(areaName)}
            disabled={!canSave || saving}
            className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 font-medium transition-colors disabled:opacity-50"
         >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Selection
         </button>
      </div>
    </div>
  )
}

function MetricItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div className="bg-background p-3 rounded-md border border-border shadow-sm text-center">
       <div className="text-xl font-bold text-foreground">{value}</div>
       <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
