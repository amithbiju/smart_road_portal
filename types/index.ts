export type Project = {
  id: string
  name: string
  description: string
  createdAt: string
  areas: Area[]
}

export type Area = {
  id: string
  name: string
  junctionCount: number
  status: 'active' | 'inactive'
  lastSynced: string
  coordinates: [number, number] // Centroid
  createdAt?: string
}

export type RunStatus = 'running' | 'completed' | 'failed'

export type SimulationRun = {
  runId: string
  projectId: string
  section: 'Signal Optimization' | 'Lane Planning' | 'Road Generation'
  status: RunStatus
  duration?: string
  date: string
}

export type LogEntry = {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'success' | 'error'
  message: string
}

export type Metric = {
  label: string
  value: string | number
  change?: number // percentage
  trend?: 'up' | 'down' | 'neutral'
}

export interface Bounds {
  north: number
  south: number
  east: number
  west: number
}

export interface AreaStats {
  id?: string
  name?: string
  junctions: number
  signals: number
  roadSegments: number
  trafficDensity: number
  bounds?: Bounds
}
