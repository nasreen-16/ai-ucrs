import { Activity, Droplets, Mountain, Waves, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import type { RiskLevel, AreaRisk, PredictionInputs } from '@/hooks/usePredictionData';
import { LocationSelector } from '@/components/LocationSelector';

interface PredictionPanelProps {
  floodRisk: RiskLevel;
  areaRisks: AreaRisk[];
  riskTimeline: { hour: string; flood: number; earthquake: number; tsunami: number }[];
  inputs: PredictionInputs;
  setInputs: (i: PredictionInputs) => void;
  riskColor: Record<RiskLevel, string>;
}

function RiskBadge({ level, color }: { level: RiskLevel; color: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-display font-bold uppercase"
      style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
    >
      {level}
    </span>
  );
}

export function PredictionPanel({ floodRisk, areaRisks, riskTimeline, inputs, setInputs, riskColor }: PredictionPanelProps) {
  return (
    <div className="space-y-4 animate-fade-in">
      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
        <Activity className="h-4 w-4 text-accent" /> AI Prediction Engine
      </h3>

      {/* Interactive Controls */}
      <div className="glass-card !p-3 space-y-3">
        <p className="text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-wider">
          Simulation Controls
        </p>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-body">
            <span className="flex items-center gap-1.5"><Droplets className="h-3 w-3 text-primary" /> Rainfall</span>
            <span className="font-display text-primary">{inputs.rainfall} mm</span>
          </label>
          <input
            type="range"
            min={0}
            max={500}
            value={inputs.rainfall}
            onChange={e => setInputs({ ...inputs, rainfall: +e.target.value })}
            className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center justify-between text-xs font-body">
            <span className="flex items-center gap-1.5"><Waves className="h-3 w-3 text-primary" /> River Level</span>
            <span className="font-display text-primary">{inputs.riverLevel}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={inputs.riverLevel}
            onChange={e => setInputs({ ...inputs, riverLevel: +e.target.value })}
            className="w-full h-1.5 rounded-full appearance-none bg-secondary cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Location Selector */}
      <LocationSelector rainfall={inputs.rainfall} riverLevel={inputs.riverLevel} riskColor={riskColor} />

      {/* Overall Risk Summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Droplets, label: 'Flood', risk: floodRisk },
          { icon: Mountain, label: 'Earthquake', risk: areaRisks.some(a => a.earthquake === 'HIGH') ? 'HIGH' as RiskLevel : areaRisks.some(a => a.earthquake === 'MEDIUM') ? 'MEDIUM' as RiskLevel : 'LOW' as RiskLevel },
          { icon: Waves, label: 'Tsunami', risk: areaRisks.some(a => a.tsunami === 'HIGH') ? 'HIGH' as RiskLevel : areaRisks.some(a => a.tsunami !== 'NONE') ? 'MEDIUM' as RiskLevel : 'NONE' as RiskLevel },
        ].map(item => (
          <div key={item.label} className="glass-card !p-2 text-center space-y-1">
            <item.icon className="h-4 w-4 mx-auto" style={{ color: riskColor[item.risk] }} />
            <p className="text-[10px] font-body text-muted-foreground">{item.label}</p>
            <RiskBadge level={item.risk} color={riskColor[item.risk]} />
          </div>
        ))}
      </div>

      {/* Risk Over Time Chart */}
      <div className="glass-card !p-3">
        <p className="text-[10px] font-body text-muted-foreground mb-2 flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> Risk Over Time
        </p>
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={riskTimeline}>
              <XAxis dataKey="hour" tick={{ fill: 'hsl(215 15% 55%)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 'auto']} />
              <Line type="monotone" dataKey="flood" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="earthquake" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tsunami" stroke="#8b5cf6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-3 mt-1">
          {[{ l: 'Flood', c: '#3b82f6' }, { l: 'Quake', c: '#ef4444' }, { l: 'Tsunami', c: '#8b5cf6' }].map(d => (
            <span key={d.l} className="text-[10px] font-body flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.c }} />
              {d.l}
            </span>
          ))}
        </div>
      </div>

      {/* Area-wise Comparison */}
      <div className="glass-card !p-3">
        <p className="text-[10px] font-body text-muted-foreground mb-2">Area-wise Risk</p>
        <div className="space-y-1.5">
          {areaRisks.map(a => (
            <div key={a.area} className="flex items-center gap-2 text-[11px] font-body">
              <span className="w-14 font-display text-foreground">{a.area}</span>
              <RiskBadge level={a.flood} color={riskColor[a.flood]} />
              <RiskBadge level={a.earthquake} color={riskColor[a.earthquake]} />
              <RiskBadge level={a.tsunami} color={riskColor[a.tsunami]} />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          {['Flood', 'Quake', 'Tsunami'].map(l => (
            <span key={l} className="text-[9px] text-muted-foreground font-body">{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
