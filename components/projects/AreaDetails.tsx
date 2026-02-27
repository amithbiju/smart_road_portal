"use client"

import { useState } from "react"
import { MapPin, RefreshCw, Layers, CheckCircle, Save, Loader2, MapPinned, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"
import { AreaStats, Bounds } from "@/types"

type SelectionMode = 'draw' | 'coordinates'

interface AreaDetailsProps {
  bounds: Bounds | null
  stats: AreaStats | null
  loading?: boolean
  onAnalyze?: () => void
  onSave?: (name: string) => void
  onManualBounds?: (bounds: Bounds) => void
  saving?: boolean
  selectionMode?: SelectionMode
  onSelectionModeChange?: (mode: SelectionMode) => void
}

export function AreaDetails({ bounds, stats, loading, onAnalyze, onSave, onManualBounds, saving, selectionMode = 'draw', onSelectionModeChange }: AreaDetailsProps) {
  const [areaName, setAreaName] = useState("")

  // Coordinate input state
  const [southLat, setSouthLat] = useState("")
  const [northLat, setNorthLat] = useState("")
  const [westLng, setWestLng] = useState("")
  const [eastLng, setEastLng] = useState("")
  const [coordError, setCoordError] = useState<string | null>(null)

  const canSave = bounds && areaName.length > 0;

  const handleApplyCoordinates = () => {
    setCoordError(null)

    const south = parseFloat(southLat)
    const north = parseFloat(northLat)
    const west = parseFloat(westLng)
    const east = parseFloat(eastLng)

    if (isNaN(south) || isNaN(north) || isNaN(west) || isNaN(east)) {
      setCoordError("All coordinate fields are required.")
      return
    }

    if (south < -90 || south > 90 || north < -90 || north > 90) {
      setCoordError("Latitude must be between -90 and 90.")
      return
    }
    if (west < -180 || west > 180 || east < -180 || east > 180) {
      setCoordError("Longitude must be between -180 and 180.")
      return
    }

    if (south >= north) {
      setCoordError("Min Latitude must be less than Max Latitude.")
      return
    }
    if (west >= east) {
      setCoordError("Min Longitude must be less than Max Longitude.")
      return
    }

    if (onManualBounds) {
      onManualBounds({ south, north, west, east })
    }
  }

  return (
    <div className="w-80 border-l border-border bg-card p-4 flex flex-col h-full sticky top-0 overflow-y-auto">
      <div className="mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <MapPin size={18} />
          Area Details
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {selectionMode === 'draw'
            ? 'Draw a box on the map to analyze a region.'
            : 'Enter coordinates to define the region.'}
        </p>
      </div>

      {/* Selection Mode Toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden mb-5">
        <button
          onClick={() => onSelectionModeChange?.('draw')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
            selectionMode === 'draw'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <MapPinned size={14} />
          Draw on Map
        </button>
        <button
          onClick={() => onSelectionModeChange?.('coordinates')}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors",
            selectionMode === 'coordinates'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Keyboard size={14} />
          Enter Coordinates
        </button>
      </div>

      <div className="space-y-6 flex-1">
        {/* Coordinate Input Form (only in coordinates mode) */}
        {selectionMode === 'coordinates' && (
          <div className="bg-muted/20 p-4 rounded-lg border border-border space-y-3">
            <div className="text-sm font-medium mb-1">Bounding Box Coordinates</div>
            <div className="grid grid-cols-2 gap-3">
              <CoordInput label="Min Lat (S)" value={southLat} onChange={setSouthLat} placeholder="e.g. 8.50" />
              <CoordInput label="Max Lat (N)" value={northLat} onChange={setNorthLat} placeholder="e.g. 8.55" />
              <CoordInput label="Min Lng (W)" value={westLng} onChange={setWestLng} placeholder="e.g. 76.90" />
              <CoordInput label="Max Lng (E)" value={eastLng} onChange={setEastLng} placeholder="e.g. 76.95" />
            </div>

            {coordError && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">{coordError}</p>
            )}

            <button
              onClick={handleApplyCoordinates}
              className="w-full flex items-center justify-center gap-2 py-2 mt-2 bg-primary/10 text-primary border border-primary/30 rounded-md text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              <Layers size={14} />
              Apply Coordinates
            </button>
          </div>
        )}

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

function CoordInput({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div>
      <label className="text-[11px] text-muted-foreground font-medium mb-1 block">{label}</label>
      <input
        type="number"
        step="any"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-mono shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
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
