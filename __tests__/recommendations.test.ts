/// <reference types="@jest/globals" />
import { generateRecommendations, formatDuration, formatDistance } from '@/lib/recommendations';
import type { SegmentAnalysis, RouteSegment, SolarPosition, WeatherData, ExposureSide } from '@/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeSegment(
  startOffsetSec: number,
  durationSec: number,
  overrides?: Partial<RouteSegment>,
): RouteSegment {
  const base = new Date('2024-06-21T09:00:00Z');
  const startTime = new Date(base.getTime() + startOffsetSec * 1000);
  const endTime = new Date(startTime.getTime() + durationSec * 1000);
  return {
    startCoords: { lat: 51.5, lng: -0.1 },
    endCoords: { lat: 51.6, lng: -0.0 },
    heading: 45,
    distance: 5,
    duration: durationSec,
    startTime,
    endTime,
    ...overrides,
  };
}

const solarPos: SolarPosition = {
  azimuth: 180,
  altitude: 45,
  sunrise: new Date('2024-06-21T04:00:00Z'),
  sunset: new Date('2024-06-21T21:00:00Z'),
};

const weather: WeatherData = {
  cloudCoverage: 10,
  description: 'clear sky',
  temperature: 22,
  windSpeed: 3,
  icon: '01d',
};

function makeAnalysis(
  startOffsetSec: number,
  durationSec: number,
  exposureSide: ExposureSide,
  exposureScore: number,
): SegmentAnalysis {
  return {
    segment: makeSegment(startOffsetSec, durationSec),
    solarPosition: solarPos,
    exposureSide,
    exposureScore,
    weatherData: weather,
  };
}

// ─── generateRecommendations ──────────────────────────────────────────────────

describe('generateRecommendations', () => {
  it('returns an empty array for empty input', () => {
    expect(generateRecommendations([])).toEqual([]);
  });

  it('groups consecutive same-side segments into one recommendation', () => {
    const analyses: SegmentAnalysis[] = [
      makeAnalysis(0, 300, 'right', 60),
      makeAnalysis(300, 300, 'right', 70),
      makeAnalysis(600, 300, 'right', 65),
    ];
    const recs = generateRecommendations(analyses);
    expect(recs).toHaveLength(1);
  });

  it('splits different exposure sides into separate recommendations', () => {
    const analyses: SegmentAnalysis[] = [
      makeAnalysis(0, 300, 'left', 50),
      makeAnalysis(300, 300, 'right', 60),
    ];
    const recs = generateRecommendations(analyses);
    expect(recs).toHaveLength(2);
  });

  it('recommends opposite side to the exposed side', () => {
    const analyses: SegmentAnalysis[] = [makeAnalysis(0, 300, 'left', 50)];
    const recs = generateRecommendations(analyses);
    expect(recs[0].side).toBe('right');
  });

  it('recommends opposite side when exposure is on the right', () => {
    const analyses: SegmentAnalysis[] = [makeAnalysis(0, 300, 'right', 50)];
    const recs = generateRecommendations(analyses);
    expect(recs[0].side).toBe('left');
  });

  it('recommends "minimal" when exposure side is "minimal"', () => {
    const analyses: SegmentAnalysis[] = [makeAnalysis(0, 300, 'minimal', 0)];
    const recs = generateRecommendations(analyses);
    expect(recs[0].side).toBe('minimal');
  });

  it('merges same-side groups within the 15-minute merge window', () => {
    // 14-minute gap between two right-side exposures → should merge
    const analyses: SegmentAnalysis[] = [
      makeAnalysis(0, 300, 'right', 60),
      makeAnalysis(300 + 14 * 60, 300, 'right', 70),
    ];
    const recs = generateRecommendations(analyses);
    expect(recs).toHaveLength(1);
  });

  it('does NOT merge groups with a gap exceeding 15 minutes', () => {
    // 16-minute gap between same side → should NOT merge
    const analyses: SegmentAnalysis[] = [
      makeAnalysis(0, 300, 'right', 60),
      makeAnalysis(300 + 16 * 60, 300, 'right', 70),
    ];
    const recs = generateRecommendations(analyses);
    expect(recs).toHaveLength(2);
  });

  it('percentage sums to approximately 100 for a multi-segment journey', () => {
    const analyses: SegmentAnalysis[] = [
      makeAnalysis(0, 600, 'left', 50),
      makeAnalysis(600, 600, 'right', 60),
    ];
    const recs = generateRecommendations(analyses);
    const total = recs.reduce((sum, r) => sum + r.percentage, 0);
    // Due to rounding, accept values between 98 and 102
    expect(total).toBeGreaterThanOrEqual(98);
    expect(total).toBeLessThanOrEqual(102);
  });

  it('each recommendation has a non-empty label string', () => {
    const analyses: SegmentAnalysis[] = [
      makeAnalysis(0, 300, 'left', 50),
      makeAnalysis(300, 300, 'minimal', 0),
    ];
    const recs = generateRecommendations(analyses);
    for (const rec of recs) {
      expect(typeof rec.label).toBe('string');
      expect(rec.label.length).toBeGreaterThan(0);
    }
  });

  it('startTime and endTime are Date instances', () => {
    const analyses: SegmentAnalysis[] = [makeAnalysis(0, 300, 'right', 60)];
    const recs = generateRecommendations(analyses);
    expect(recs[0].startTime).toBeInstanceOf(Date);
    expect(recs[0].endTime).toBeInstanceOf(Date);
  });

  it('endTime is after startTime', () => {
    const analyses: SegmentAnalysis[] = [makeAnalysis(0, 300, 'right', 60)];
    const recs = generateRecommendations(analyses);
    expect(recs[0].endTime.getTime()).toBeGreaterThan(recs[0].startTime.getTime());
  });
});

// ─── formatDuration ───────────────────────────────────────────────────────────

describe('formatDuration', () => {
  it('formats sub-minute durations as seconds', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  it('formats exactly 1 minute', () => {
    expect(formatDuration(60)).toBe('1m');
  });

  it('formats minutes without hours', () => {
    expect(formatDuration(90)).toBe('2m');
  });

  it('formats exactly 1 hour', () => {
    expect(formatDuration(3600)).toBe('1h 0m');
  });

  it('formats hours and minutes', () => {
    expect(formatDuration(9300)).toBe('2h 35m');
  });

  it('formats 0 seconds as "0s"', () => {
    expect(formatDuration(0)).toBe('0s');
  });
});

// ─── formatDistance ───────────────────────────────────────────────────────────

describe('formatDistance', () => {
  it('formats distances under 1 km in metres', () => {
    expect(formatDistance(0.4)).toBe('400 m');
  });

  it('formats exactly 1 km', () => {
    expect(formatDistance(1)).toBe('1.0 km');
  });

  it('formats distances over 1 km with one decimal place', () => {
    expect(formatDistance(125.3)).toBe('125.3 km');
  });

  it('formats 0.999 km as metres', () => {
    expect(formatDistance(0.999)).toBe('999 m');
  });

  it('formats small distances as "0 m"', () => {
    expect(formatDistance(0)).toBe('0 m');
  });
});
