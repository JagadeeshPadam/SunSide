'use client';

import * as React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import type { MapSegmentData, Location } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RouteMapProps {
  mapSegments: MapSegmentData[];
  source?: Location;
  destination?: Location;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function segmentColor(score: number): string {
  if (score <= 33) return '#10B981';
  if (score <= 66) return '#F59E0B';
  return '#EF4444';
}

function exposureLabel(score: number): string {
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Medium';
  return 'High';
}

// ─── No-Token Placeholder ─────────────────────────────────────────────────────

interface PlaceholderProps {
  mapSegments: MapSegmentData[];
  className?: string;
}

function NoTokenPlaceholder({ mapSegments, className }: PlaceholderProps) {
  const avgScore =
    mapSegments.length > 0
      ? Math.round(
          mapSegments.reduce((sum, s) => sum + s.exposureScore, 0) / mapSegments.length,
        )
      : null;

  const lowCount = mapSegments.filter((s) => s.exposureScore <= 33).length;
  const midCount = mapSegments.filter((s) => s.exposureScore > 33 && s.exposureScore <= 66).length;
  const highCount = mapSegments.filter((s) => s.exposureScore > 66).length;

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center overflow-hidden rounded-2xl',
        'bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950',
        'dark:from-slate-900 dark:via-slate-950 dark:to-black',
        'border border-slate-700/50',
        className,
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 h-48 w-48 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(148,163,184,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 py-12 text-center">
        {/* Icon */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-700/60 backdrop-blur-sm border border-slate-600/40 shadow-2xl">
          <MapPin size={40} className="text-slate-300" strokeWidth={1.5} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-200">Map Preview Unavailable</h3>
          <p className="mt-2 max-w-xs text-sm text-slate-400 leading-relaxed">
            Add your Mapbox token to{' '}
            <code className="rounded bg-slate-700 px-1.5 py-0.5 text-xs font-mono text-sky-300">
              .env.local
            </code>{' '}
            to see the interactive route map.
          </p>
          <code className="mt-3 inline-block rounded-lg bg-slate-800/80 border border-slate-700 px-3 py-1.5 text-xs font-mono text-emerald-400">
            NEXT_PUBLIC_MAPBOX_TOKEN=pk.ey...
          </code>
        </div>

        {/* Route stats if available */}
        {mapSegments.length > 0 && avgScore !== null && (
          <div className="flex gap-4 mt-2">
            <div className="flex flex-col items-center rounded-xl bg-slate-800/60 border border-slate-700/40 px-5 py-3 backdrop-blur-sm">
              <span className="text-2xl font-black text-slate-200">{mapSegments.length}</span>
              <span className="text-xs text-slate-400 mt-0.5">Segments</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-5 py-3 backdrop-blur-sm">
              <span className="text-2xl font-black text-emerald-400">{lowCount}</span>
              <span className="text-xs text-emerald-400/70 mt-0.5">Low Exposure</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-amber-500/10 border border-amber-500/20 px-5 py-3 backdrop-blur-sm">
              <span className="text-2xl font-black text-amber-400">{midCount}</span>
              <span className="text-xs text-amber-400/70 mt-0.5">Medium</span>
            </div>
            <div className="flex flex-col items-center rounded-xl bg-red-500/10 border border-red-500/20 px-5 py-3 backdrop-blur-sm">
              <span className="text-2xl font-black text-red-400">{highCount}</span>
              <span className="text-xs text-red-400/70 mt-0.5">High</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Map Legend ───────────────────────────────────────────────────────────────

function MapLegend() {
  return (
    <div className="absolute bottom-8 right-3 z-10 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">
        Sun Exposure
      </p>
      <div className="flex flex-col gap-1.5">
        {[
          { color: '#10B981', label: 'Low Exposure' },
          { color: '#F59E0B', label: 'Medium Exposure' },
          { color: '#EF4444', label: 'High Exposure' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="h-2.5 w-5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-600 dark:text-slate-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main RouteMap ─────────────────────────────────────────────────────────────

export function RouteMap({ mapSegments, source, destination, className }: RouteMapProps) {
  const { theme } = useTheme();
  const mapContainerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<mapboxgl.Map | null>(null);
  const markersRef = React.useRef<mapboxgl.Marker[]>([]);
  const popupRef = React.useRef<mapboxgl.Popup | null>(null);
  const [mapError, setMapError] = React.useState<string | null>(null);
  const [mapReady, setMapReady] = React.useState(false);
  const [mapboxgl, setMapboxgl] = React.useState<typeof import('mapbox-gl') | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // Dynamically import mapbox-gl (browser-only)
  React.useEffect(() => {
    if (!token) return;
    let cancelled = false;
    import('mapbox-gl').then((mod) => {
      if (!cancelled) setMapboxgl(mod);
    }).catch(() => {
      if (!cancelled) setMapError('Failed to load Mapbox GL.');
    });
    return () => { cancelled = true; };
  }, [token]);

  // Initialize map once mapboxgl is loaded
  React.useEffect(() => {
    if (!mapboxgl || !mapContainerRef.current || !token) return;
    if (mapRef.current) return; // already initialized

    mapboxgl.default.accessToken = token;

    const style =
      theme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.default.Map({
        container: mapContainerRef.current,
        style,
        center: [0, 20],
        zoom: 2,
        attributionControl: false,
        logoPosition: 'bottom-left',
      });
    } catch {
      setMapError('Unable to initialize Mapbox map. Check your token.');
      return;
    }

    mapRef.current = map;

    // Navigation controls
    map.addControl(new mapboxgl.default.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(
      new mapboxgl.default.AttributionControl({ compact: true }),
      'bottom-left',
    );

    map.on('load', () => {
      setMapReady(true);
    });

    map.on('error', (e) => {
      console.error('[RouteMap] Mapbox error:', e);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxgl, token]);

  // Switch map style when theme changes
  React.useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const style =
      theme === 'dark'
        ? 'mapbox://styles/mapbox/dark-v11'
        : 'mapbox://styles/mapbox/light-v11';
    mapRef.current.setStyle(style);
    // After style change, re-add routes
    mapRef.current.once('style.load', () => {
      addRouteToMap();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Add/update route when segments or map is ready
  React.useEffect(() => {
    if (!mapReady) return;
    addRouteToMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, mapSegments, source, destination]);

  function addRouteToMap() {
    const map = mapRef.current;
    const mgl = mapboxgl;
    if (!map || !mgl || !mapSegments.length) return;

    // Remove existing layers and sources
    const layerIds = ['route-line'];
    layerIds.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    // Remove segment layers
    map.getStyle()?.layers?.forEach((layer) => {
      if (layer.id.startsWith('segment-')) {
        map.removeLayer(layer.id);
      }
    });
    // Remove sources
    if (map.getSource('route')) map.removeSource('route');
    map.getStyle()?.sources &&
      Object.keys(map.getStyle()!.sources).forEach((srcId) => {
        if (srcId.startsWith('segment-')) {
          if (map.getSource(srcId)) map.removeSource(srcId);
        }
      });

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Collect all coordinates
    const allCoords: [number, number][] = mapSegments.flatMap((s) => s.coordinates);
    if (allCoords.length === 0) return;

    // Add each segment as its own source + layer for color coding
    mapSegments.forEach((segment, idx) => {
      if (segment.coordinates.length < 2) return;
      const srcId = `segment-${idx}`;
      const layerId = `segment-layer-${idx}`;
      const color = segmentColor(segment.exposureScore);

      map.addSource(srcId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            exposureScore: segment.exposureScore,
            exposureSide: segment.exposureSide,
          },
          geometry: {
            type: 'LineString',
            coordinates: segment.coordinates,
          },
        },
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: srcId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': 5,
          'line-opacity': 0,
        },
      });

      // Animate opacity in
      let opacity = 0;
      const step = 0.05;
      const interval = setInterval(() => {
        opacity = Math.min(0.9, opacity + step);
        if (map.getLayer(layerId)) {
          map.setPaintProperty(layerId, 'line-opacity', opacity);
        }
        if (opacity >= 0.9) clearInterval(interval);
      }, 20);

      // Hover popup
      map.on('mouseenter', layerId, (e) => {
        map.getCanvas().style.cursor = 'pointer';
        if (!e.features?.length) return;

        popupRef.current?.remove();
        const coords = (e.lngLat.toArray() as [number, number]);
        const props = e.features[0].properties as {
          exposureScore: number;
          exposureSide: string;
        };

        popupRef.current = new mgl.default.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: 12,
          className: 'sunside-popup',
        })
          .setLngLat(coords)
          .setHTML(
            `<div style="padding:8px 10px;font-family:system-ui,sans-serif;min-width:140px">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#94A3B8;margin-bottom:4px">Segment Info</div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px">
                <span style="font-size:12px;color:#64748B">Exposure</span>
                <span style="font-size:14px;font-weight:700;color:${color}">${Math.round(props.exposureScore)} / 100</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:2px">
                <span style="font-size:12px;color:#64748B">Level</span>
                <span style="font-size:12px;font-weight:600;color:${color}">${exposureLabel(props.exposureScore)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:2px">
                <span style="font-size:12px;color:#64748B">Sun Side</span>
                <span style="font-size:12px;font-weight:500;color:#CBD5E1;text-transform:capitalize">${props.exposureSide}</span>
              </div>
            </div>`,
          )
          .addTo(map);
      });

      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
        popupRef.current?.remove();
        popupRef.current = null;
      });
    });

    // Add start marker
    if (source || allCoords[0]) {
      const startCoord = source
        ? ([source.coordinates.lng, source.coordinates.lat] as [number, number])
        : allCoords[0];

      const startEl = document.createElement('div');
      startEl.innerHTML = `
        <div style="
          display:flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:#10B981;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transform:rotate(-45deg);cursor:default;
        ">
          <span style="transform:rotate(45deg);font-size:12px;font-weight:800;color:#fff;line-height:1">A</span>
        </div>`;

      const startMarker = new mgl.default.Marker({ element: startEl, anchor: 'bottom' })
        .setLngLat(startCoord)
        .setPopup(
          new mgl.default.Popup({ offset: 30 }).setHTML(
            `<div style="padding:6px 10px;font-size:13px;font-weight:600">${source?.name ?? 'Start'}</div>`,
          ),
        )
        .addTo(map);

      markersRef.current.push(startMarker);
    }

    // Add destination marker
    if (destination || allCoords[allCoords.length - 1]) {
      const endCoord = destination
        ? ([destination.coordinates.lng, destination.coordinates.lat] as [number, number])
        : allCoords[allCoords.length - 1];

      const endEl = document.createElement('div');
      endEl.innerHTML = `
        <div style="
          display:flex;align-items:center;justify-content:center;
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:#EF4444;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          transform:rotate(-45deg);cursor:default;
        ">
          <span style="transform:rotate(45deg);font-size:12px;font-weight:800;color:#fff;line-height:1">B</span>
        </div>`;

      const endMarker = new mgl.default.Marker({ element: endEl, anchor: 'bottom' })
        .setLngLat(endCoord)
        .setPopup(
          new mgl.default.Popup({ offset: 30 }).setHTML(
            `<div style="padding:6px 10px;font-size:13px;font-weight:600">${destination?.name ?? 'Destination'}</div>`,
          ),
        )
        .addTo(map);

      markersRef.current.push(endMarker);
    }

    // Fit bounds
    try {
      const bounds = allCoords.reduce(
        (b, coord) => b.extend(coord),
        new mgl.default.LngLatBounds(allCoords[0], allCoords[0]),
      );
      map.fitBounds(bounds, {
        padding: { top: 60, bottom: 80, left: 60, right: 60 },
        duration: 1000,
        maxZoom: 14,
      });
    } catch {
      // ignore bounds errors
    }
  }

  // Show placeholder if no token
  if (!token) {
    return (
      <NoTokenPlaceholder
        mapSegments={mapSegments}
        className={cn('min-h-[400px]', className)}
      />
    );
  }

  // Show error state
  if (mapError) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200 dark:border-red-800',
          'bg-red-50 dark:bg-red-950/20 min-h-[300px] text-center px-6',
          className,
        )}
      >
        <MapPin size={32} className="text-red-400" />
        <p className="font-semibold text-red-700 dark:text-red-400">Map Error</p>
        <p className="text-sm text-red-600 dark:text-red-300">{mapError}</p>
      </div>
    );
  }

  return (
    <div className={cn('relative rounded-2xl overflow-hidden', className)}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />
      {mapReady && <MapLegend />}
    </div>
  );
}

export default RouteMap;
