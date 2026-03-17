import { useState, useEffect } from "react"
import { Loader2, Download, Terminal, Settings2, BarChart3, AlertCircle, FileText } from "lucide-react"
import dynamic from "next/dynamic"
import type { PathOverlay } from "@/components/map/Map"

interface RoadGenResultsTabProps {
  projectId: string;
  selectedAreaId?: string;
  bounds?: { north: number; south: number; east: number; west: number };
}

const Map = dynamic(() => import('@/components/map/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div>
})

const BACKEND_URL = "http://localhost:6001"

export function RoadGenResultsTab({ projectId, selectedAreaId, bounds }: RoadGenResultsTabProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [overlays, setOverlays] = useState<PathOverlay[]>([])

  useEffect(() => {
    async function fetchResults() {
        if (!selectedAreaId) {
            setLoading(false)
            return
        }
        
        setLoading(true)
        setError(null)
        
        try {
            const res = await fetch(`${BACKEND_URL}/api/projects/${projectId}/areas/${selectedAreaId}/results`)
            const json = await res.json()
            
            if (!res.ok) {
                throw new Error(json.error || "Area not processed yet")
            }
            
            setData(json)
            
            if (json.overlays) {
                const newOverlays: PathOverlay[] = []
                
                Object.entries(json.overlays).forEach(([key, val]: [string, any]) => {
                    newOverlays.push({
                        id: key,
                        coordinates: val.coordinates,
                        color: val.color || (key.includes('red') || key.includes('congestion') ? '#ef4444' : key.includes('green') || key.includes('bypass') ? '#22c55e' : '#3b82f6'),
                        weight: val.weight || 6,
                        opacity: val.opacity || 0.9,
                        dashArray: val.dashArray,
                        label: val.label || key.replace(/_/g, ' ')
                    })
                })
                
                setOverlays(newOverlays)
            } else {
                setOverlays([])
            }
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }
    fetchResults()
  }, [projectId, selectedAreaId])

  const handleDownload = (filename: string) => {
      window.open(`${BACKEND_URL}/api/projects/${projectId}/areas/${selectedAreaId}/files/${filename}`, '_blank')
  }

  if (loading) {
     return <div className="flex flex-1 h-full items-center justify-center min-h-[400px] bg-card rounded-lg border border-border"><Loader2 className="animate-spin text-muted-foreground" size={32} /></div>
  }

  if (error || !data) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-muted-foreground bg-card border border-dashed border-border rounded-lg p-6 text-center">
              <AlertCircle className="mb-2 text-muted-foreground opacity-50" size={32} />
              <p className="font-medium text-foreground">{error === "Failed to fetch" ? "Cannot connect to backend server" : error || "No results found for this area."}</p>
              <p className="text-sm mt-2">Run the Generative AI tool first in the Planning Setup tab.</p>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 gap-6">
       
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* Map View */}
            <div className="lg:col-span-2 bg-card border border-border rounded-lg overflow-hidden flex flex-col relative z-0 shadow-sm">
                <div className="border-b border-border px-4 py-3 font-medium text-sm flex justify-between items-center">
                    Optimization Results Viewer
                </div>
                <div className="flex-1 relative bg-muted/10">
                    <Map 
                      className="h-full rounded-none border-0" 
                      center={bounds ? [(bounds.north + bounds.south) / 2, (bounds.east + bounds.west) / 2] : [8.5241, 76.9366]}
                      zoom={14}
                      bounds={bounds}
                      overlays={overlays}
                      fitToOverlays={overlays.length > 0}
                    />
                </div>
            </div>

            {/* Files Panel */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm flex flex-col">
                <div className="border-b border-border px-4 py-3 font-medium text-sm flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FileText size={16} />
                        Generated Files
                    </div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {data.files?.length || 0} files
                    </span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-muted/5">
                    {data.files && data.files.length > 0 ? (
                        data.files.map((file: any) => (
                            <div key={file.name} className="flex flex-col gap-3 p-3 border border-border rounded-md bg-card shadow-sm hover:border-primary/30 transition-colors group">
                                <div className="flex justify-between items-center">
                                    <span className="font-mono text-xs text-foreground truncate mr-2 font-medium" title={file.name}>{file.name}</span>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap bg-muted px-1.5 py-0.5 rounded">{(file.size / 1024).toFixed(1)} KB</span>
                                </div>
                                <button 
                                    onClick={() => handleDownload(file.name)}
                                    className="w-full bg-secondary text-secondary-foreground py-2 text-xs font-medium rounded hover:bg-secondary/80 hover:text-foreground transition-all flex items-center justify-center gap-2"
                                >
                                    <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Download File
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                             <FileText className="opacity-20" size={32} />
                             <p className="text-sm">No files associated with this area.</p>
                        </div>
                    )}
                </div>
            </div>
       </div>
    </div>
  )
}
