import { MapPin, Search } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import type { RiskLevel } from '@/hooks/usePredictionData';
import { predictEarthquakeRisk, predictFlood, predictTsunami } from '@/hooks/usePredictionData';

interface LocationSelectorProps {
  rainfall: number;
  riverLevel: number;
  riskColor: Record<RiskLevel, string>;
}

interface CityData {
  name: string;
  state: string;
  lat: number;
  lng: number;
  coastal: boolean;
  eqZone: string;
}

// All 28 states + 8 UTs covered with major cities
const ALL_CITIES: CityData[] = [
  // Andhra Pradesh
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.69, lng: 83.22, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.51, lng: 80.65, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Tirupati', state: 'Andhra Pradesh', lat: 13.63, lng: 79.42, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Kakinada', state: 'Andhra Pradesh', lat: 16.99, lng: 82.25, coastal: true, eqZone: 'Maharashtra' },
  // Arunachal Pradesh
  { name: 'Itanagar', state: 'Arunachal Pradesh', lat: 27.10, lng: 93.62, coastal: false, eqZone: 'Northeast India' },
  { name: 'Tawang', state: 'Arunachal Pradesh', lat: 27.59, lng: 91.86, coastal: false, eqZone: 'Northeast India' },
  // Assam
  { name: 'Guwahati', state: 'Assam', lat: 26.14, lng: 91.74, coastal: false, eqZone: 'Northeast India' },
  { name: 'Dibrugarh', state: 'Assam', lat: 27.47, lng: 94.91, coastal: false, eqZone: 'Northeast India' },
  { name: 'Silchar', state: 'Assam', lat: 24.83, lng: 92.78, coastal: false, eqZone: 'Northeast India' },
  { name: 'Jorhat', state: 'Assam', lat: 26.75, lng: 94.22, coastal: false, eqZone: 'Northeast India' },
  // Bihar
  { name: 'Patna', state: 'Bihar', lat: 25.61, lng: 85.14, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Muzaffarpur', state: 'Bihar', lat: 26.12, lng: 85.39, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Darbhanga', state: 'Bihar', lat: 26.15, lng: 85.90, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Gaya', state: 'Bihar', lat: 24.80, lng: 85.00, coastal: false, eqZone: 'Delhi-NCR' },
  // Chhattisgarh
  { name: 'Raipur', state: 'Chhattisgarh', lat: 21.25, lng: 81.63, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Bilaspur', state: 'Chhattisgarh', lat: 22.08, lng: 82.15, coastal: false, eqZone: 'Maharashtra' },
  // Delhi-NCR
  { name: 'New Delhi', state: 'Delhi', lat: 28.61, lng: 77.21, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Noida', state: 'Delhi', lat: 28.54, lng: 77.39, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Gurgaon', state: 'Delhi', lat: 28.46, lng: 77.03, coastal: false, eqZone: 'Delhi-NCR' },
  // Goa
  { name: 'Panaji', state: 'Goa', lat: 15.50, lng: 73.83, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Margao', state: 'Goa', lat: 15.28, lng: 73.96, coastal: true, eqZone: 'Maharashtra' },
  // Gujarat
  { name: 'Bhuj', state: 'Gujarat', lat: 23.24, lng: 69.67, coastal: false, eqZone: 'Gujarat (Bhuj)' },
  { name: 'Ahmedabad', state: 'Gujarat', lat: 23.02, lng: 72.57, coastal: false, eqZone: 'Gujarat (Bhuj)' },
  { name: 'Surat', state: 'Gujarat', lat: 21.17, lng: 72.83, coastal: true, eqZone: 'Gujarat (Bhuj)' },
  { name: 'Rajkot', state: 'Gujarat', lat: 22.30, lng: 70.80, coastal: false, eqZone: 'Gujarat (Bhuj)' },
  { name: 'Vadodara', state: 'Gujarat', lat: 22.31, lng: 73.19, coastal: false, eqZone: 'Gujarat (Bhuj)' },
  // Haryana
  { name: 'Chandigarh', state: 'Haryana', lat: 30.73, lng: 76.78, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Faridabad', state: 'Haryana', lat: 28.41, lng: 77.31, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Ambala', state: 'Haryana', lat: 30.38, lng: 76.77, coastal: false, eqZone: 'Delhi-NCR' },
  // Himachal Pradesh
  { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.10, lng: 77.17, coastal: false, eqZone: 'Uttarakhand' },
  { name: 'Manali', state: 'Himachal Pradesh', lat: 32.24, lng: 77.19, coastal: false, eqZone: 'Uttarakhand' },
  { name: 'Dharamshala', state: 'Himachal Pradesh', lat: 32.22, lng: 76.32, coastal: false, eqZone: 'Uttarakhand' },
  // Jharkhand
  { name: 'Ranchi', state: 'Jharkhand', lat: 23.34, lng: 85.31, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Jamshedpur', state: 'Jharkhand', lat: 22.80, lng: 86.18, coastal: false, eqZone: 'Delhi-NCR' },
  // Karnataka
  { name: 'Bengaluru', state: 'Karnataka', lat: 12.97, lng: 77.59, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Mangaluru', state: 'Karnataka', lat: 12.87, lng: 74.84, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Mysuru', state: 'Karnataka', lat: 12.30, lng: 76.66, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Hubli', state: 'Karnataka', lat: 15.36, lng: 75.12, coastal: false, eqZone: 'Maharashtra' },
  // Kerala
  { name: 'Kochi', state: 'Kerala', lat: 9.93, lng: 76.26, coastal: true, eqZone: 'Kerala (Kochi)' },
  { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.52, lng: 76.94, coastal: true, eqZone: 'Kerala (Kochi)' },
  { name: 'Wayanad', state: 'Kerala', lat: 11.60, lng: 76.08, coastal: false, eqZone: 'Kerala (Kochi)' },
  { name: 'Kozhikode', state: 'Kerala', lat: 11.25, lng: 75.77, coastal: true, eqZone: 'Kerala (Kochi)' },
  // Madhya Pradesh
  { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.26, lng: 77.41, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Indore', state: 'Madhya Pradesh', lat: 22.72, lng: 75.86, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', lat: 23.18, lng: 79.95, coastal: false, eqZone: 'Delhi-NCR' },
  // Maharashtra
  { name: 'Mumbai', state: 'Maharashtra', lat: 19.08, lng: 72.88, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Pune', state: 'Maharashtra', lat: 18.52, lng: 73.86, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Nagpur', state: 'Maharashtra', lat: 21.15, lng: 79.09, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Ratnagiri', state: 'Maharashtra', lat: 16.99, lng: 73.30, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Kolhapur', state: 'Maharashtra', lat: 16.70, lng: 74.24, coastal: false, eqZone: 'Maharashtra' },
  // Manipur
  { name: 'Imphal', state: 'Manipur', lat: 24.82, lng: 93.95, coastal: false, eqZone: 'Northeast India' },
  // Meghalaya
  { name: 'Shillong', state: 'Meghalaya', lat: 25.57, lng: 91.88, coastal: false, eqZone: 'Northeast India' },
  // Mizoram
  { name: 'Aizawl', state: 'Mizoram', lat: 23.73, lng: 92.72, coastal: false, eqZone: 'Northeast India' },
  // Nagaland
  { name: 'Kohima', state: 'Nagaland', lat: 25.67, lng: 94.11, coastal: false, eqZone: 'Northeast India' },
  { name: 'Dimapur', state: 'Nagaland', lat: 25.87, lng: 93.73, coastal: false, eqZone: 'Northeast India' },
  // Odisha
  { name: 'Bhubaneswar', state: 'Odisha', lat: 20.30, lng: 85.83, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Puri', state: 'Odisha', lat: 19.81, lng: 85.83, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Cuttack', state: 'Odisha', lat: 20.46, lng: 85.88, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Paradip', state: 'Odisha', lat: 20.32, lng: 86.61, coastal: true, eqZone: 'Maharashtra' },
  // Punjab
  { name: 'Amritsar', state: 'Punjab', lat: 31.63, lng: 74.87, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Ludhiana', state: 'Punjab', lat: 30.90, lng: 75.86, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Jalandhar', state: 'Punjab', lat: 31.33, lng: 75.58, coastal: false, eqZone: 'Delhi-NCR' },
  // Rajasthan
  { name: 'Jaipur', state: 'Rajasthan', lat: 26.92, lng: 75.79, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Jodhpur', state: 'Rajasthan', lat: 26.24, lng: 73.02, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Udaipur', state: 'Rajasthan', lat: 24.59, lng: 73.71, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Barmer', state: 'Rajasthan', lat: 25.75, lng: 71.38, coastal: false, eqZone: 'Gujarat (Bhuj)' },
  // Sikkim
  { name: 'Gangtok', state: 'Sikkim', lat: 27.33, lng: 88.62, coastal: false, eqZone: 'Northeast India' },
  // Tamil Nadu
  { name: 'Chennai', state: 'Tamil Nadu', lat: 13.08, lng: 80.27, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Cuddalore', state: 'Tamil Nadu', lat: 11.75, lng: 79.77, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Nagapattinam', state: 'Tamil Nadu', lat: 10.77, lng: 79.84, coastal: true, eqZone: 'Maharashtra' },
  { name: 'Madurai', state: 'Tamil Nadu', lat: 9.92, lng: 78.12, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.01, lng: 76.97, coastal: false, eqZone: 'Maharashtra' },
  // Telangana
  { name: 'Hyderabad', state: 'Telangana', lat: 17.39, lng: 78.49, coastal: false, eqZone: 'Maharashtra' },
  { name: 'Warangal', state: 'Telangana', lat: 17.98, lng: 79.60, coastal: false, eqZone: 'Maharashtra' },
  // Tripura
  { name: 'Agartala', state: 'Tripura', lat: 23.83, lng: 91.28, coastal: false, eqZone: 'Northeast India' },
  // Uttar Pradesh
  { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.85, lng: 80.95, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.32, lng: 82.99, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.43, lng: 81.85, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Agra', state: 'Uttar Pradesh', lat: 27.18, lng: 78.02, coastal: false, eqZone: 'Delhi-NCR' },
  { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.45, lng: 80.35, coastal: false, eqZone: 'Delhi-NCR' },
  // Uttarakhand
  { name: 'Dehradun', state: 'Uttarakhand', lat: 30.32, lng: 78.03, coastal: false, eqZone: 'Uttarakhand' },
  { name: 'Chamoli', state: 'Uttarakhand', lat: 30.40, lng: 79.33, coastal: false, eqZone: 'Uttarakhand' },
  { name: 'Haridwar', state: 'Uttarakhand', lat: 29.95, lng: 78.16, coastal: false, eqZone: 'Uttarakhand' },
  { name: 'Uttarkashi', state: 'Uttarakhand', lat: 30.73, lng: 78.45, coastal: false, eqZone: 'Uttarakhand' },
  // West Bengal
  { name: 'Kolkata', state: 'West Bengal', lat: 22.57, lng: 88.36, coastal: true, eqZone: 'Northeast India' },
  { name: 'Siliguri', state: 'West Bengal', lat: 26.72, lng: 88.42, coastal: false, eqZone: 'Northeast India' },
  { name: 'Darjeeling', state: 'West Bengal', lat: 27.04, lng: 88.26, coastal: false, eqZone: 'Northeast India' },
  { name: 'Digha', state: 'West Bengal', lat: 21.63, lng: 87.55, coastal: true, eqZone: 'Northeast India' },
  // Jammu & Kashmir
  { name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.08, lng: 74.80, coastal: false, eqZone: 'Uttarakhand' },
  { name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.73, lng: 74.87, coastal: false, eqZone: 'Uttarakhand' },
  // Ladakh
  { name: 'Leh', state: 'Ladakh', lat: 34.15, lng: 77.58, coastal: false, eqZone: 'Uttarakhand' },
  // Puducherry
  { name: 'Puducherry', state: 'Puducherry', lat: 11.93, lng: 79.83, coastal: true, eqZone: 'Maharashtra' },
  // Andaman & Nicobar
  { name: 'Port Blair', state: 'Andaman & Nicobar', lat: 11.67, lng: 92.74, coastal: true, eqZone: 'Northeast India' },
  // Lakshadweep
  { name: 'Kavaratti', state: 'Lakshadweep', lat: 10.57, lng: 72.64, coastal: true, eqZone: 'Kerala (Kochi)' },
];

function RiskBadge({ level, color, label }: { level: RiskLevel; color: string; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-body text-muted-foreground">{label}</span>
      <span
        className="px-2 py-0.5 rounded-full text-[9px] font-display font-bold uppercase"
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
      >
        {level}
      </span>
    </div>
  );
}

export function LocationSelector({ rainfall, riverLevel, riskColor }: LocationSelectorProps) {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<CityData | null>(null);
  const [customCoastal, setCustomCoastal] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return ALL_CITIES.filter(
      c => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query]);

  const isCustom = query.trim().length > 0 && !selected;

  const floodRisk = predictFlood(rainfall, riverLevel);

  // For custom locations, use a generic medium seismic zone
  const eqRisk = selected
    ? predictEarthquakeRisk(selected.eqZone)
    : isCustom
    ? ('MEDIUM' as RiskLevel)
    : null;

  const tsunamiRisk =
    eqRisk !== null
      ? predictTsunami(eqRisk, selected ? selected.coastal : customCoastal)
      : null;

  const handleSelect = (city: CityData) => {
    setSelected(city);
    setQuery(`${city.name}, ${city.state}`);
    setShowDropdown(false);
  };

  const handleCheckCustom = () => {
    if (query.trim() && !selected) {
      setShowDropdown(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="font-display text-xs font-semibold text-foreground flex items-center gap-2">
        <MapPin className="h-3.5 w-3.5 text-primary" /> Check Your Location
      </h4>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-3 w-3 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setSelected(null);
            setShowDropdown(true);
          }}
          onFocus={() => query.trim() && setShowDropdown(true)}
          onKeyDown={e => { if (e.key === 'Enter') handleCheckCustom(); }}
          placeholder="Type your city or state..."
          className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-8 pr-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />

        {/* Dropdown */}
        {showDropdown && query.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 glass-card !p-0 z-50 max-h-44 overflow-y-auto divide-y divide-border/20">
            {filtered.map(city => (
              <button
                key={`${city.name}-${city.state}`}
                onClick={() => handleSelect(city)}
                className="w-full text-left px-3 py-2 text-xs font-body text-foreground hover:bg-primary/10 transition-colors flex justify-between"
              >
                <span>{city.name}</span>
                <span className="text-muted-foreground text-[10px]">{city.state}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <button
                onClick={handleCheckCustom}
                className="w-full text-left px-3 py-2 text-xs font-body text-muted-foreground hover:bg-primary/10 transition-colors"
              >
                Use "<span className="text-foreground">{query}</span>" as custom location →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Coastal toggle for custom locations */}
      {isCustom && !showDropdown && query.trim() && (
        <label className="flex items-center gap-2 text-[11px] font-body text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={customCoastal}
            onChange={e => setCustomCoastal(e.target.checked)}
            className="accent-primary h-3 w-3"
          />
          This is a coastal area
        </label>
      )}

      {/* Risk results */}
      {(selected || (isCustom && !showDropdown && query.trim())) && eqRisk && tsunamiRisk !== null && (
        <div className="glass-card !p-3 space-y-2 animate-fade-in">
          <p className="text-[11px] font-display font-semibold text-foreground">
            📍 {selected ? `${selected.name}, ${selected.state}` : query}
          </p>
          {selected && (
            <p className="text-[9px] text-muted-foreground font-body">
              {selected.coastal ? '🌊 Coastal region' : '🏔️ Inland region'} • {selected.lat.toFixed(2)}°N, {selected.lng.toFixed(2)}°E
            </p>
          )}
          {!selected && (
            <p className="text-[9px] text-muted-foreground font-body">
              {customCoastal ? '🌊 Coastal region' : '🏔️ Inland region'} • Custom location (general risk estimate)
            </p>
          )}
          <div className="space-y-1.5 mt-2">
            <RiskBadge level={floodRisk} color={riskColor[floodRisk]} label="Flood Risk" />
            <RiskBadge level={eqRisk} color={riskColor[eqRisk]} label="Earthquake Risk" />
            <RiskBadge level={tsunamiRisk} color={riskColor[tsunamiRisk]} label="Tsunami Risk" />
          </div>
          {(floodRisk === 'HIGH' || eqRisk === 'HIGH' || tsunamiRisk === 'HIGH') && (
            <p className="text-[10px] text-destructive font-body mt-1 leading-snug">
              ⚠️ High risk detected. Follow NDMA guidelines and stay prepared.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
