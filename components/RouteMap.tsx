'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import type { MapSegmentData, Location } from '@/types';

interface RouteMapProps {
  mapSegments: MapSegmentData[];
  source?: Location;
  destination?: Location;
  className?: string;
}

function segmentColor(score: number): string {
  if (score <= 33) return '#09090B';
  if (score <= 66) return '#09090B';
  return '#A1A1AA';
}

function exposureLabel(score: number): string {
  if (score <= 33) return 'Low';
  if (score <= 66) return 'Medium';
  return 'High';
}

// Inner map — only rendered client-side via dynamic import
function LeafletMap({ mapSegments, source, destination, className }: RouteMapProps) {
  const mapRef = React.useRef<HTMLDivElement>(null);
  const mapInstanceRef = React.useRef<import('leaflet').Map | null>(null);

  React.useEffect(() => {
    if (!mapRef.current) return;

    // Strict Mode fires effects twice in dev; if the DOM node was already
    // initialised by Leaflet (it stamps a _leaflet_id on it), clean it up
    // before re-initialising so we never get "Map container already initialized".
    const container = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
    if (container._leaflet_id) {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      delete container._leaflet_id;
    }

    if (mapInstanceRef.current) return;

    // Dynamic import so Leaflet never runs on the server
    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by webpack/turbopack
      // @ts-expect-error – _getIconUrl is internal
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Collect all coords to fit bounds
      const allCoords: [number, number][] = mapSegments.flatMap((s) =>
        s.coordinates.map(([lng, lat]) => [lat, lng] as [number, number])
      );

      if (allCoords.length === 0) return;

      const center: [number, number] = [
        allCoords.reduce((s, c) => s + c[0], 0) / allCoords.length,
        allCoords.reduce((s, c) => s + c[1], 0) / allCoords.length,
      ];

      const map = L.map(mapRef.current!, {
        center,
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap tiles — completely free, no key needed
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Draw each segment colored by exposure
      mapSegments.forEach((seg) => {
        const latLngs = seg.coordinates.map(([lng, lat]) => [lat, lng] as [number, number]);
        L.polyline(latLngs, {
          color: segmentColor(seg.exposureScore),
          weight: 5,
          opacity: 0.85,
        })
          .bindPopup(
            `<div style="font-family:system-ui,sans-serif;font-size:13px">
              <b>Exposure: ${exposureLabel(seg.exposureScore)}</b><br/>
              Score: ${seg.exposureScore}/100<br/>
              Sun side: ${seg.exposureSide}
            </div>`
          )
          .addTo(map);
      });

      // Start marker (green)
      if (allCoords.length > 0) {
        const startIcon = L.divIcon({
          html: `<div style="
            width:30px;height:30px;border-radius:50% 50% 50% 0;
            background:#09090B;border:3px solid #fff;
            transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)
          "></div>`,
          className: '',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });
        L.marker(allCoords[0], { icon: startIcon })
          .bindPopup(`<b>Start</b>${source ? '<br/>' + source.name : ''}`)
          .addTo(map);
      }

      // End marker (red)
      if (allCoords.length > 1) {
        const endIcon = L.divIcon({
          html: `<div style="
            width:30px;height:30px;border-radius:50% 50% 50% 0;
            background:#EF4444;border:3px solid #fff;
            transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.3)
          "></div>`,
          className: '',
          iconSize: [30, 30],
          iconAnchor: [15, 30],
        });
        L.marker(allCoords[allCoords.length - 1], { icon: endIcon })
          .bindPopup(`<b>Destination</b>${destination ? '<br/>' + destination.name : ''}`)
          .addTo(map);
      }

      // Fit map to route
      map.fitBounds(L.latLngBounds(allCoords), { padding: [40, 40] });
    });

    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={mapRef} className={cn('w-full', className)} style={{ minHeight: 400 }} />;
}

// Legend overlay
function MapLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: 24, right: 16, zIndex: 1000,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
      borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
      border: '1px solid rgba(0,0,0,0.07)',
      padding: '10px 14px', pointerEvents: 'none',
    }}>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A1A1AA', marginBottom: 8 }}>
        Sun Exposure
      </p>
      {[
        { color: '#09090B', label: 'Low' },
        { color: '#71717A', label: 'Medium' },
        { color: '#D4D4D8', label: 'High' },
      ].map(({ color, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ display: 'block', width: 20, height: 4, borderRadius: 2, background: color }} />
          <span style={{ fontSize: 12, color: '#3F3F46', fontWeight: 500 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function RouteMap({ mapSegments, source, destination, className }: RouteMapProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <LeafletMap
        mapSegments={mapSegments}
        source={source}
        destination={destination}
        className="h-full w-full"
      />
      <MapLegend />
    </div>
  );
}

export default RouteMap;
