import { ShieldAlert, CheckCircle, AlertOctagon } from 'lucide-react';
import type { CrisisAlert } from '@/hooks/useCrisisData';

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function AlertsPanel({ alerts }: { alerts: CrisisAlert[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 text-destructive" />
        Alerts
        <span className="ml-auto text-[10px] font-body text-muted-foreground">
          {alerts.filter(a => a.status === 'unverified').length} unverified
        </span>
      </h3>

      <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
        {alerts.slice(0, 10).map(a => (
          <div
            key={a.id}
            className={`rounded-lg border p-2.5 transition-all ${
              a.status === 'verified'
                ? 'border-safe/30 bg-safe/5'
                : 'border-destructive/30 bg-destructive/5'
            }`}
          >
            <div className="flex items-start gap-2">
              {a.status === 'verified' ? (
                <CheckCircle className="h-3.5 w-3.5 text-safe mt-0.5 shrink-0" />
              ) : (
                <AlertOctagon className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0 animate-pulse-glow" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body font-medium text-foreground">{a.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-display ${
                    a.status === 'verified'
                      ? 'bg-safe/20 text-safe'
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {a.status === 'verified' ? '✓ Verified' : '⚠ Unverified'}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-body">{timeAgo(a.timestamp)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
