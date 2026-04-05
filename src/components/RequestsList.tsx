import { Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import type { HelpRequest } from '@/hooks/useCrisisData';

const priorityClasses = {
  HIGH: 'border-destructive/40 bg-destructive/5',
  MEDIUM: 'border-warning/40 bg-warning/5',
  LOW: 'border-safe/40 bg-safe/5',
};

const priorityBadge = {
  HIGH: 'bg-destructive/20 text-destructive',
  MEDIUM: 'bg-warning/20 text-warning',
  LOW: 'bg-safe/20 text-safe',
};

function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function RequestsList({ requests }: { requests: HelpRequest[] }) {
  return (
    <div className="space-y-2">
      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-warning" />
        Live Requests
        <span className="ml-auto text-[10px] font-body text-muted-foreground">{requests.length} total</span>
      </h3>

      <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
        {requests.slice(0, 15).map((r, i) => (
          <div
            key={r.id}
            className={`rounded-lg border p-2.5 transition-all hover:scale-[1.02] cursor-pointer ${priorityClasses[r.priority]}`}
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-display font-medium ${priorityBadge[r.priority]}`}>
                    {r.priority}
                  </span>
                  <span className="text-xs font-body font-medium text-foreground capitalize">{r.type}</span>
                </div>
                <p className="text-[11px] font-body text-muted-foreground mt-1 truncate">{r.description}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-muted-foreground font-body flex items-center gap-0.5">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo(r.timestamp)}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
