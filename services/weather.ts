import type { Coordinates, WeatherData } from '@/types';

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.openweathermap.org/data/2.5';

function getApiKey(): string | null {
  return process.env.OPENWEATHERMAP_API_KEY ?? null;
}

// ─── Types: raw OWM response shapes ──────────────────────────────────────────

interface OwmWeatherResponse {
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  wind: {
    speed: number;
  };
  clouds: {
    all: number; // cloud coverage 0–100 %
  };
  uvi?: number; // only in OneCall API; may be absent here
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Mock weather data used when no API key is configured (e.g. in development).
 */
function mockWeatherData(coords: Coordinates): WeatherData {
  // Use latitude to roughly approximate hemisphere / climate zone
  const isNorthernHemisphere = coords.lat >= 0;
  const absLat = Math.abs(coords.lat);

  // Very rough temperature heuristic
  const temperature = isNorthernHemisphere
    ? Math.max(-10, 30 - absLat * 0.5)
    : Math.max(-5, 25 - absLat * 0.4);

  return {
    cloudCoverage: 50,
    description: 'partly cloudy (mock data — no API key)',
    uvIndex: 4,
    temperature: Math.round(temperature),
    windSpeed: 3.5,
    icon: '02d',
  };
}

/**
 * Map a raw OWM response to our `WeatherData` type.
 */
function mapOwmResponse(data: OwmWeatherResponse): WeatherData {
  return {
    cloudCoverage: data.clouds.all,
    description: data.weather[0]?.description ?? 'unknown',
    uvIndex: data.uvi,
    temperature: Math.round(data.main.temp - 273.15), // Kelvin → Celsius
    windSpeed: data.wind.speed,
    icon: data.weather[0]?.icon ?? '01d',
  };
}

/**
 * Shared fetch wrapper; throws on non-OK responses.
 */
async function owmFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    // Cache weather for 10 minutes to avoid unnecessary calls
    next: { revalidate: 600 },
  } as RequestInit);

  if (response.status === 401) {
    throw new Error(
      'Invalid OpenWeatherMap API key. Please check your OPENWEATHERMAP_API_KEY.',
    );
  }

  if (response.status === 429) {
    throw new Error(
      'OpenWeatherMap rate limit exceeded. Please wait before retrying.',
    );
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { message?: string };
      detail = body?.message ?? '';
    } catch {
      // ignore parse errors
    }
    throw new Error(
      `OpenWeatherMap API error ${response.status}${detail ? `: ${detail}` : ''}`,
    );
  }

  return response.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch current weather conditions for a single coordinate pair.
 *
 * Falls back to mock data (50% cloud coverage) if no API key is configured
 * so the rest of the app can function without weather credentials in development.
 */
export async function getWeatherAtLocation(
  coords: Coordinates,
): Promise<WeatherData> {
  const key = getApiKey();

  if (!key) {
    console.warn(
      '[weather] OPENWEATHERMAP_API_KEY not set — using mock weather data.',
    );
    return mockWeatherData(coords);
  }

  const url = new URL(`${BASE_URL}/weather`);
  url.searchParams.set('lat', String(coords.lat));
  url.searchParams.set('lon', String(coords.lng));
  url.searchParams.set('appid', key);
  // Kelvin is the default; we convert in mapOwmResponse

  const data = await owmFetch<OwmWeatherResponse>(url.toString());
  return mapOwmResponse(data);
}

/**
 * Fetch weather at representative waypoints along a route (start, middle, end).
 *
 * We sample a maximum of three points to stay within free-tier rate limits.
 * The returned array is parallel to the input `waypoints` slice selected.
 */
export async function getWeatherAlongRoute(
  waypoints: Coordinates[],
): Promise<WeatherData[]> {
  if (waypoints.length === 0) return [];

  // Pick start, middle, end
  const sampleIndices = getSampleIndices(waypoints.length);
  const samples = sampleIndices.map((i) => waypoints[i]);

  const results = await Promise.all(
    samples.map((coords) => getWeatherAtLocation(coords)),
  );

  return results;
}

/**
 * Given a total array length, return the indices of the start, middle (if
 * applicable), and end elements.
 */
function getSampleIndices(length: number): number[] {
  if (length === 1) return [0];
  if (length === 2) return [0, 1];
  const mid = Math.floor(length / 2);
  return [0, mid, length - 1];
}

/**
 * Interpolate weather along a route using the sampled weather data.
 *
 * Given sample weather at `sampleCount` equidistant waypoints, find the
 * nearest sample for an arbitrary waypoint index within [0, totalWaypoints).
 */
export function interpolateWeather(
  sampledWeather: WeatherData[],
  waypointIndex: number,
  totalWaypoints: number,
): WeatherData {
  if (sampledWeather.length === 0) {
    return {
      cloudCoverage: 50,
      description: 'unknown',
      temperature: 20,
      windSpeed: 2,
      icon: '01d',
    };
  }

  if (sampledWeather.length === 1) return sampledWeather[0];

  // Map waypointIndex to a floating-point position within the samples array
  const samplePosition =
    (waypointIndex / Math.max(1, totalWaypoints - 1)) *
    (sampledWeather.length - 1);

  const lowerIdx = Math.floor(samplePosition);
  const upperIdx = Math.min(lowerIdx + 1, sampledWeather.length - 1);
  const t = samplePosition - lowerIdx;

  if (lowerIdx === upperIdx) return sampledWeather[lowerIdx];

  const lower = sampledWeather[lowerIdx];
  const upper = sampledWeather[upperIdx];

  // Linear interpolation for numeric fields
  return {
    cloudCoverage: Math.round(lerp(lower.cloudCoverage, upper.cloudCoverage, t)),
    description: t < 0.5 ? lower.description : upper.description,
    uvIndex:
      lower.uvIndex !== undefined && upper.uvIndex !== undefined
        ? Math.round(lerp(lower.uvIndex, upper.uvIndex, t) * 10) / 10
        : lower.uvIndex ?? upper.uvIndex,
    temperature: Math.round(lerp(lower.temperature, upper.temperature, t)),
    windSpeed: Math.round(lerp(lower.windSpeed, upper.windSpeed, t) * 10) / 10,
    icon: t < 0.5 ? lower.icon : upper.icon,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
