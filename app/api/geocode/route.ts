import type { NextRequest } from 'next/server';
import { geocodeLocation } from '@/services/openroute';

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = request.nextUrl;
  const query = searchParams.get('q');

  if (!query || query.trim().length === 0) {
    return Response.json(
      { error: 'Missing required query parameter: q' },
      { status: 400 },
    );
  }

  try {
    const locations = await geocodeLocation(query.trim());
    return Response.json({ locations });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Geocoding failed';

    if (message.includes('rate limit')) {
      return Response.json({ error: message }, { status: 429 });
    }

    if (message.includes('API error')) {
      return Response.json({ error: message }, { status: 502 });
    }

    if (message.includes('environment variable')) {
      return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
