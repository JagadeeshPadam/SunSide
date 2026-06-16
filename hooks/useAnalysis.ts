'use client';

import { useMutation } from '@tanstack/react-query';
import type {
  AnalysisRequest,
  AnalysisResult,
  DepartureOptimization,
  Location,
} from '@/types';

interface AnalysisResponse {
  result: AnalysisResult;
  optimization?: DepartureOptimization;
}

interface OptimizePayload {
  request: AnalysisRequest;
  windowMinutes?: number;
}

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export function useAnalysis() {
  return useMutation<AnalysisResponse, Error, AnalysisRequest>({
    mutationFn: (request) => postJSON<AnalysisResponse>('/api/analyze', request),
  });
}

export function useOptimization() {
  return useMutation<DepartureOptimization, Error, OptimizePayload>({
    mutationFn: ({ request, windowMinutes }) =>
      postJSON<DepartureOptimization>('/api/optimize', { request, windowMinutes }),
  });
}

export async function searchLocations(query: string): Promise<Location[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.locations ?? []) as Location[];
}
