import { Project, SimulationRun, Metric } from "@/types"

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj_001",
    name: "Trivandrum City Optimization",
    description: "Phase 1 traffic study for central district",
    createdAt: "2026-01-10",
    areas: [
      { id: "area_1", name: "Central Junction", junctionCount: 12, status: "active", lastSynced: "2 mins ago", coordinates: [8.5241, 76.9366] },
      { id: "area_2", name: "Technopark Corridor", junctionCount: 8, status: "inactive", lastSynced: "1 day ago", coordinates: [8.5581, 76.8816] }
    ]
  },
  {
    id: "proj_002",
    name: "Highway Expansion 66",
    description: "Feasibility study for lane addition",
    createdAt: "2026-01-25",
    areas: []
  }
]

export const MOCK_RUNS: SimulationRun[] = [
  {
    runId: "run_014",
    projectId: "proj_001",
    section: "Signal Optimization",
    status: "completed",
    duration: "2m 14s",
    date: "2026-01-30 14:30"
  },
  {
    runId: "run_013",
    projectId: "proj_001",
    section: "Lane Planning",
    status: "completed",
    duration: "4m 05s",
    date: "2026-01-29 10:15"
  },
  {
    runId: "run_012",
    projectId: "proj_002",
    section: "Road Generation",
    status: "failed",
    duration: "0m 45s",
    date: "2026-01-28 16:20"
  }
]

export const METRICS_DATA: Record<string, Metric[]> = {
  "Signal Optimization": [
    { label: "Avg Wait Time", value: "45s", change: -15, trend: "down" },
    { label: "Throughput", value: "1,240 v/h", change: 8, trend: "up" },
    { label: "Cycle Length", value: "120s", trend: "neutral" }
  ],
  "Lane Planning": [
    { label: "Construction Cost", value: "$2.4M", trend: "neutral" },
    { label: "Travel Time Savings", value: "12%", change: 4, trend: "up" },
    { label: "Land Acquired", value: "450 sq.m", trend: "neutral" }
  ]
}

export const LOG_TEMPLATES = {
  init: ["Initializing simulation environment...", "Loading graph data...", "Validating constraints..."],
  processing: [
    "Optimizing signal phases at Junction J4...",
    "Simulating vehicle flow (Iteration {i})...",
    "Calculating delay metrics...",
    "Updating edge weights...",
    "checking safety constraints..."
  ],
  completion: ["Simulation completed successfully.", "Generating report artifacts...", "Saving results to database."]
}
