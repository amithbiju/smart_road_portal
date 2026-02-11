export const BASE_URL = "http://127.0.0.1:5000";

export interface TrainPayload {
  project_id: string;
  bbox?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  min_green?: number;
  episodes?: number;
  learning_rate?: number;
}

export interface TrainingResponse {
  status: string;
  project_id: string;
  message: string;
}

export interface ResultsResponse {
  project_id: string;
  waiting_time_comparison: MetricComparison[];
  queue_length_comparison: MetricComparison[];
}

export interface MetricComparison {
  metric: string;
  baseline: number;
  rl: number;
  improvement_pct: number;
}

export interface ProjectStatus {
    project_id: string;
    status: string;
    has_models: boolean;
    has_metrics: boolean;
}

export async function startTraining(payload: TrainPayload): Promise<TrainingResponse> {
  const response = await fetch(`${BASE_URL}/train`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Training failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getResults(projectId: string): Promise<ResultsResponse> {
  try {
    const response = await fetch(`${BASE_URL}/results/${projectId}`);
    if (!response.ok) {
       if (response.status === 404) return { project_id: projectId, waiting_time_comparison: [], queue_length_comparison: [] };
       throw new Error("Failed to fetch results");
    }
    const text = await response.text();
    // Python might return NaN which is invalid JSON, replace with null
    const sanitized = text.replace(/:\s*NaN/g, ': null'); 
    return JSON.parse(sanitized);
  } catch (error) {
    console.warn("API Error (getResults):", error);
    // Return empty results on network error to prevent UI crash
    return { project_id: projectId, waiting_time_comparison: [], queue_length_comparison: [] };
  }
}

export async function getStatus(projectId: string): Promise<ProjectStatus> {
    const response = await fetch(`${BASE_URL}/status/${projectId}`);
    if (!response.ok) {
        throw new Error("Failed to get status");
    }
    return response.json();
}

export function getLogStreamUrl(projectId: string): string {
  return `${BASE_URL}/logs/${projectId}`;
}

export function getPlotUrl(projectId: string, filename: string): string {
  return `${BASE_URL}/plots/${projectId}/${filename}`;
}
