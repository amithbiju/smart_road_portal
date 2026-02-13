"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Rectangle, useMapEvents, Marker, Popup, FeatureGroup, Polyline, useMap } from "react-leaflet"
import { EditControl } from "react-leaflet-draw"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import L from "leaflet"
import { cn } from "@/lib/utils"
import { Bounds } from "@/types"

// Fix for default markers in Leaflet with Next.js
const fixLeafletIcon = () => {
  try {
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  } catch (e) {
    console.error("Leaflet icon fix failed", e);
  }
};

export interface PathOverlay {
  id: string
  coordinates: [number, number][] // [lat, lng] pairs
  color: string
  weight?: number
  opacity?: number
  dashArray?: string
  label?: string
}

interface MapProps {
  className?: string
  center?: [number, number]
  zoom?: number
  interactive?: boolean
  showMockSelection?: boolean
  onSelectionComplete?: (bounds: any) => void
  overlays?: PathOverlay[]
  fitToOverlays?: boolean
  previewBounds?: Bounds | null
}

// Helper component to auto-fit bounds to overlays
function FitBounds({ overlays }: { overlays: PathOverlay[] }) {
  const map = useMap()
  
  useEffect(() => {
    if (overlays && overlays.length > 0) {
      const allCoords: [number, number][] = []
      overlays.forEach(o => {
        o.coordinates.forEach(c => allCoords.push(c))
      })
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords.map(c => L.latLng(c[0], c[1])))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
      }
    }
  }, [overlays, map])

  return null
}

// Helper component to auto-fit the map to manual preview bounds
function FitPreviewBounds({ bounds }: { bounds: Bounds }) {
  const map = useMap()
  
  useEffect(() => {
    const leafletBounds = L.latLngBounds(
      L.latLng(bounds.south, bounds.west),
      L.latLng(bounds.north, bounds.east)
    )
    map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 16 })
  }, [bounds, map])

  return null
}

export default function Map({ 
  className, 
  center = [8.5241, 76.9366], // Trivandrum
  zoom = 13,
  interactive = true,
  showMockSelection,
  onSelectionComplete,
  overlays,
  fitToOverlays = true,
  previewBounds
}: MapProps) {
  
  useEffect(() => {
    fixLeafletIcon();
  }, []);

  const handleCreated = (e: any) => {
     const { layerType, layer } = e;
     if (layerType === 'rectangle') {
        const bounds = layer.getBounds();
        if (onSelectionComplete) {
            onSelectionComplete(bounds);
        }
     }
  }

  const handleEdited = (e: any) => {
     const layers = e.layers;
     layers.eachLayer((layer: any) => {
        if (layer instanceof L.Rectangle) {
           const bounds = layer.getBounds();
           if (onSelectionComplete) {
               onSelectionComplete(bounds);
           }
        }
     });
  }

  return (
    <div className={cn("relative z-0 h-full w-full rounded-lg overflow-hidden border border-border bg-slate-100", className)}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={interactive}
        dragging={interactive}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer 
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="saturate-0 contrast-100" // Clean light grayscale look
        />
        
        <FeatureGroup>
            {interactive && (
                <EditControl
                position="topright"
                onCreated={handleCreated}
                onEdited={handleEdited}
                draw={{
                    rectangle: true,
                    polyline: false,
                    polygon: false,
                    circle: false,
                    circlemarker: false,
                    marker: false,
                }}
                />
            )}
        </FeatureGroup>

        {showMockSelection && !interactive && (
           <Rectangle bounds={[[8.52, 76.93], [8.53, 76.94]]} pathOptions={{ color: 'blue', fillOpacity: 0.1 }} />
        )}

        {/* Preview rectangle from manual coordinate entry */}
        {previewBounds && (
          <>
            <Rectangle
              bounds={[
                [previewBounds.south, previewBounds.west],
                [previewBounds.north, previewBounds.east]
              ]}
              pathOptions={{ color: '#3b82f6', weight: 2, fillOpacity: 0.1, dashArray: '6 4' }}
            />
            <FitPreviewBounds bounds={previewBounds} />
          </>
        )}

        {/* Render path overlays (bypass road, congestion line, etc.) */}
        {overlays && overlays.map(overlay => (
          <Polyline
            key={overlay.id}
            positions={overlay.coordinates}
            pathOptions={{
              color: overlay.color,
              weight: overlay.weight || 4,
              opacity: overlay.opacity || 0.85,
              dashArray: overlay.dashArray
            }}
          />
        ))}
        
        {/* Auto-fit to overlays */}
        {fitToOverlays && overlays && overlays.length > 0 && (
          <FitBounds overlays={overlays} />
        )}
      </MapContainer>

      {/* Legend for overlays */}
      {overlays && overlays.length > 0 && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur rounded-lg border border-border shadow-lg p-3 space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Legend</span>
          {overlays.map(o => (
            <div key={o.id} className="flex items-center gap-2 text-xs">
              <div 
                className="w-5 h-1 rounded-full" 
                style={{ backgroundColor: o.color, opacity: o.opacity || 0.85 }} 
              />
              <span className="text-foreground">{o.label || o.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
