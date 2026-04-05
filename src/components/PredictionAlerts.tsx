import { Droplets, Mountain, Waves, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { PredictionAlert, RiskLevel } from '@/hooks/usePredictionData';

const iconMap = {
  flood: Droplets,
  earthquake: Mountain,
  tsunami: Waves,
};

const severityBorder: Record<RiskLevel, string> = {
  HIGH: 'border-l-destructive',
  MEDIUM: 'border-l-warning',
  LOW: 'border-l-safe',
  NONE: 'border-l-border',
};

const severityIcon: Record<RiskLevel, string> = {
  HIGH: 'text-destructive',
  MEDIUM: 'text-warning',
  LOW: 'text-safe',
  NONE: 'text-muted-foreground',
};

export function PredictionAlerts({ alerts }: { alerts: PredictionAlert[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);

  const visible = alerts.filter(a => !dismissed.has(a.id));

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-16 right-4 z-50 w-72 animate-fade-in">
      {/* Header bar */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full glass-card !rounded-b-none !p-2.5 flex items-center justify-between border-b border-border/30"
      >
        <span className="flex items-center gap-2 text-xs font-display font-semibold text-foreground">
          <AlertTriangle className="h-3.5 w-3.5 text-warning" />
          {visible.length} Active Alert{visible.length > 1 ? 's' : ''}
        </span>
        <span className="text-[10px] text-muted-foreground font-body">
          {collapsed ? 'Show' : 'Hide'}
        </span>
      </button>

      {/* Alerts list */}
      {!collapsed && (
        <div className="glass-card !rounded-t-none !p-0 max-h-52 overflow-y-auto divide-y divide-border/20">
          {visible.slice(0, 5).map(alert => {
            const Icon = iconMap[alert.type];
            return (
              <div
                key={alert.id}
                className={`flex items-start gap-2.5 px-3 py-2.5 border-l-[3px] ${severityBorder[alert.severity]}`}
              >
                <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${severityIcon[alert.severity]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-body text-foreground leading-snug">{alert.message}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5 font-body">
                    {new Date(alert.timestamp).toLocaleTimeString('en-IN')}
                  </p>
                </div>
                <button
                  onClick={() => setDismissed(prev => new Set(prev).add(alert.id))}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
