import type { Coordinates, RouteSegment } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Earth radius in kilometres (mean radius) */
const EARTH_RADIUS_KM = 6371;

/** Target segment duration in seconds (~5 minutes) */
const TARGET_SEGMENT_SECONDS = 300;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate the initial compass bearing (0–360°) when travelling from `start`
 * to `end` along the great-circle path.
 *
 * 0° = North, 90° = East, 180° = South, 270° = West.
 */
export function calculateHeading(start: Coordinates, end: Coordinates): number {
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);
  const deltaLng = toRadians(end.lng - start.lng);

  const x = Math.sin(deltaLng) * Math.cos(lat2);
  const y =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearingRad = Math.atan2(x, y);
  return ((toDegrees(bearingRad) % 360) + 360) % 360;
}

/**
 * Calculate the great-circle distance between two coordinate pairs using the
 * Haversine formula.
 *
 * @returns Distance in kilometres.
 */
export function calculateDistance(start: Coordinates, end: Coordinates): number {
  const lat1 = toRadians(start.lat);
  const lat2 = toRadians(end.lat);
  const deltaLat = toRadians(end.lat - start.lat);
  const deltaLng = toRadians(end.lng - start.lng);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Interpolate a Date by adding `elapsedSeconds` to `departureTime`.
 */
export function interpolateTime(departureTime: Date, elapsedSeconds: number): Date {
  return new Date(departureTime.getTime() + elapsedSeconds * 1000);
}

/**
 * Split a polyline (array of [lng, lat] coordinate pairs as returned by ORS)
 * into `RouteSegment` objects, each representing approximately 5 minutes of
 * travel time.
 *
 * When the raw coordinate list doesn't divide evenly into 5-minute chunks we
 * group consecutive coordinate pairs proportionally by distance, assuming a
 * constant average speed throughout the route.
 *
 * @param coordinates    - GeoJSON-style [longitude, latitude] pairs
 * @param departureTime  - Absolute departure timestamp
 * @param totalDuration  - Total journey duration in seconds
 */
export function segmentRoute(
  coordinates: [number, number][],
  departureTime: Date,
  totalDuration: number,
): RouteSegment[] {
  if (coordinates.length < 2) {
    return [];
  }

  // ── Step 1: compute cumulative distances along the polyline ─────────────────
  const pointDistances: number[] = [0]; // distance from start to point[i] (km)

  for (let i = 1; i < coordinates.length; i++) {
    const prev: Coordinates = { lat: coordinates[i - 1][1], lng: coordinates[i - 1][0] };
    const curr: Coordinates = { lat: coordinates[i][1], lng: coordinates[i][0] };
    pointDistances.push(pointDistances[i - 1] + calculateDistance(prev, curr));
  }

  const totalDistance = pointDistances[pointDistances.length - 1];
  const avgSpeedKmPerSec = totalDistance / totalDuration; // km / s

  // ── Step 2: build time-based segments ────────────────────────────────────────
  const segments: RouteSegment[] = [];
  let segmentStartIdx = 0;
  let elapsedSeconds = 0;

  while (segmentStartIdx < coordinates.length - 1) {
    const startDistKm = pointDistances[segmentStartIdx];
    const targetEndDistKm = startDistKm + avgSpeedKmPerSec * TARGET_SEGMENT_SECONDS;

    // Find the last point that falls within this segment's distance budget
    let endIdx = segmentStartIdx + 1;
    while (
      endIdx < coordinates.length - 1 &&
      pointDistances[endIdx] < targetEndDistKm
    ) {
      endIdx++;
    }

    const startCoords: Coordinates = {
      lat: coordinates[segmentStartIdx][1],
      lng: coordinates[segmentStartIdx][0],
    };
    const endCoords: Coordinates = {
      lat: coordinates[endIdx][1],
      lng: coordinates[endIdx][0],
    };

    const segmentDistKm = pointDistances[endIdx] - startDistKm;
    const segmentDuration =
      avgSpeedKmPerSec > 0 ? segmentDistKm / avgSpeedKmPerSec : TARGET_SEGMENT_SECONDS;

    const segmentStartTime = interpolateTime(departureTime, elapsedSeconds);
    const segmentEndTime = interpolateTime(departureTime, elapsedSeconds + segmentDuration);

    segments.push({
      startCoords,
      endCoords,
      heading: calculateHeading(startCoords, endCoords),
      distance: segmentDistKm,
      duration: segmentDuration,
      startTime: segmentStartTime,
      endTime: segmentEndTime,
    });

    elapsedSeconds += segmentDuration;
    segmentStartIdx = endIdx;
  }

  return segments;
}
