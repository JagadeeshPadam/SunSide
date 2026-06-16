/// <reference types="@jest/globals" />
import {
  getSolarPosition,
  getSunExposureSide,
  calculateExposureScore,
} from '@/lib/solar';
import type { Coordinates, SolarPosition } from '@/types';

// ─── getSolarPosition ─────────────────────────────────────────────────────────

describe('getSolarPosition', () => {
  const london: Coordinates = { lat: 51.5074, lng: -0.1278 };

  it('returns a valid azimuth in the range [0, 360)', () => {
    const date = new Date('2024-06-21T12:00:00Z'); // midsummer noon UTC
    const pos = getSolarPosition(london, date);
    expect(pos.azimuth).toBeGreaterThanOrEqual(0);
    expect(pos.azimuth).toBeLessThan(360);
  });

  it('returns an altitude between -90 and 90 degrees', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    const pos = getSolarPosition(london, date);
    expect(pos.altitude).toBeGreaterThanOrEqual(-90);
    expect(pos.altitude).toBeLessThanOrEqual(90);
  });

  it('returns a positive altitude at solar noon in summer', () => {
    // Solar noon at London on summer solstice is around 13:00 BST (12:00 UTC)
    const date = new Date('2024-06-21T12:00:00Z');
    const pos = getSolarPosition(london, date);
    expect(pos.altitude).toBeGreaterThan(0);
  });

  it('returns a negative altitude at midnight', () => {
    const date = new Date('2024-06-21T00:00:00Z');
    const pos = getSolarPosition(london, date);
    expect(pos.altitude).toBeLessThan(0);
  });

  it('returns sunrise and sunset as Date objects', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    const pos = getSolarPosition(london, date);
    expect(pos.sunrise).toBeInstanceOf(Date);
    expect(pos.sunset).toBeInstanceOf(Date);
  });

  it('sunrise is before sunset', () => {
    const date = new Date('2024-06-21T12:00:00Z');
    const pos = getSolarPosition(london, date);
    expect(pos.sunrise.getTime()).toBeLessThan(pos.sunset.getTime());
  });
});

// ─── getSunExposureSide ───────────────────────────────────────────────────────

describe('getSunExposureSide', () => {
  it('returns "minimal" when sun altitude is below 5 degrees (night)', () => {
    const result = getSunExposureSide(90, 180, 3);
    expect(result).toBe('minimal');
  });

  it('returns "minimal" when sun altitude is exactly 0', () => {
    const result = getSunExposureSide(0, 90, 0);
    expect(result).toBe('minimal');
  });

  it('returns "minimal" when sun altitude is negative', () => {
    const result = getSunExposureSide(0, 90, -10);
    expect(result).toBe('minimal');
  });

  it('returns "front" when sun is directly ahead (relative angle 0°)', () => {
    // Vehicle heading North (0°), sun also North (0°) → relative = 0°
    const result = getSunExposureSide(0, 0, 30);
    expect(result).toBe('front');
  });

  it('returns "front" when sun is within the front cone (relative angle 30°)', () => {
    // Vehicle heading East (90°), sun NNE (120°) → relative = 30°
    const result = getSunExposureSide(90, 120, 30);
    expect(result).toBe('front');
  });

  it('returns "rear" when sun is directly behind (relative angle 180°)', () => {
    // Vehicle heading North (0°), sun South (180°) → relative = 180°
    const result = getSunExposureSide(0, 180, 30);
    expect(result).toBe('rear');
  });

  it('returns "rear" when sun is within the rear cone (relative angle 210°)', () => {
    // Vehicle heading North (0°), sun SSW (210°) → relative = 210°, within rear zone
    const result = getSunExposureSide(0, 210, 30);
    expect(result).toBe('rear');
  });

  it('returns "right" when sun is to the right (relative angle 90°)', () => {
    // Vehicle heading North (0°), sun East (90°) → relative = 90°
    const result = getSunExposureSide(0, 90, 30);
    expect(result).toBe('right');
  });

  it('returns "right" when relative angle is 120°', () => {
    // Vehicle heading North (0°), sun SSE (120°) → relative = 120°
    const result = getSunExposureSide(0, 120, 30);
    expect(result).toBe('right');
  });

  it('returns "left" when sun is to the left (relative angle 270°)', () => {
    // Vehicle heading North (0°), sun West (270°) → relative = 270°
    const result = getSunExposureSide(0, 270, 30);
    expect(result).toBe('left');
  });

  it('returns "left" when relative angle is 240°', () => {
    // Vehicle heading North (0°), sun WSW (240°) → relative = 240°
    const result = getSunExposureSide(0, 240, 30);
    expect(result).toBe('left');
  });

  it('handles vehicle heading that wraps around 360°', () => {
    // Vehicle heading 350° (NNW), sun North (0°) → relative = 10° → front
    const result = getSunExposureSide(350, 0, 30);
    expect(result).toBe('front');
  });

  it('handles sun azimuth of 360° (same as 0°)', () => {
    // Vehicle heading North (0°), sun at 360° (= 0°) → relative = 0° → front
    const result = getSunExposureSide(0, 360, 30);
    expect(result).toBe('front');
  });
});

// ─── calculateExposureScore ───────────────────────────────────────────────────

describe('calculateExposureScore', () => {
  const makeSolarPos = (altitude: number): SolarPosition => ({
    azimuth: 180,
    altitude,
    sunrise: new Date('2024-06-21T04:00:00Z'),
    sunset: new Date('2024-06-21T21:00:00Z'),
  });

  it('returns 0 when sun is below the minimum altitude (night)', () => {
    const score = calculateExposureScore(makeSolarPos(3), 0, 3600);
    expect(score).toBe(0);
  });

  it('returns 0 when altitude is exactly at the threshold (5°)', () => {
    // altitude < 5 → 0; at exactly 5 it just crosses into the formula but altitudeFactor = 0
    const score = calculateExposureScore(makeSolarPos(5), 0, 3600);
    expect(score).toBe(0);
  });

  it('returns a high score for high sun, clear sky, and long duration', () => {
    // altitude=60°, no clouds, 2h segment → altitudeFactor ≈ 0.647, cloudFactor=1.0,
    // durationFactor ≈ min(0.5 + ln(2)*0.5, 1.2) ≈ 0.847 → raw ≈ 54.7, after cap = ~55
    // Use a very high altitude (85°) to guarantee a high score
    const score = calculateExposureScore(makeSolarPos(85), 0, 7200);
    expect(score).toBeGreaterThan(60);
  });

  it('heavy cloud cover reduces the score', () => {
    const clearScore = calculateExposureScore(makeSolarPos(60), 0, 3600);
    const cloudyScore = calculateExposureScore(makeSolarPos(60), 100, 3600);
    expect(cloudyScore).toBeLessThan(clearScore);
  });

  it('full overcast still produces a positive score (scattered UV)', () => {
    const score = calculateExposureScore(makeSolarPos(60), 100, 3600);
    expect(score).toBeGreaterThan(0);
  });

  it('score is 0–100 inclusive for all valid inputs', () => {
    const score = calculateExposureScore(makeSolarPos(80), 50, 1800);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('longer duration produces a higher or equal score than shorter duration', () => {
    const shortScore = calculateExposureScore(makeSolarPos(60), 20, 300);
    const longScore = calculateExposureScore(makeSolarPos(60), 20, 3600);
    expect(longScore).toBeGreaterThanOrEqual(shortScore);
  });

  it('returns an integer (Math.round)', () => {
    const score = calculateExposureScore(makeSolarPos(45), 30, 600);
    expect(Number.isInteger(score)).toBe(true);
  });
});
