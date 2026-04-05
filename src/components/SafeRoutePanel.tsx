import { Route, Navigation } from 'lucide-react';
import type { SafeRoute, CrisisMode } from '@/hooks/useCrisisData';
import { generateSafeRoute } from '@/hooks/useCrisisData';

interface Props {
  safeRoute: SafeRoute | null;
  onGenerate: (route: SafeRoute) => void;
  mode: CrisisMode;
}

export function SafeRoutePanel({ safeRoute, onGenerate, mode }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
        <Route className="h-4 w-4 text-safe" /> Safe Route
      </h3>

      <button
        onClick={() => onGenerate(generateSafeRoute(mode))}
        className="w-full py-2.5 rounded-lg text-xs font-display font-semibold bg-safe/20 text-safe border border-safe/30 hover:bg-safe/30 transition-all flex items-center justify-center gap-2"
      >
        <Navigation className="h-3.5 w-3.5" />
        Generate Safe Path
      </button>

      {safeRoute && (
        <div className="glass-card !p-3 space-y-2 animate-fade-in">
          <div className="flex justify-between text-xs font-body">
            <span className="text-muted-foreground">Distance</span>
            <span className="text-safe font-medium">{safeRoute.distance}</span>
          </div>
          <div className="flex justify-between text-xs font-body">
            <span className="text-muted-foreground">ETA</span>
            <span className="text-safe font-medium">{safeRoute.eta}</span>
          </div>
          <div className="flex justify-between text-xs font-body">
            <span className="text-muted-foreground">Waypoints</span>
            <span className="text-safe font-medium">{safeRoute.points.length}</span>
          </div>
          <p className="text-[10px] text-muted-foreground font-body mt-1">
            ✅ Route avoids all detected danger zones
          </p>
        </div>
      )}
    </div>
  );
}
