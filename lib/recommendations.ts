import type {
  SegmentAnalysis,
  SeatingRecommendation,
  AnalysisResult,
  JourneySummary,
  ExposureSide,
} from '@/types';
import { getComfortScore } from '@/lib/solar';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Maximum gap (seconds) between consecutive segments before we start a new recommendation group */
const MERGE_WINDOW_SECONDS = 15 * 60; // 15 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Return the recommended seat side — the opposite of where the sun hits.
 * When exposure is front/rear/minimal the entire cabin benefits equally, so
 * we label those literally.
 */
function oppositeSide(exposureSide: ExposureSide): ExposureSide {
  switch (exposureSide) {
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      // 'front' | 'rear' | 'minimal' — no single "other" side applies
      return exposureSide;
  }
}

function buildLabel(side: ExposureSide, score: number): string {
  if (side === 'minimal') return 'No significant sun exposure — any seat is fine';
  if (side === 'front') return 'Sun is ahead — rear seats are most comfortable';
  if (side === 'rear') return 'Sun is behind — front seats are most comfortable';

  const intensity =
    score >= 70 ? 'strong' : score >= 40 ? 'moderate' : 'mild';

  return `Sit on the ${side} side — ${intensity} sun on the ${side === 'left' ? 'right' : 'left'}`;
}

/**
 * Average two Date values (midpoint).
 */
function avgDate(a: Date, b: Date): number {
  return (a.getTime() + b.getTime()) / 2;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Group consecutive `SegmentAnalysis` entries that share the same exposure
 * side into `SeatingRecommendation` blocks.
 *
 * Consecutive groups whose gap is less than `MERGE_WINDOW_SECONDS` and that
 * share the same recommended seat side are merged into a single recommendation.
 */
export function generateRecommendations(
  segmentAnalyses: SegmentAnalysis[],
): SeatingRecommendation[] {
  if (segmentAnalyses.length === 0) return [];

  const totalDuration = segmentAnalyses.reduce(
    (sum, sa) => sum + sa.segment.duration,
    0,
  );

  // ── Step 1: build raw groups ────────────────────────────────────────────────
  interface Group {
    exposureSide: ExposureSide;
    startTime: Date;
    endTime: Date;
    totalScore: number;
    totalDuration: number;
  }

  const groups: Group[] = [];

  for (const analysis of segmentAnalyses) {
    const last = groups[groups.length - 1];
    const gapSeconds =
      last
        ? (analysis.segment.startTime.getTime() - last.endTime.getTime()) / 1000
        : 0;

    if (
      last &&
      last.exposureSide === analysis.exposureSide &&
      gapSeconds <= MERGE_WINDOW_SECONDS
    ) {
      // Extend the current group
      last.endTime = analysis.segment.endTime;
      last.totalScore += analysis.exposureScore * analysis.segment.duration;
      last.totalDuration += analysis.segment.duration;
    } else {
      groups.push({
        exposureSide: analysis.exposureSide,
        startTime: analysis.segment.startTime,
        endTime: analysis.segment.endTime,
        totalScore: analysis.exposureScore * analysis.segment.duration,
        totalDuration: analysis.segment.duration,
      });
    }
  }

  // ── Step 2: convert groups → SeatingRecommendation ─────────────────────────
  return groups.map((group) => {
    const avgScore =
      group.totalDuration > 0
        ? Math.round(group.totalScore / group.totalDuration)
        : 0;

    const side = oppositeSide(group.exposureSide);

    const groupSeconds =
      (group.endTime.getTime() - group.startTime.getTime()) / 1000;

    const percentage =
      totalDuration > 0
        ? Math.round((groupSeconds / totalDuration) * 100)
        : 0;

    return {
      startTime: group.startTime,
      endTime: group.endTime,
      side,
      exposureScore: avgScore,
      percentage,
      label: buildLabel(side, avgScore),
    };
  });
}

/**
 * Derive the `JourneySummary` from a completed `AnalysisResult`.
 *
 * @param result        - The full analysis result (recommendations + segment analyses)
 * @param departureTime - Actual departure time used for this analysis
 */
export function calculateJourneySummary(
  result: AnalysisResult,
  departureTime: Date,
): JourneySummary {
  const { segmentAnalyses, recommendations } = result;

  const totalDuration = segmentAnalyses.reduce(
    (sum, sa) => sum + sa.segment.duration,
    0,
  );

  const totalDistance = segmentAnalyses.reduce(
    (sum, sa) => sum + sa.segment.distance,
    0,
  );

  const arrivalTime = new Date(departureTime.getTime() + totalDuration * 1000);

  // Weighted average exposure score
  const totalExposureScore =
    totalDuration > 0
      ? Math.round(
          segmentAnalyses.reduce(
            (sum, sa) => sum + sa.exposureScore * sa.segment.duration,
            0,
          ) / totalDuration,
        )
      : 0;

  const comfortScore = getComfortScore(recommendations, totalDuration);

  // Worst-case: always sitting on the sun-exposed side (score stays as-is).
  // Best-case: always sitting on the opposite (score approaches 0 for direct).
  // Reduction = how much better our recommendation is vs always facing the sun.
  const exposureReductionPercentage =
    totalExposureScore > 0
      ? Math.round((1 - totalExposureScore / 100) * 100)
      : 100;

  return {
    distance: Math.round(totalDistance * 10) / 10,
    duration: Math.round(totalDuration),
    departureTime,
    arrivalTime,
    totalExposureScore,
    comfortScore,
    exposureReductionPercentage,
  };
}

/**
 * Format a duration given in seconds to a human-readable string.
 *
 * Examples:
 *   45      → "45s"
 *   3600    → "1h 0m"
 *   9300    → "2h 35m"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/**
 * Format a distance given in kilometres to a human-readable string.
 *
 * Examples:
 *   0.4   → "400 m"
 *   1.0   → "1.0 km"
 *   125.3 → "125.3 km"
 */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
