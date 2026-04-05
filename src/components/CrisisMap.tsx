import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { CrisisZone, HelpRequest, Shelter, SafeRoute } from '@/hooks/useCrisisData';
import type { PredictionZone } from '@/hooks/usePredictionData';

const zoneColors: Record<string, string> = {
  danger: '#ef4444',
  warning: '#f59e0b',
  safe: '#22c55e',
};

const riskColors: Record<string, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
  NONE: '#6b7280',
};

const priorityColors = {
  HIGH: '#e04040',
  MEDIUM: '#e09020',
  LOW: '#40a060',
};

const priorityEmoji = {
  HIGH: '🆘',
  MEDIUM: '⚠️',
  LOW: 'ℹ️',
};

interface CrisisMapProps {
  center: [number, number];
  defaultZoom?: number;
  zones: CrisisZone[];
  requests: HelpRequest[];
  shelters: Shelter[];
  safeRoute: SafeRoute | null;
  predictionZones?: PredictionZone[];
  showPredictions?: boolean;
}

export function CrisisMap({ center, defaultZoom = 12, zones, requests, shelters, safeRoute, predictionZones = [], showPredictions = false }: CrisisMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<{
    zones: L.LayerGroup;
    shelters: L.LayerGroup;
    requests: L.LayerGroup;
    route: L.LayerGroup;
    predictions: L.LayerGroup;
  } | null>(null);

  // Initialize map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom: defaultZoom,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
    }).addTo(map);

    layersRef.current = {
      zones: L.layerGroup().addTo(map),
      shelters: L.layerGroup().addTo(map),
      requests: L.layerGroup().addTo(map),
      route: L.layerGroup().addTo(map),
      predictions: L.layerGroup().addTo(map),
    };

    mapRef.current = map;

    // Ensure map fills container
    setTimeout(() => map.invalidateSize(), 100);
    const resizeObserver = new ResizeObserver(() => map.invalidateSize());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      layersRef.current = null;
    };
  }, []);

  // Fly to new center when mode changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, defaultZoom, { duration: 1.5 });
    }
  }, [center, defaultZoom]);

  // Update zones
  useEffect(() => {
    if (!layersRef.current) return;
    const layer = layersRef.current.zones;
    layer.clearLayers();
    zones.forEach(zone => {
      L.circle([zone.lat, zone.lng], {
        radius: zone.radius,
        color: zoneColors[zone.type],
        fillColor: zoneColors[zone.type],
        fillOpacity: 0.15,
        weight: 2,
        opacity: 0.6,
      })
        .bindPopup(`<strong style="font-family:Orbitron,sans-serif;font-size:12px">${zone.label}</strong><br><span style="font-size:11px">${zone.type} zone • ${zone.radius / 1000}km</span>`)
        .addTo(layer);
    });
  }, [zones]);

  // Update shelters
  useEffect(() => {
    if (!layersRef.current) return;
    const layer = layersRef.current.shelters;
    layer.clearLayers();
    shelters.forEach(s => {
      const color = s.type === 'hospital' ? '#ef4444' : '#3b82f6';
      const emoji = s.type === 'hospital' ? '🏥' : '🏠';
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 12px ${color}80;">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([s.lat, s.lng], { icon })
        .bindPopup(`<strong style="font-family:Orbitron,sans-serif;font-size:12px">${s.name}</strong><br><span style="font-size:11px">${s.type} • Capacity: ${s.capacity}</span>`)
        .addTo(layer);
    });
  }, [shelters]);

  // Update requests
  useEffect(() => {
    if (!layersRef.current) return;
    const layer = layersRef.current.requests;
    layer.clearLayers();
    requests.slice(0, 20).forEach(r => {
      const color = priorityColors[r.priority];
      const emoji = priorityEmoji[r.priority];
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid rgba(255,255,255,0.3);box-shadow:0 0 12px ${color}80;">${emoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([r.lat, r.lng], { icon })
        .bindPopup(`<strong style="font-family:Orbitron,sans-serif;font-size:12px">${r.type.toUpperCase()}</strong> <span style="font-size:10px">(${r.priority})</span><br><span style="font-size:11px">${r.description}</span><br><span style="font-size:10px;opacity:0.7">📍 ${r.locationName}</span>`)
        .addTo(layer);
    });
  }, [requests]);

  // Update safe route
  useEffect(() => {
    if (!layersRef.current) return;
    const layer = layersRef.current.route;
    layer.clearLayers();
    if (safeRoute) {
      L.polyline(safeRoute.points, {
        color: '#22c55e',
        weight: 4,
        opacity: 0.8,
        dashArray: '10 6',
      }).addTo(layer);
    }
  }, [safeRoute]);

  // Update prediction zones
  useEffect(() => {
    if (!layersRef.current) return;
    const layer = layersRef.current.predictions;
    layer.clearLayers();
    if (!showPredictions) return;
    predictionZones.forEach(pz => {
      const color = riskColors[pz.risk];
      L.circle([pz.lat, pz.lng], {
        radius: pz.radius,
        color,
        fillColor: color,
        fillOpacity: 0.12,
        weight: 2,
        opacity: 0.5,
        dashArray: '8 4',
      })
        .bindPopup(`<strong style="font-family:Orbitron,sans-serif;font-size:11px">${pz.label}</strong><br><span style="font-size:10px">${pz.risk} risk • ${pz.timeframe}</span>`)
        .addTo(layer);
    });
  }, [predictionZones, showPredictions]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-border/50 glass" style={{ height: '100%', minHeight: 400 }}>
      {/* Scan line effect */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan" />
      </div>

      <div ref={containerRef} className="h-full w-full" style={{ height: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 glass-card !p-2 z-20 text-xs font-body space-y-1">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-destructive" /> Danger</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-warning" /> Warning</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-safe" /> Safe</div>
      </div>
    </div>
  );
}
