import { useState, useCallback, useEffect, useRef } from 'react';

export type CrisisMode = 'war' | 'disaster';
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type RequestType = 'medical' | 'food' | 'rescue' | 'shelter' | 'water';
export type ZoneType = 'danger' | 'warning' | 'safe';
export type AlertStatus = 'verified' | 'unverified';

export interface CrisisZone {
  id: string;
  lat: number;
  lng: number;
  radius: number;
  type: ZoneType;
  label: string;
}

export interface HelpRequest {
  id: string;
  lat: number;
  lng: number;
  locationName: string;
  type: RequestType;
  description: string;
  priority: Priority;
  timestamp: number;
  status: 'pending' | 'in-progress' | 'resolved';
}

export interface Shelter {
  id: string;
  lat: number;
  lng: number;
  name: string;
  type: 'shelter' | 'hospital';
  capacity: number;
}

export interface CrisisAlert {
  id: string;
  title: string;
  description: string;
  status: AlertStatus;
  timestamp: number;
  severity: Priority;
}

export interface SafeRoute {
  points: [number, number][];
  distance: string;
  eta: string;
}

// --- WAR / CONFLICT: India-Pakistan Border / J&K / Northeast ---
const WAR_ZONES: CrisisZone[] = [
  { id: 'wz1', lat: 34.08, lng: 74.80, radius: 5000, type: 'danger', label: 'Active LoC Conflict Zone – Kupwara' },
  { id: 'wz2', lat: 34.15, lng: 74.85, radius: 3000, type: 'danger', label: 'Shelling Area – Uri Sector' },
  { id: 'wz3', lat: 33.95, lng: 74.75, radius: 4000, type: 'warning', label: 'Disputed Territory – Baramulla' },
  { id: 'wz4', lat: 34.20, lng: 74.90, radius: 3500, type: 'warning', label: 'Militant Activity – Handwara' },
  { id: 'wz5', lat: 34.10, lng: 74.95, radius: 6000, type: 'safe', label: 'Army Protected Zone – Srinagar Cantonment' },
  { id: 'wz6', lat: 33.90, lng: 74.70, radius: 4000, type: 'safe', label: 'Ceasefire Zone – Poonch' },
];

// --- DISASTER: India - Gujarat/Kerala/Chennai/Assam ---
const DISASTER_ZONES: CrisisZone[] = [
  { id: 'dz1', lat: 23.24, lng: 69.67, radius: 6000, type: 'danger', label: 'Earthquake Epicenter – Bhuj, Gujarat' },
  { id: 'dz2', lat: 9.93, lng: 76.26, radius: 4000, type: 'danger', label: 'Flood Zone – Kochi, Kerala' },
  { id: 'dz3', lat: 13.08, lng: 80.27, radius: 5000, type: 'warning', label: 'Tsunami Risk – Chennai Coast' },
  { id: 'dz4', lat: 26.14, lng: 91.74, radius: 4500, type: 'warning', label: 'Flood Risk – Guwahati, Assam' },
  { id: 'dz5', lat: 20.30, lng: 85.83, radius: 5000, type: 'safe', label: 'NDRF Relief Camp – Bhubaneswar' },
  { id: 'dz6', lat: 19.08, lng: 72.88, radius: 4000, type: 'safe', label: 'Evacuation Point – Mumbai' },
];

const WAR_SHELTERS: Shelter[] = [
  { id: 'ws1', lat: 34.10, lng: 74.95, name: 'Army Relief Camp – Srinagar', type: 'shelter', capacity: 500 },
  { id: 'ws2', lat: 33.90, lng: 74.70, name: 'CRPF Hospital – Poonch', type: 'hospital', capacity: 200 },
  { id: 'ws3', lat: 34.15, lng: 74.82, name: 'BSF Bunker – Uri', type: 'shelter', capacity: 150 },
  { id: 'ws4', lat: 33.95, lng: 74.78, name: 'Military Hospital – Baramulla', type: 'hospital', capacity: 80 },
];

const DISASTER_SHELTERS: Shelter[] = [
  { id: 'ds1', lat: 23.02, lng: 72.57, name: 'NDRF Camp – Ahmedabad', type: 'shelter', capacity: 800 },
  { id: 'ds2', lat: 9.97, lng: 76.28, name: 'District Hospital – Ernakulam', type: 'hospital', capacity: 300 },
  { id: 'ds3', lat: 13.05, lng: 80.22, name: 'Govt School Shelter – Chennai', type: 'shelter', capacity: 250 },
  { id: 'ds4', lat: 26.18, lng: 91.75, name: 'GMCH Hospital – Guwahati', type: 'hospital', capacity: 100 },
];

const REQUEST_TYPES: RequestType[] = ['medical', 'food', 'rescue', 'shelter', 'water'];
const DESCRIPTIONS_WAR = [
  'Family trapped after shelling in Kupwara district',
  'Injured civilians need immediate medical aid near LoC',
  'Running low on drinking water in border village',
  'Need evacuation from conflict zone in Uri sector',
  'Children separated from parents near Baramulla, need shelter',
  'Medical supplies running critically low at field hospital',
  'Food shortage for 30+ displaced families in Handwara',
];
const DESCRIPTIONS_DISASTER = [
  'Building collapsed in Bhuj, people trapped under rubble',
  'Flood waters rising rapidly in Kochi, need rescue boats',
  'Medical emergency at relief camp in Chennai – multiple injuries',
  'Road blocked by landslide near Wayanad, Kerala',
  'No clean water for 3 days in Assam flood zone',
  'Elderly residents need medical evacuation from Majuli island',
  'Family stranded on rooftop in Patna during Bihar floods',
];

const LOCATIONS_WAR = ['Kupwara', 'Uri', 'Baramulla', 'Handwara', 'Poonch', 'Rajouri', 'Srinagar', 'Sopore', 'Bandipora', 'Gurez'];
const LOCATIONS_DISASTER = ['Bhuj', 'Kochi', 'Chennai', 'Guwahati', 'Bhubaneswar', 'Mumbai', 'Patna', 'Wayanad', 'Majuli', 'Puri'];

const ALERT_TITLES_WAR = [
  'Ceasefire violation reported near LoC', 'Shelling detected in Uri sector', 'Supply convoy attacked near Baramulla',
  'Safe corridor opened via Srinagar', 'IED detected on Kupwara highway', 'Evacuation order issued for border villages',
];
const ALERT_TITLES_DISASTER = [
  'Aftershock detected – 4.5 magnitude near Bhuj', 'Dam breach warning – Mullaperiyar', 'Tsunami alert issued for Tamil Nadu coast',
  'New evacuation route opened via NH-66', 'IMD Warning: Extremely heavy rain in Kerala', 'Bridge declared unsafe in Assam',
];

function assignPriority(type: RequestType): Priority {
  if (type === 'medical' || type === 'rescue') return 'HIGH';
  if (type === 'food' || type === 'water') return 'MEDIUM';
  return 'LOW';
}

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function generateRequest(mode: CrisisMode): HelpRequest {
  const isWar = mode === 'war';
  const descriptions = isWar ? DESCRIPTIONS_WAR : DESCRIPTIONS_DISASTER;
  const locations = isWar ? LOCATIONS_WAR : LOCATIONS_DISASTER;
  const type = REQUEST_TYPES[Math.floor(Math.random() * REQUEST_TYPES.length)];
  const baseLat = isWar ? 34.08 : 20.59;
  const baseLng = isWar ? 74.80 : 78.96;

  return {
    id: `req-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    lat: randomInRange(baseLat - 0.1, baseLat + 0.1),
    lng: randomInRange(baseLng - 0.1, baseLng + 0.1),
    locationName: locations[Math.floor(Math.random() * locations.length)],
    type,
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    priority: assignPriority(type),
    timestamp: Date.now(),
    status: 'pending',
  };
}

function generateAlert(mode: CrisisMode): CrisisAlert {
  const titles = mode === 'war' ? ALERT_TITLES_WAR : ALERT_TITLES_DISASTER;
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: titles[Math.floor(Math.random() * titles.length)],
    description: 'AI analysis processing incoming data feeds from ISRO & IMD...',
    status: Math.random() > 0.4 ? 'verified' : 'unverified',
    timestamp: Date.now(),
    severity: (['HIGH', 'MEDIUM', 'LOW'] as Priority[])[Math.floor(Math.random() * 3)],
  };
}

export function generateSafeRoute(mode: CrisisMode): SafeRoute {
  const isWar = mode === 'war';
  const baseLat = isWar ? 34.08 : 20.59;
  const baseLng = isWar ? 74.80 : 78.96;
  const points: [number, number][] = [];
  let lat = baseLat + randomInRange(-0.05, 0.05);
  let lng = baseLng + randomInRange(-0.05, 0.05);
  for (let i = 0; i < 6; i++) {
    points.push([lat, lng]);
    lat += randomInRange(-0.02, 0.03);
    lng += randomInRange(0.01, 0.04);
  }
  return {
    points,
    distance: `${(Math.random() * 10 + 2).toFixed(1)} km`,
    eta: `${Math.floor(Math.random() * 40 + 10)} min`,
  };
}

export function useCrisisData() {
  const [mode, setMode] = useState<CrisisMode>('disaster');
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState<HelpRequest[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const zones = mode === 'war' ? WAR_ZONES : DISASTER_ZONES;
  const shelters = mode === 'war' ? WAR_SHELTERS : DISASTER_SHELTERS;
  // War: J&K, Disaster: Central India overview
  const mapCenter: [number, number] = mode === 'war' ? [34.08, 74.80] : [20.59, 78.96];
  const defaultZoom = mode === 'war' ? 11 : 5;

  useEffect(() => {
    const initial: HelpRequest[] = [];
    for (let i = 0; i < 8; i++) initial.push(generateRequest(mode));
    setRequests(initial);

    const initialAlerts: CrisisAlert[] = [];
    for (let i = 0; i < 5; i++) initialAlerts.push(generateAlert(mode));
    setAlerts(initialAlerts);
  }, [mode]);

  const startSimulation = useCallback(() => {
    setIsSimulating(true);
    intervalRef.current = setInterval(() => {
      setRequests(prev => [generateRequest(mode), ...prev].slice(0, 50));
      if (Math.random() > 0.6) {
        setAlerts(prev => [generateAlert(mode), ...prev].slice(0, 20));
      }
    }, 4000);
  }, [mode]);

  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const addRequest = useCallback((req: Omit<HelpRequest, 'id' | 'priority' | 'timestamp' | 'status'>) => {
    const newReq: HelpRequest = {
      ...req,
      id: `req-${Date.now()}`,
      priority: assignPriority(req.type),
      timestamp: Date.now(),
      status: 'pending',
    };
    if (isOffline) {
      setOfflineQueue(prev => [...prev, newReq]);
    } else {
      setRequests(prev => [newReq, ...prev]);
    }
  }, [isOffline]);

  const syncOffline = useCallback(() => {
    setRequests(prev => [...offlineQueue, ...prev]);
    setOfflineQueue([]);
    setIsOffline(false);
  }, [offlineQueue]);

  const analytics = {
    total: requests.length,
    high: requests.filter(r => r.priority === 'HIGH').length,
    medium: requests.filter(r => r.priority === 'MEDIUM').length,
    low: requests.filter(r => r.priority === 'LOW').length,
    pending: requests.filter(r => r.status === 'pending').length,
    byType: REQUEST_TYPES.map(t => ({
      type: t,
      count: requests.filter(r => r.type === t).length,
    })),
  };

  return {
    mode, setMode,
    zones, shelters, mapCenter, defaultZoom, requests, alerts, analytics,
    isSimulating, startSimulation, stopSimulation,
    addRequest, isOffline, setIsOffline, offlineQueue, syncOffline,
  };
}
