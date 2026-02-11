"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-muted/50 rounded-lg border border-border">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="animate-spin" size={24} />
        <span className="text-sm">Loading Map...</span>
      </div>
    </div>
  ),
})

export default Map
