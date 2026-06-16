import type { NextRequest } from 'next/server';
import type { AnalysisRequest } from '@/types';
import { optimizeDeparture } from '@/lib/analysis';

interface OptimizeRequestBody {
  request: AnalysisRequest;
  windowMinutes?: number;
}

export async function POST(request: NextRequest): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'Request body must be a JSON object' }, { status: 400 });
  }

  const { request: analysisRequest, windowMinutes } = body as Partial<OptimizeRequestBody>;

  if (!analysisRequest) {
    return Response.json({ error: 'Missing required field: request' }, { status: 400 });
  }

  if (
    !analysisRequest.source ||
    !analysisRequest.destination ||
    !analysisRequest.departureTime ||
    !analysisRequest.vehicleType
  ) {
    return Response.json(
      { error: 'Missing required fields in request: source, destination, departureTime, vehicleType' },
      { status: 400 },
    );
  }

  const window = typeof windowMinutes === 'number' && windowMinutes > 0 ? windowMinutes : 120;

  try {
    const result = await optimizeDeparture(analysisRequest, window);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Optimization failed';

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
