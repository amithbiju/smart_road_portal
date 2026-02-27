"use client"

import { useState, useEffect } from "react"
import { AreaDetails } from "@/components/projects/AreaDetails"
// Dynamic import for Map to avoid SSR issues with Leaflet
import dynamic from 'next/dynamic'
import { MousePointer2, BoxSelect, Eraser } from "lucide-react"
import { cn } from "@/lib/utils"
import { AreaStats, Bounds } from "@/types"

type SelectionMode = 'draw' | 'coordinates'
import { fetchInfrastructureStats } from "@/lib/osm-service"
import { saveProjectArea } from "@/lib/firebase-services"
import { useParams, useRouter } from "next/navigation"

const Map = dynamic(() => import('@/components/map/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-100 animate-pulse flex items-center justify-center text-muted-foreground">Loading Map...</div>
})

import { getProject } from "@/lib/firebase-services"
import { Project, Area } from "@/types"
import { MapPin, Calendar, ArrowRight } from "lucide-react"

// ... imports ...

export default function AreaSelectionPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [activeTool, setActiveTool] = useState<'select' | 'draw' | null>('select')
  const [bounds, setBounds] = useState<Bounds | null>(null)
  const [stats, setStats] = useState<AreaStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('draw')
  const [previewBounds, setPreviewBounds] = useState<Bounds | null>(null)
  
  const [project, setProject] = useState<Project | null>(null)

  // Fetch project data to get saved areas
  const fetchProjectData = async () => {
    if (projectId) {
      const p = await getProject(projectId)
      setProject(p)
    }
  }

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const handleSelectionComplete = (leafletBounds: any) => {
    // ... same ...
    const newBounds: Bounds = {
        north: leafletBounds.getNorth(),
        south: leafletBounds.getSouth(),
        east: leafletBounds.getEast(),
        west: leafletBounds.getWest()
    }
    setBounds(newBounds)
    setStats(null)
    setPreviewBounds(null)
  }

  const handleManualBounds = (manualBounds: Bounds) => {
    setBounds(manualBounds)
    setPreviewBounds(manualBounds)
    setStats(null)
  }

  const handleAnalyze = async () => {
    if (!bounds) return;
    setLoading(true);
    try {
        const mockBounds = {
            getNorth: () => bounds.north,
            getSouth: () => bounds.south,
            getEast: () => bounds.east,
            getWest: () => bounds.west
        };
        
        // @ts-ignore
        const data = await fetchInfrastructureStats(mockBounds);
        setStats({ ...data, bounds });
    } catch (error) {
        console.error("Analysis failed", error);
    } finally {
        setLoading(false);
    }
  }

  const handleSave = async (name: string) => {
     if (!bounds || !name) return;
     setSaving(true);
     try {
        await saveProjectArea(projectId, {
           name,
           bounds,
           stats: stats || {},
           status: 'active'
        });
        alert("Area saved successfully!");
        setSaving(false);
        fetchProjectData(); // Refresh list
     } catch (error) {
        console.error("Failed to save area", error);
        setSaving(false);
        alert("Failed to save area.");
     }
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex h-[600px] rounded-xl border border-border shadow-sm overflow-hidden bg-background shrink-0">
        {/* Left Tools Panel */}
        <div className="w-16 flex flex-col items-center py-4 gap-4 border-r border-border bg-muted/10 z-10">
          <ToolButton 
             icon={BoxSelect} 
             active={activeTool === 'draw'} 
             onClick={() => setActiveTool('draw')}
             label="Draw Box"
          />
          <div className="h-px w-8 bg-border my-2" />
          <ToolButton 
             icon={Eraser} 
             active={false} 
             onClick={() => {
               setBounds(null)
               setStats(null)
             }}
             label="Clear"
             disabled={!bounds}
          />
        </div>

        {/* Center Map */}
        <div className="flex-1 relative bg-slate-50">
          <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur px-3 py-1.5 rounded-md border border-border shadow-sm text-xs font-medium">
             Use the draw tool (top right on map) to select an area.
          </div>
          
          <Map 
            className="h-full w-full rounded-none border-0" 
            onSelectionComplete={handleSelectionComplete}
            interactive={true}
            previewBounds={previewBounds}
          />
        </div>

        {/* Right Details Panel */}
        <AreaDetails 
          bounds={bounds}
          stats={stats}
          loading={loading}
          onAnalyze={handleAnalyze}
          onSave={handleSave}
          saving={saving}
          selectionMode={selectionMode}
          onSelectionModeChange={setSelectionMode}
          onManualBounds={handleManualBounds}
        />
      </div>
      
      {/* Saved Areas Section */}
      <div className="space-y-4">
         <h3 className="text-xl font-semibold tracking-tight">Saved Areas</h3>
         
         {!project?.areas || project.areas.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-border rounded-lg bg-muted/30">
               <MapPin className="mx-auto h-10 w-10 text-muted-foreground mb-2 opacity-50" />
               <p className="text-muted-foreground">No areas saved yet. Draw and save an area above.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {project.areas.map((area, idx) => (
                  <div key={idx} className="bg-card rounded-lg border border-border p-4 shadow-sm hover:border-primary/40 transition-colors">
                     <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                           <div className="bg-primary/10 p-2 rounded-md text-primary">
                              <MapPin size={18} />
                           </div>
                           <span className="font-semibold">{area.name}</span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">
                           Active
                        </span>
                     </div>
                     
                     <div className="text-sm text-muted-foreground mb-4 space-y-1">
                        <div className="flex justify-between">
                           <span>Junctions:</span>
                           <span className="font-mono text-foreground">{area.junctionCount || ((area as any).stats?.junctions ?? '-')}</span>
                        </div>
                        <div className="flex justify-between">
                           <span>Signals:</span>
                           <span className="font-mono text-foreground">{ (area as any).stats?.signals ?? '-' }</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                           <Calendar size={12} />
                           <span>{new Date(area.createdAt || new Date()).toLocaleDateString()}</span>
                        </div>
                        {/* Future: Add View/Edit/Delete actions */}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  )
}

function ToolButton({ 
  icon: Icon, 
  active, 
  onClick, 
  label, 
  disabled 
}: { 
  icon: any, 
  active: boolean, 
  onClick: () => void, 
  label: string, 
  disabled?: boolean 
}) {
  return (
    <div className="relative group">
       <button 
         onClick={onClick}
         disabled={disabled}
         className={cn(
            "p-2.5 rounded-md transition-all",
            active 
              ? "bg-primary text-primary-foreground shadow-md" 
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
            disabled && "opacity-50 cursor-not-allowed"
         )}
       >
         <Icon size={20} />
       </button>
       
       <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
          {label}
       </div>
    </div>
  )
}
