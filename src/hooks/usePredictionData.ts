import { useState, useCallback, useEffect, useRef } from 'react';
import type { CrisisMode } from './useCrisisData';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';

export interface PredictionZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  risk: RiskLevel;
  label: string;
  type: 'flood' | 'earthquake' | 'tsunami';
  timeframe: string;
}

export interface PredictionAlert {
  id: string;
  message: string;
  severity: RiskLevel;
  type: 'flood' | 'earthquake' | 'tsunami';
  timestamp: number;
}

export interface PredictionInputs {
  rainfall: number;
  riverLevel: number;
}

export interface AreaRisk {
  area: string;
  flood: RiskLevel;
  earthquake: RiskLevel;
  tsunami: RiskLevel;
}

// --- Simulated AI prediction functions ---

export function predictFlood(rainfall: number, riverLevel: number): RiskLevel {
  const score = rainfall * 0.6 + riverLevel * 0.4;
  if (score > 300) return 'HIGH';
  if (score > 150) return 'MEDIUM';
  if (score > 50) return 'LOW';
  return 'NONE';
}

export function predictEarthquakeRisk(zone: string): RiskLevel {
  const highRisk = ['Gujarat (Bhuj)', 'Uttarakhand', 'Northeast India'];
  const medRisk = ['Delhi-NCR', 'Maharashtra'];
  if (highRisk.includes(zone)) return 'HIGH';
  if (medRisk.includes(zone)) return 'MEDIUM';
  return 'LOW';
}

export function predictTsunami(earthquakeRisk: RiskLevel, isCoastal: boolean): RiskLevel {
  if (!isCoastal) return 'NONE';
  if (earthquakeRisk === 'HIGH') return 'HIGH';
  if (earthquakeRisk === 'MEDIUM') return 'MEDIUM';
  return 'LOW';
}

const RISK_COLOR: Record<RiskLevel, string> = {
  HIGH: '#ef4444',
  MEDIUM: '#f59e0b',
  LOW: '#22c55e',
  NONE: '#6b7280',
};

const ZONES_DATA = [
  { area: 'Gujarat (Bhuj)', lat: 23.24, lng: 69.67, coastal: true },
  { area: 'Kerala (Kochi)', lat: 9.93, lng: 76.26, coastal: true },
  { area: 'Tamil Nadu (Chennai)', lat: 13.08, lng: 80.27, coastal: true },
  { area: 'Assam (Guwahati)', lat: 26.14, lng: 91.74, coastal: false },
  { area: 'Delhi-NCR', lat: 28.61, lng: 77.21, coastal: false },
  { area: 'Uttarakhand', lat: 30.07, lng: 79.02, coastal: false },
  { area: 'Maharashtra', lat: 19.08, lng: 72.88, coastal: true },
  { area: 'Northeast India', lat: 25.57, lng: 93.21, coastal: false },
];

export function usePredictionData(mode: CrisisMode) {
  const [showPredictions, setShowPredictions] = useState(false);
  const [inputs, setInputs] = useState<PredictionInputs>({ rainfall: 120, riverLevel: 45 });
  const [alerts, setAlerts] = useState<PredictionAlert[]>([]);

  const floodRisk = predictFlood(inputs.rainfall, inputs.riverLevel);

  const areaRisks: AreaRisk[] = ZONES_DATA.map(z => {
    const eq = predictEarthquakeRisk(z.area);
    return {
      area: z.area,
      flood: floodRisk,
      earthquake: eq,
      tsunami: predictTsunami(eq, z.coastal),
    };
  });

  const predictionZones: PredictionZone[] = ZONES_DATA.flatMap(z => {
    const eq = predictEarthquakeRisk(z.area);
    const ts = predictTsunami(eq, z.coastal);
    const zones: PredictionZone[] = [];

    if (floodRisk !== 'NONE') {
      zones.push({
        id: `pred-flood-${z.area}`,
        lat: z.lat,
        lng: z.lng + 0.05,
        radius: 15000,
        risk: floodRisk,
        label: `Predicted Flood Risk (Next 24h) – ${z.area}`,
        type: 'flood',
        timeframe: '24 hours',
      });
    }
    zones.push({
      id: `pred-eq-${z.area}`,
      lat: z.lat - 0.05,
      lng: z.lng,
      radius: 20000,
      risk: eq,
      label: `Earthquake Risk – ${z.area}`,
      type: 'earthquake',
      timeframe: '48 hours',
    });
    if (ts !== 'NONE') {
      zones.push({
        id: `pred-ts-${z.area}`,
        lat: z.lat,
        lng: z.lng - 0.05,
        radius: 25000,
        risk: ts,
        label: `Tsunami Alert – ${z.area}`,
        type: 'tsunami',
        timeframe: '6 hours',
      });
    }
    return zones;
  });

  const generateAlerts = useCallback(() => {
    const newAlerts: PredictionAlert[] = [];
    if (floodRisk === 'HIGH') {
      newAlerts.push({
        id: `pa-flood-${Date.now()}`,
        message: '⚠️ High flood risk expected across Kerala, Assam & Bihar. Evacuate low-lying regions immediately.',
        severity: 'HIGH',
        type: 'flood',
        timestamp: Date.now(),
      });
    } else if (floodRisk === 'MEDIUM') {
      newAlerts.push({
        id: `pa-flood-${Date.now()}`,
        message: '⚠️ Moderate flood risk detected. IMD advisory: Stay alert near Brahmaputra & Godavari basins.',
        severity: 'MEDIUM',
        type: 'flood',
        timestamp: Date.now(),
      });
    }

    ZONES_DATA.forEach(z => {
      const eq = predictEarthquakeRisk(z.area);
      if (eq === 'HIGH') {
        newAlerts.push({
          id: `pa-eq-${z.area}-${Date.now()}`,
          message: `⚠️ High seismic risk in ${z.area}. NDMA advisory: Avoid old structures.`,
          severity: 'HIGH',
          type: 'earthquake',
          timestamp: Date.now(),
        });
      }
      const ts = predictTsunami(eq, z.coastal);
      if (ts === 'HIGH') {
        newAlerts.push({
          id: `pa-ts-${z.area}-${Date.now()}`,
          message: `🌊 Tsunami alert for ${z.area} coast. INCOIS warning: Move to higher ground immediately.`,
          severity: 'HIGH',
          type: 'tsunami',
          timestamp: Date.now(),
        });
      }
    });

    setAlerts(newAlerts);
  }, [floodRisk]);

  useEffect(() => {
    if (showPredictions && mode === 'disaster') {
      generateAlerts();
    }
  }, [showPredictions, inputs, mode, generateAlerts]);

  const riskTimeline = [
    { hour: 'Now', flood: inputs.rainfall * 0.3, earthquake: 40, tsunami: 20 },
    { hour: '+6h', flood: inputs.rainfall * 0.5, earthquake: 35, tsunami: 25 },
    { hour: '+12h', flood: inputs.rainfall * 0.7, earthquake: 50, tsunami: 30 },
    { hour: '+18h', flood: inputs.rainfall * 0.9, earthquake: 45, tsunami: 35 },
    { hour: '+24h', flood: inputs.rainfall * 1.0, earthquake: 55, tsunami: 40 },
    { hour: '+48h', flood: inputs.rainfall * 0.6, earthquake: 60, tsunami: 25 },
  ];

  return {
    showPredictions,
    setShowPredictions,
    inputs,
    setInputs,
    floodRisk,
    areaRisks,
    predictionZones,
    alerts,
    riskTimeline,
    riskColor: RISK_COLOR,
  };
}
