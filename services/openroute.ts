import type { Coordinates, Location } from '@/types';

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = 'https://api.openrouteservice.org';

function getApiKey(): string {
  const key = process.env.OPENROUTESERVICE_API_KEY;
  if (!key) {
    throw new Error(
      'OPENROUTESERVICE_API_KEY environment variable is not set. ' +
        'Please add it to your .env.local file.',
    );
  }
  return key;
}

// ─── Types: raw ORS response shapes ──────────────────────────────────────────

interface OrsGeocodingFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    label?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    locality?: string;
    region?: string;
    country?: string;
    confidence?: number;
  };
}

interface OrsGeocodingResponse {
  type: 'FeatureCollection';
  features: OrsGeocodingFeature[];
}

interface OrsRouteResponse {
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'LineString';
      coordinates: [number, number][];
    };
    properties: {
      segments: Array<{
        distance: number;
        duration: number;
      }>;
      summary: {
        distance: number;
        duration: number;
      };
    };
  }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map an ORS Geocoding feature to our `Location` type.
 */
function featureToLocation(feature: OrsGeocodingFeature): Location {
  const { properties, geometry } = feature;
  const [lng, lat] = geometry.coordinates;

  const name =
    properties.name ??
    properties.label?.split(',')[0]?.trim() ??
    'Unknown place';

  return {
    name,
    coordinates: { lat, lng },
    address: properties.label,
  };
}

/**
 * Shared fetch wrapper that handles 429 rate-limit and non-OK responses.
 */
async function orsFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json, application/geo+json',
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  if (response.status === 429) {
    throw new Error(
      'OpenRouteService rate limit exceeded. Please wait a moment and try again.',
    );
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      detail = body?.error?.message ?? '';
    } catch {
      // ignore parse errors
    }
    throw new Error(
      `OpenRouteService API error ${response.status}${detail ? `: ${detail}` : ''}`,
    );
  }

  return response.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Geocode a free-text query to a list of candidate `Location` objects.
 *
 * @param query - e.g. "Eiffel Tower, Paris"
 * @returns     Up to 10 matching locations, sorted by confidence
 */
export async function geocodeLocation(query: string): Promise<Location[]> {
  const key = getApiKey();

  const url = new URL(`${BASE_URL}/geocode/search`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('text', query);
  url.searchParams.set('size', '10');

  const data = await orsFetch<OrsGeocodingResponse>(url.toString());

  return data.features.map(featureToLocation);
}

export type RoutingProfile =
  | 'driving-car'
  | 'foot-walking'
  | 'cycling-regular';

/**
 * Map a VehicleType to an ORS routing profile.
 *
 * Note: ORS free tier does not offer a rail profile, so trains use
 * `driving-car` as a reasonable approximation for road geometry.
 */
export function vehicleTypeToProfile(
  vehicleType: string,
): RoutingProfile {
  switch (vehicleType) {
    case 'bike':
      return 'cycling-regular';
    case 'train':
    case 'bus':
    case 'car':
    default:
      return 'driving-car';
  }
}

/**
 * Fetch a driving/cycling/walking route between two coordinates.
 *
 * @param source      - Origin coordinates
 * @param destination - Destination coordinates
 * @param profile     - ORS routing profile (default: 'driving-car')
 * @returns Route geometry (array of [lng, lat] pairs), total distance (m→km),
 *          and total duration (seconds)
 */
export async function getRoute(
  source: Coordinates,
  destination: Coordinates,
  profile: RoutingProfile = 'driving-car',
): Promise<{
  coordinates: [number, number][];
  distance: number;
  duration: number;
}> {
  const key = getApiKey();

  const url = `${BASE_URL}/v2/directions/${profile}/geojson`;

  const body = {
    coordinates: [
      [source.lng, source.lat],
      [destination.lng, destination.lat],
    ],
    // Request a dense polyline so segmentation is accurate
    geometry_simplify: false,
    instructions: false,
  };

  const data = await orsFetch<OrsRouteResponse>(url, {
    method: 'POST',
    headers: {
      Authorization: key,
    },
    body: JSON.stringify(body),
  });

  const feature = data.features[0];
  if (!feature) {
    throw new Error('No route found between the specified locations.');
  }

  const { coordinates } = feature.geometry;
  const { distance, duration } = feature.properties.summary;

  // ORS returns distance in metres — convert to km
  return {
    coordinates,
    distance: distance / 1000,
    duration, // seconds
  };
}
