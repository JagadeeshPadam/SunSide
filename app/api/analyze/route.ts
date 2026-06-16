import type { NextRequest } from 'next/server';
import type { AnalysisRequest } from '@/types';
import { analyzeRoute } from '@/lib/analysis';

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Basic shape validation
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const req = body as Partial<AnalysisRequest>;

  if (!req.source || !req.destination || !req.departureTime || !req.vehicleType) {
    return Response.json(
      { error: 'Missing required fields: source, destination, departureTime, vehicleType' },
      { status: 400 },
    );
  }

  try {
    const result = await analyzeRoute(req as AnalysisRequest);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';

    if (message.includes('rate limit')) {
      return Response.json({ error: message }, { status: 429 });
    }

    if (message.includes('No route found')) {
      return Response.json({ error: message }, { status: 422 });
    }

    if (message.includes('environment variable') || message.includes('misconfiguration')) {
      return Response.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    if (message.includes('API error')) {
      return Response.json({ error: message }, { status: 502 });
    }

    return Response.json({ error: message }, { status: 500 });
  }
}
