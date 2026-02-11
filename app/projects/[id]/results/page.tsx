"use client"

import { useState } from "react"
import { Download, FileJson, FileType, Map as MapIcon, BarChart2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState<'metrics' | 'visuals' | 'exports'>('exports')
  const [downloading, setDownloading] = useState<string | null>(null)
  
  const handleDownload = (type: string) => {
    setDownloading(type)
    setTimeout(() => {
        setDownloading(null)
        // Toast would go here
        alert(`${type} exported successfully!`)
    }, 1500)
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Results & Exports</h1>
          <div className="text-sm text-muted-foreground">Project: Trivandrum City Optimization</div>
       </div>

       {/* Tabs */}
       <div className="border-b border-border">
          <div className="flex gap-6">
             <TabButton active={activeTab === 'metrics'} onClick={() => setActiveTab('metrics')} label="Metrics Analysis" icon={BarChart2} />
             <TabButton active={activeTab === 'visuals'} onClick={() => setActiveTab('visuals')} label="Visualization" icon={MapIcon} />
             <TabButton active={activeTab === 'exports'} onClick={() => setActiveTab('exports')} label="Exports" icon={Download} />
          </div>
       </div>

       {/* Content */}
       <div className="bg-card rounded-lg border border-border shadow-sm p-6 min-h-[400px]">
          {activeTab === 'exports' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ExportCard 
                   title="OpenStreetMap Data" 
                   desc="Full network topology including new lanes and signals." 
                   format="OSM XML" 
                   size="4.2 MB"
                   type="osm"
                   downloading={downloading}
                   onDownload={handleDownload}
                   icon={MapIcon}
                />
                <ExportCard 
                   title="GeoJSON Layers" 
                   desc="Standard GIS format for junctions, edges, and additions." 
                   format="GeoJSON" 
                   size="1.8 MB"
                   type="geojson"
                   downloading={downloading}
                   onDownload={handleDownload}
                   icon={FileType}
                />
                <ExportCard 
                   title="Usage Report" 
                   desc="PDF report with cost breakdown and ROI analysis." 
                   format="PDF" 
                   size="8.5 MB"
                   type="pdf"
                   downloading={downloading}
                   onDownload={handleDownload}
                   icon={CheckCircle2}
                />
                <ExportCard 
                   title="Simulation Config" 
                   desc="SUMO configuration files and traffic demand types." 
                   format="JSON" 
                   size="12 KB"
                   type="json"
                   downloading={downloading}
                   onDownload={handleDownload}
                   icon={FileJson}
                />
             </div>
          )}
          
          {activeTab !== 'exports' && (
             <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                   {activeTab === 'metrics' ? <BarChart2 size={32} /> : <MapIcon size={32} />}
                </div>
                <h3 className="font-medium text-lg text-foreground">Content Placeholder</h3>
                <p>Detailed {activeTab} view not implemented in this demo.</p>
             </div>
          )}
       </div>
    </div>
  )
}

function TabButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
   return (
      <button 
         onClick={onClick}
         className={cn(
            "flex items-center gap-2 pb-3 mb-[-1px] transition-colors border-b-2 font-medium text-sm",
            active 
               ? "border-primary text-primary" 
               : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
         )}
      >
         <Icon size={16} />
         {label}
      </button>
   )
}

function ExportCard({ title, desc, format, size, type, downloading, onDownload, icon: Icon }: any) {
   const isDownloading = downloading === type
   
   return (
      <div className="border border-border rounded-lg p-4 hover:border-primary/40 transition-colors flex flex-col">
         <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-muted/40 rounded-lg">
               <Icon size={24} className="text-foreground" />
            </div>
            <div>
               <h4 className="font-semibold">{title}</h4>
               <p className="text-sm text-muted-foreground mt-1 leading-snug">{desc}</p>
            </div>
         </div>
         
         <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/50">
            <span className="text-xs font-mono text-muted-foreground">{format} • {size}</span>
            <button 
               onClick={() => onDownload(type)}
               disabled={!!downloading}
               className={cn(
                  "px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-2",
                  isDownloading ? "bg-muted text-muted-foreground cursor-wait" : "bg-primary text-primary-foreground hover:bg-primary/90"
               )}
            >
               {isDownloading ? "Exporting..." : "Download"}
               {!isDownloading && <Download size={14} />}
            </button>
         </div>
      </div>
   )
}
