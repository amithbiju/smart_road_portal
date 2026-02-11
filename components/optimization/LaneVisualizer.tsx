"use client"

import Map from "@/components/map"
import { Layers } from "lucide-react"

export function LaneVisualizer({ isRunning }: { isRunning: boolean }) {
  return (
    <div className="flex-1 relative bg-slate-100 flex flex-col">
       <Map className="flex-1 h-full rounded-none border-0" />
       
       <div className="absolute top-4 right-4 bg-card/90 backdrop-blur p-2 rounded-md border border-border shadow-sm flex flex-col gap-2 z-[400] text-xs">
          <div className="font-medium mb-1 flex items-center gap-1 border-b border-border pb-1">
             <Layers size={14} /> Layers
          </div>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
             <input type="checkbox" defaultChecked className="rounded border-gray-300 h-3 w-3" />
             Existing Roads <span className="w-3 h-1 bg-slate-400 ml-auto block rounded-full"></span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
             <input type="checkbox" defaultChecked className="rounded border-gray-300 h-3 w-3" />
             Proposed Lanes <span className="w-3 h-1 bg-blue-500 ml-auto block rounded-full"></span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded">
             <input type="checkbox" defaultChecked className="rounded border-gray-300 h-3 w-3" />
             Flyovers <span className="w-3 h-1 bg-orange-400 border-b border-dotted ml-auto block"></span>
          </label>
       </div>
    </div>
  )
}
