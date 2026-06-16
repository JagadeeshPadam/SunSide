/// <reference types="@jest/globals" />
import { calculateHeading, calculateDistance, segmentRoute } from '@/lib/route';
import type { Coordinates } from '@/types';

// ─── calculateHeading ────────────────────────────────────────────────────────

describe('calculateHeading', () => {
  it('returns ~0° (North) when travelling due north', () => {
    const start: Coordinates = { lat: 0, lng: 0 };
    const end: Coordinates = { lat: 1, lng: 0 };
    const heading = calculateHeading(start, end);
    expect(heading).toBeCloseTo(0, 0);
  });

  it('returns ~90° (East) when travelling due east', () => {
    const start: Coordinates = { lat: 0, lng: 0 };
    const end: Coordinates = { lat: 0, lng: 1 };
    const heading = calculateHeading(start, end);
    expect(heading).toBeCloseTo(90, 0);
  });

  it('returns ~180° (South) when travelling due south', () => {
    const start: Coordinates = { lat: 1, lng: 0 };
    const end: Coordinates = { lat: 0, lng: 0 };
    const heading = calculateHeading(start, end);
    expect(heading).toBeCloseTo(180, 0);
  });

  it('returns ~270° (West) when travelling due west', () => {
    const start: Coordinates = { lat: 0, lng: 1 };
    const end: Coordinates = { lat: 0, lng: 0 };
    const heading = calculateHeading(start, end);
    expect(heading).toBeCloseTo(270, 0);
  });

  it('returns a value in [0, 360) for a diagonal path', () => {
    const start: Coordinates = { lat: 51.5, lng: -0.1 };
    const end: Coordinates = { lat: 48.8, lng: 2.3 };
    const heading = calculateHeading(start, end);
    expect(heading).toBeGreaterThanOrEqual(0);
    expect(heading).toBeLessThan(360);
  });

  it('returns a south-easterly bearing for London → Paris', () => {
    // London to Paris is roughly SE
    const london: Coordinates = { lat: 51.5074, lng: -0.1278 };
    const paris: Coordinates = { lat: 48.8566, lng: 2.3522 };
    const heading = calculateHeading(london, paris);
    expect(heading).toBeGreaterThan(100);
    expect(heading).toBeLessThan(160);
  });
});

// ─── calculateDistance ───────────────────────────────────────────────────────

describe('calculateDistance', () => {
  it('returns 0 for identical coordinates', () => {
    const point: Coordinates = { lat: 51.5, lng: -0.1 };
    expect(calculateDistance(point, point)).toBeCloseTo(0, 5);
  });

  it('returns ~111 km per degree of latitude at the equator', () => {
    const start: Coordinates = { lat: 0, lng: 0 };
    const end: Coordinates = { lat: 1, lng: 0 };
    const dist = calculateDistance(start, end);
    // Haversine with mean Earth radius 6371 km gives ~111.19 km per degree at equator
    expect(dist).toBeGreaterThan(110);
    expect(dist).toBeLessThan(112);
  });

  it('returns the correct London–Paris distance (~340 km)', () => {
    const london: Coordinates = { lat: 51.5074, lng: -0.1278 };
    const paris: Coordinates = { lat: 48.8566, lng: 2.3522 };
    const dist = calculateDistance(london, paris);
    // Haversine result is ~341 km
    expect(dist).toBeGreaterThan(330);
    expect(dist).toBeLessThan(360);
  });

  it('is symmetric (A→B equals B→A)', () => {
    const a: Coordinates = { lat: 40.7128, lng: -74.006 };  // New York
    const b: Coordinates = { lat: 34.0522, lng: -118.2437 }; // Los Angeles
    expect(calculateDistance(a, b)).toBeCloseTo(calculateDistance(b, a), 5);
  });

  it('returns a positive number for different coordinates', () => {
    const start: Coordinates = { lat: 0, lng: 0 };
    const end: Coordinates = { lat: 0, lng: 1 };
    expect(calculateDistance(start, end)).toBeGreaterThan(0);
  });
});

// ─── segmentRoute ─────────────────────────────────────────────────────────────

describe('segmentRoute', () => {
  const departure = new Date('2024-06-21T09:00:00Z');

  // Simple straight-line coordinates: London → slightly south-east
  const coords: [number, number][] = [
    [-0.1278, 51.5074], // London
    [-0.0778, 51.4574],
    [-0.0278, 51.4074],
    [0.0222, 51.3574],
    [0.0722, 51.3074],
  ];

  it('returns an empty array for fewer than 2 coordinates', () => {
    const result = segmentRoute([[-0.1278, 51.5074]], departure, 3600);
    expect(result).toEqual([]);
  });

  it('returns at least one segment for a valid route', () => {
    const result = segmentRoute(coords, departure, 3600);
    expect(result.length).toBeGreaterThan(0);
  });

  it('each segment has startCoords and endCoords', () => {
    const result = segmentRoute(coords, departure, 3600);
    for (const seg of result) {
      expect(seg.startCoords).toBeDefined();
      expect(seg.endCoords).toBeDefined();
      expect(typeof seg.startCoords.lat).toBe('number');
      expect(typeof seg.startCoords.lng).toBe('number');
    }
  });

  it('each segment has a heading in [0, 360)', () => {
    const result = segmentRoute(coords, departure, 3600);
    for (const seg of result) {
      expect(seg.heading).toBeGreaterThanOrEqual(0);
      expect(seg.heading).toBeLessThan(360);
    }
  });

  it('each segment has a positive distance and duration', () => {
    const result = segmentRoute(coords, departure, 3600);
    for (const seg of result) {
      expect(seg.distance).toBeGreaterThan(0);
      expect(seg.duration).toBeGreaterThan(0);
    }
  });

  it('segment startTime is not before departure', () => {
    const result = segmentRoute(coords, departure, 3600);
    expect(result[0].startTime.getTime()).toBeGreaterThanOrEqual(departure.getTime());
  });

  it('segment endTime is after startTime', () => {
    const result = segmentRoute(coords, departure, 3600);
    for (const seg of result) {
      expect(seg.endTime.getTime()).toBeGreaterThan(seg.startTime.getTime());
    }
  });

  it('consecutive segments are contiguous in time', () => {
    const result = segmentRoute(coords, departure, 3600);
    for (let i = 1; i < result.length; i++) {
      // end of previous ≈ start of current (floating point tolerances)
      expect(result[i].startTime.getTime()).toBeCloseTo(
        result[i - 1].endTime.getTime(),
        -2, // within 100 ms
      );
    }
  });

  it('first segment startCoords match the first coordinate', () => {
    const result = segmentRoute(coords, departure, 3600);
    expect(result[0].startCoords.lat).toBeCloseTo(coords[0][1], 5);
    expect(result[0].startCoords.lng).toBeCloseTo(coords[0][0], 5);
  });
});
