import type {
  AnalysisRequest,
  AnalysisResult,
  DepartureOptimization,
  OptimizationResult,
  SegmentAnalysis,
  WeatherData,
  MapSegmentData,
  Coordinates,
} from '@/types';
import { getSolarPosition, getSunExposureSide, calculateExposureScore } from '@/lib/solar';
import { segmentRoute } from '@/lib/route';
import { generateRecommendations, calculateJourneySummary } from '@/lib/recommendations';
import { getRoute, vehicleTypeToProfile } from '@/services/openroute';
import { getWeatherAlongRoute, interpolateWeather } from '@/services/weather';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Interval between departure-time candidates when optimising (seconds) */
const OPTIMIZATION_STEP_SECONDS = 15 * 60; // 15 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Compute a simple weighted-average `WeatherData` from multiple samples.
 * Used for the `weatherSummary` field on `AnalysisResult`.
 */
function averageWeather(weatherSamples: WeatherData[]): WeatherData {
  if (weatherSamples.length === 0) {
    return {
      cloudCoverage: 50,
      description: 'unknown',
      temperature: 20,
      windSpeed: 2,
      icon: '01d',
    };
  }

  const count = weatherSamples.length;

  const cloudCoverage =
    Math.round(
      weatherSamples.reduce((s, w) => s + w.cloudCoverage, 0) / count,
    );
  const temperature =
    Math.round(
      weatherSamples.reduce((s, w) => s + w.temperature, 0) / count,
    );
  const windSpeed =
    Math.round(
      (weatherSamples.reduce((s, w) => s + w.windSpeed, 0) / count) * 10,
    ) / 10;

  const uvSamples = weatherSamples.filter((w) => w.uvIndex !== undefined);
  const uvIndex =
    uvSamples.length > 0
      ? Math.round(
          (uvSamples.reduce((s, w) => s + (w.uvIndex ?? 0), 0) /
            uvSamples.length) *
            10,
        ) / 10
      : undefined;

  // Use the description + icon from the midpoint sample
  const mid = weatherSamples[Math.floor(count / 2)];

  return {
    cloudCoverage,
    description: mid.description,
    uvIndex,
    temperature,
    windSpeed,
    icon: mid.icon,
  };
}

/**
 * Build the `MapSegmentData[]` array used by the front-end map layer.
 * Each element groups a run of segments with the same exposure side.
 */
function buildMapData(segmentAnalyses: SegmentAnalysis[]): MapSegmentData[] {
  const mapData: MapSegmentData[] = [];

  for (const analysis of segmentAnalyses) {
    const last = mapData[mapData.length - 1];

    const startCoord: [number, number] = [
      analysis.segment.startCoords.lng,
      analysis.segment.startCoords.lat,
    ];
    const endCoord: [number, number] = [
      analysis.segment.endCoords.lng,
      analysis.segment.endCoords.lat,
    ];

    if (last && last.exposureSide === analysis.exposureSide) {
      // Extend the last polyline
      last.coordinates.push(endCoord);
      // Update score to running average
      last.exposureScore = Math.round(
        (last.exposureScore + analysis.exposureScore) / 2,
      );
    } else {
      mapData.push({
        coordinates: [startCoord, endCoord],
        exposureScore: analysis.exposureScore,
        exposureSide: analysis.exposureSide,
      });
    }
  }

  return mapData;
}

// ─── Core analysis ────────────────────────────────────────────────────────────

/**
 * Run a complete solar-exposure analysis for the given journey request.
 *
 * Steps:
 *  1. Fetch route geometry from OpenRouteService
 *  2. Fetch weather samples along the route from OpenWeatherMap
 *  3. Split the route into ~5-minute segments
 *  4. For each segment: calculate solar position, exposure side, exposure score
 *  5. Generate seating recommendations
 *  6. Build map segment data
 *  7. Assemble and return `AnalysisResult`
 */
export async function analyzeRoute(
  request: AnalysisRequest,
): Promise<AnalysisResult> {
  const departureTime = new Date(request.departureTime);
  const profile = vehicleTypeToProfile(request.vehicleType);

  // ── 1. Route ────────────────────────────────────────────────────────────────
  const { coordinates, distance, duration } = await getRoute(
    request.source.coordinates,
    request.destination.coordinates,
    profile,
  );

  // ── 2. Weather ──────────────────────────────────────────────────────────────
  const waypointCoords: Coordinates[] = coordinates.map(([lng, lat]) => ({
    lat,
    lng,
  }));
  const weatherSamples = await getWeatherAlongRoute(waypointCoords);

  // ── 3. Segment ──────────────────────────────────────────────────────────────
  const segments = segmentRoute(coordinates, departureTime, duration);

  // ── 4. Per-segment analysis ─────────────────────────────────────────────────
  const segmentAnalyses: SegmentAnalysis[] = segments.map((segment, idx) => {
    // Use the midpoint time of the segment for solar calculation
    const midTime = new Date(
      (segment.startTime.getTime() + segment.endTime.getTime()) / 2,
    );

    // Use midpoint coordinates
    const midCoords: Coordinates = {
      lat: (segment.startCoords.lat + segment.endCoords.lat) / 2,
      lng: (segment.startCoords.lng + segment.endCoords.lng) / 2,
    };

    const solarPosition = getSolarPosition(midCoords, midTime);

    // Interpolate weather for this segment's position in the route
    const weatherData = interpolateWeather(
      weatherSamples,
      idx,
      segments.length,
    );

    const exposureSide = getSunExposureSide(
      segment.heading,
      solarPosition.azimuth,
      solarPosition.altitude,
    );

    const exposureScore = calculateExposureScore(
      solarPosition,
      weatherData.cloudCoverage,
      segment.duration,
    );

    return {
      segment,
      solarPosition,
      exposureSide,
      exposureScore,
      weatherData,
    };
  });

  // ── 5. Recommendations ──────────────────────────────────────────────────────
  const recommendations = generateRecommendations(segmentAnalyses);

  // ── 6. Map data ─────────────────────────────────────────────────────────────
  const mapData = buildMapData(segmentAnalyses);

  // ── 7. Assemble result ──────────────────────────────────────────────────────
  const partialResult: AnalysisResult = {
    journey: {
      distance,
      duration,
      departureTime,
      arrivalTime: new Date(departureTime.getTime() + duration * 1000),
      totalExposureScore: 0,
      comfortScore: 0,
      exposureReductionPercentage: 0,
    },
    recommendations,
    segmentAnalyses,
    weatherSummary: averageWeather(weatherSamples),
    mapData,
  };

  // Compute journey summary using the helper (which calls getComfortScore)
  const journey = calculateJourneySummary(partialResult, departureTime);

  return { ...partialResult, journey };
}

// ─── Departure optimisation ───────────────────────────────────────────────────

/**
 * Test multiple departure times within a window and return the optimal one.
 *
 * Departures are tested at 15-minute intervals.
 * "Optimal" = lowest weighted-average exposure score.
 *
 * @param request       - Base analysis request (its `departureTime` is the centre of the window)
 * @param windowMinutes - Total window size in minutes (half before, half after departure)
 */
export async function optimizeDeparture(
  request: AnalysisRequest,
  windowMinutes: number,
): Promise<DepartureOptimization> {
  const baseDeparture = new Date(request.departureTime);
  const halfWindowMs = (windowMinutes / 2) * 60 * 1000;

  const earliest = new Date(baseDeparture.getTime() - halfWindowMs);
  const latest = new Date(baseDeparture.getTime() + halfWindowMs);

  // Build candidate departure times
  const candidateTimes: Date[] = [];
  let current = new Date(earliest);
  while (current <= latest) {
    candidateTimes.push(new Date(current));
    current = new Date(current.getTime() + OPTIMIZATION_STEP_SECONDS * 1000);
  }

  // Run analyses for all candidates (sequentially to respect API rate limits)
  const rawResults: Array<{
    departureTime: string;
    exposureScore: number;
    result: AnalysisResult;
  }> = [];

  for (const time of candidateTimes) {
    try {
      const candidateRequest: AnalysisRequest = {
        ...request,
        departureTime: time.toISOString(),
        // Don't recurse into optimisation
        optimizeDeparture: false,
      };
      const result = await analyzeRoute(candidateRequest);
      rawResults.push({
        departureTime: time.toISOString(),
        exposureScore: result.journey.totalExposureScore,
        result,
      });
    } catch (err) {
      // Skip failed candidates rather than aborting the entire optimisation
      console.warn(
        `[optimizeDeparture] Skipping ${time.toISOString()}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  if (rawResults.length === 0) {
    throw new Error(
      'Could not compute any departure scenarios. Check API keys and route validity.',
    );
  }

  // Find the worst score to compute relative reductions
  const worstScore = Math.max(...rawResults.map((r) => r.exposureScore));

  const options: OptimizationResult[] = rawResults.map((r) => ({
    departureTime: r.departureTime,
    exposureScore: r.exposureScore,
    exposureReduction:
      worstScore > 0
        ? Math.round(((worstScore - r.exposureScore) / worstScore) * 100)
        : 0,
    recommendations: r.result.recommendations,
  }));

  // Sort ascending by exposure score
  options.sort((a, b) => a.exposureScore - b.exposureScore);

  const best = options[0];

  return {
    bestTime: best.departureTime,
    bestScore: best.exposureScore,
    bestReduction: best.exposureReduction,
    options,
  };
}
