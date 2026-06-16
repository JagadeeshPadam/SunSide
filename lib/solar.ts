import SunCalc from 'suncalc';
import type { Coordinates, SolarPosition, ExposureSide, SeatingRecommendation } from '@/types';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum sun altitude in degrees before we consider exposure negligible */
const MIN_ALTITUDE_DEGREES = 5;

/** Half-width of the "front/rear" cone in degrees */
const FRONT_REAR_HALF_ANGLE = 45;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise an angle to the range [0, 360).
 */
function normaliseDegrees(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Convert radians to degrees.
 */
function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calculate the sun's position for a given location and moment in time.
 *
 * SunCalc returns azimuth measured from **South** in radians, where negative
 * values are West and positive are East.  We convert to the conventional
 * meteorological bearing where 0° = North, 90° = East, 180° = South, 270° = West.
 */
export function getSolarPosition(coords: Coordinates, date: Date): SolarPosition {
  const pos = SunCalc.getPosition(date, coords.lat, coords.lng);
  const times = SunCalc.getTimes(date, coords.lat, coords.lng);

  // SunCalc azimuth: 0 = South, radians, positive clockwise from South (looking down)
  // Convert to North-based bearing: add 180°
  const azimuthDeg = normaliseDegrees(radToDeg(pos.azimuth) + 180);
  const altitudeDeg = radToDeg(pos.altitude);

  return {
    azimuth: azimuthDeg,
    altitude: altitudeDeg,
    sunrise: times.sunrise,
    sunset: times.sunset,
  };
}

/**
 * Determine which side of a moving vehicle receives the most direct sunlight.
 *
 * @param vehicleHeading - Direction the vehicle is travelling, 0–360° (0 = North)
 * @param sunAzimuth     - Sun's compass bearing, 0–360° (0 = North)
 * @param sunAltitude    - Sun's elevation above the horizon in degrees
 * @returns The vehicle side that faces the sun
 */
export function getSunExposureSide(
  vehicleHeading: number,
  sunAzimuth: number,
  sunAltitude: number,
): ExposureSide {
  // Sun is below (or barely above) the horizon — negligible exposure
  if (sunAltitude < MIN_ALTITUDE_DEGREES) {
    return 'minimal';
  }

  // Angle of the sun relative to the vehicle's forward direction.
  // Positive = sun is clockwise from the nose (i.e. to the right when facing forward).
  const relativeAngle = normaliseDegrees(sunAzimuth - vehicleHeading);

  // relativeAngle is now in [0, 360):
  //   0°   = directly ahead
  //   90°  = directly to the right
  //   180° = directly behind
  //   270° = directly to the left

  if (relativeAngle <= FRONT_REAR_HALF_ANGLE || relativeAngle >= 360 - FRONT_REAR_HALF_ANGLE) {
    return 'front';
  }

  if (relativeAngle >= 180 - FRONT_REAR_HALF_ANGLE && relativeAngle <= 180 + FRONT_REAR_HALF_ANGLE) {
    return 'rear';
  }

  if (relativeAngle > FRONT_REAR_HALF_ANGLE && relativeAngle < 180) {
    return 'right';
  }

  // 180° < relativeAngle < 315°
  return 'left';
}

/**
 * Calculate an exposure intensity score from 0 (no exposure) to 100 (maximum).
 *
 * Factors:
 *  - Sun altitude:   higher = more intense (linear up to 90°)
 *  - Cloud coverage: proportionally reduces intensity (weight 0.4)
 *  - Duration:       longer segments accumulate more exposure (logarithmic cap)
 *
 * Night-time / below-horizon conditions always return 0.
 */
export function calculateExposureScore(
  solarPosition: SolarPosition,
  cloudCoverage: number,
  duration: number,
): number {
  if (solarPosition.altitude < MIN_ALTITUDE_DEGREES) {
    return 0;
  }

  // Altitude component: 0–1, linear from 5° to 90°
  const altitudeFactor = Math.min((solarPosition.altitude - MIN_ALTITUDE_DEGREES) / (90 - MIN_ALTITUDE_DEGREES), 1);

  // Cloud coverage reduces intensity; weight is 0.4 so even full overcast
  // still produces 60% of the base score (scattered UV still reaches the surface).
  const cloudFactor = 1 - (cloudCoverage / 100) * 0.4;

  // Duration factor: each additional hour adds diminishing returns.
  // At 5 min (300 s) → ~0.6, at 60 min (3600 s) → ~1.0, caps near 1.2.
  const durationHours = duration / 3600;
  const durationFactor = Math.min(0.5 + Math.log1p(durationHours) * 0.5, 1.2);

  const raw = altitudeFactor * cloudFactor * durationFactor * 100;

  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Derive an overall journey comfort score (0–100, higher = more comfortable).
 *
 * A lower average exposure score across all time-weighted recommendations
 * translates to a higher comfort score.
 */
export function getComfortScore(
  recommendations: SeatingRecommendation[],
  totalDuration: number,
): number {
  if (recommendations.length === 0 || totalDuration <= 0) {
    return 100;
  }

  let weightedExposure = 0;

  for (const rec of recommendations) {
    const segmentSeconds =
      (rec.endTime.getTime() - rec.startTime.getTime()) / 1000;
    const weight = segmentSeconds / totalDuration;
    weightedExposure += rec.exposureScore * weight;
  }

  // Invert: high exposure → low comfort
  const comfort = 100 - weightedExposure;
  return Math.round(Math.max(0, Math.min(100, comfort)));
}
