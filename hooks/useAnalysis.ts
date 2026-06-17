'use client';

import { useMutation } from '@tanstack/react-query';
import type {
  AnalysisRequest,
  AnalysisResult,
  AnalysisResultRaw,
  DepartureOptimization,
  Location,
} from '@/types';

interface OptimizePayload {
  request: AnalysisRequest;
  windowMinutes?: number;
}

// ─── Date deserializer ────────────────────────────────────────────────────────
// JSON turns every Date into a string. Walk the raw response and restore them.
function deserializeResult(raw: AnalysisResultRaw): AnalysisResult {
  return {
    journey: {
      ...raw.journey,
      departureTime: new Date(raw.journey.departureTime),
      arrivalTime:   new Date(raw.journey.arrivalTime),
    },
    recommendations: raw.recommendations.map((r) => ({
      ...r,
      startTime: new Date(r.startTime),
      endTime:   new Date(r.endTime),
    })),
    segmentAnalyses: raw.segmentAnalyses.map((sa) => ({
      ...sa,
      segment: {
        ...sa.segment,
        startTime: new Date(sa.segment.startTime),
        endTime:   new Date(sa.segment.endTime),
      },
      solarPosition: {
        ...sa.solarPosition,
        sunrise: new Date(sa.solarPosition.sunrise),
        sunset:  new Date(sa.solarPosition.sunset),
      },
    })),
    weatherSummary: raw.weatherSummary,
    mapData:        raw.mapData,
  };
}

function deserializeOptimization(raw: DepartureOptimization): DepartureOptimization {
  return {
    ...raw,
    options: raw.options.map((o) => ({
      ...o,
      recommendations: o.recommendations.map((r) => ({
        ...r,
        startTime: new Date(r.startTime),
        endTime:   new Date(r.endTime),
      })),
    })),
  };
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────
async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try { const j = await res.json(); if (j?.error) msg = j.error; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

// ─── useAnalysis ──────────────────────────────────────────────────────────────
// /api/analyze returns AnalysisResult directly (not wrapped)
export function useAnalysis() {
  return useMutation<AnalysisResult, Error, AnalysisRequest>({
    mutationFn: async (request) => {
      const raw = await postJSON<AnalysisResultRaw>('/api/analyze', request);
      return deserializeResult(raw);
    },
  });
}

// ─── useOptimization ──────────────────────────────────────────────────────────
export function useOptimization() {
  return useMutation<DepartureOptimization, Error, OptimizePayload>({
    mutationFn: async ({ request, windowMinutes }) => {
      const raw = await postJSON<DepartureOptimization>('/api/optimize', { request, windowMinutes });
      return deserializeOptimization(raw);
    },
  });
}

// ─── Geocoding helper ─────────────────────────────────────────────────────────
export async function searchLocations(query: string): Promise<Location[]> {
  if (!query.trim()) return [];
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.locations ?? []) as Location[];
}
