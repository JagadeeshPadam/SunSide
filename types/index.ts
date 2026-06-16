// ─── Core Geography ───────────────────────────────────────────────────────────

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  name: string;
  coordinates: Coordinates;
  address?: string;
}

// ─── Vehicle ──────────────────────────────────────────────────────────────────

export type VehicleType = 'car' | 'bus' | 'train' | 'bike';

// ─── Route ────────────────────────────────────────────────────────────────────

export interface RouteSegment {
  /** Start coordinates of this segment */
  startCoords: Coordinates;
  /** End coordinates of this segment */
  endCoords: Coordinates;
  /** Compass heading in degrees (0 = North, 90 = East, 180 = South, 270 = West) */
  heading: number;
  /** Distance of segment in km */
  distance: number;
  /** Duration of segment in seconds */
  duration: number;
  /** Absolute timestamp when vehicle enters this segment */
  startTime: Date;
  /** Absolute timestamp when vehicle exits this segment */
  endTime: Date;
}

// ─── Solar ────────────────────────────────────────────────────────────────────

export interface SolarPosition {
  /** Sun azimuth in degrees (0 = North, 90 = East, 180 = South, 270 = West) */
  azimuth: number;
  /** Sun altitude above horizon in degrees (negative = below horizon) */
  altitude: number;
  /** Sunrise time at location */
  sunrise: Date;
  /** Sunset time at location */
  sunset: Date;
}

// ─── Weather ──────────────────────────────────────────────────────────────────

export interface WeatherData {
  /** Cloud coverage percentage 0–100 */
  cloudCoverage: number;
  /** Human-readable description, e.g. "partly cloudy" */
  description: string;
  /** UV index (optional — not always available) */
  uvIndex?: number;
  /** Temperature in Celsius */
  temperature: number;
  /** Wind speed in m/s */
  windSpeed: number;
  /** OpenWeatherMap icon code, e.g. "01d" */
  icon: string;
}

// ─── Exposure ─────────────────────────────────────────────────────────────────

/** Which side of the vehicle faces direct sunlight */
export type ExposureSide = 'left' | 'right' | 'front' | 'rear' | 'minimal';

// ─── Segment Analysis ─────────────────────────────────────────────────────────

export interface SegmentAnalysis {
  segment: RouteSegment;
  solarPosition: SolarPosition;
  exposureSide: ExposureSide;
  /** Exposure intensity 0–100 (higher = more direct sun) */
  exposureScore: number;
  weatherData: WeatherData;
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export interface SeatingRecommendation {
  /** Start of the time window when this recommendation applies */
  startTime: Date;
  /** End of the time window when this recommendation applies */
  endTime: Date;
  /** Recommended side to sit on (opposite to exposure side) */
  side: ExposureSide;
  /** Average exposure score for this window */
  exposureScore: number;
  /** Percentage of journey duration covered by this recommendation */
  percentage: number;
  /** Human-readable label, e.g. "Sit on the right side" */
  label: string;
}

// ─── Journey Summary ──────────────────────────────────────────────────────────

export interface JourneySummary {
  /** Total route distance in km */
  distance: number;
  /** Total journey duration in seconds */
  duration: number;
  /** Scheduled departure time */
  departureTime: Date;
  /** Expected arrival time */
  arrivalTime: Date;
  /** Weighted average exposure score across all segments */
  totalExposureScore: number;
  /** Overall journey comfort score 0–100 (higher = more comfortable) */
  comfortScore: number;
  /** How much exposure is reduced vs worst-case (percentage) */
  exposureReductionPercentage: number;
}

// ─── Full Analysis Result ─────────────────────────────────────────────────────

export interface AnalysisResult {
  journey: JourneySummary;
  recommendations: SeatingRecommendation[];
  segmentAnalyses: SegmentAnalysis[];
  weatherSummary: WeatherData;
  mapData: MapSegmentData[];
}

// ─── Departure Optimization ───────────────────────────────────────────────────

export interface OptimizationResult {
  /** ISO string of departure time tested */
  departureTime: string;
  /** Weighted exposure score for this departure */
  exposureScore: number;
  /** Percentage reduction vs the worst departure in the tested window */
  exposureReduction: number;
  recommendations: SeatingRecommendation[];
}

export interface DepartureOptimization {
  /** ISO string of the optimal departure time */
  bestTime: string;
  /** Exposure score at optimal departure */
  bestScore: number;
  /** Percentage exposure reduction vs baseline */
  bestReduction: number;
  /** All tested departure options, sorted by exposureScore ascending */
  options: OptimizationResult[];
}

// ─── Map Data ─────────────────────────────────────────────────────────────────

export interface MapSegmentData {
  /** GeoJSON-compatible [lng, lat] coordinate pairs */
  coordinates: [number, number][];
  exposureScore: number;
  exposureSide: ExposureSide;
}

// ─── API Request ──────────────────────────────────────────────────────────────

export interface AnalysisRequest {
  source: Location;
  destination: Location;
  /** ISO 8601 date-time string */
  departureTime: string;
  vehicleType: VehicleType;
  /** When true, also run departure-time optimization */
  optimizeDeparture?: boolean;
  /** How many minutes before/after departure to search (default 120) */
  optimizationWindowMinutes?: number;
}
