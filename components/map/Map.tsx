"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Rectangle, useMapEvents, Marker, Popup, FeatureGroup } from "react-leaflet"
import { EditControl } from "react-leaflet-draw"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import L from "leaflet"
import { cn } from "@/lib/utils"

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

interface MapProps {
  className?: string
  center?: [number, number]
  zoom?: number
  interactive?: boolean
  showMockSelection?: boolean
  onSelectionComplete?: (bounds: any) => void
}

export default function Map({ 
  className, 
  center = [8.5241, 76.9366], // Trivandrum
  zoom = 13,
  interactive = true,
  showMockSelection,
  onSelectionComplete
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
      </MapContainer>
    </div>
  )
}
