import { Shield, Zap, Wifi, WifiOff, Radio, Eye, EyeOff } from 'lucide-react';
import type { CrisisMode } from '@/hooks/useCrisisData';

interface NavbarProps {
  mode: CrisisMode;
  setMode: (m: CrisisMode) => void;
  isSimulating: boolean;
  onSimulate: () => void;
  onStopSimulate: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  offlineCount: number;
  onSync: () => void;
  showPredictions?: boolean;
  onTogglePredictions?: () => void;
}

export function Navbar({ mode, setMode, isSimulating, onSimulate, onStopSimulate, isOffline, onToggleOffline, offlineCount, onSync, showPredictions, onTogglePredictions }: NavbarProps) {
  return (
    <nav className="glass border-b border-border/50 px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Shield className="h-8 w-8 text-primary" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-safe animate-pulse-glow" />
        </div>
        <div>
          <h1 className="text-sm md:text-lg font-display font-bold gradient-text leading-tight">
            AI CRISIS RESPONSE 🇮🇳
          </h1>
          <p className="text-[10px] md:text-xs text-muted-foreground font-body">
            India Unified Emergency System
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Mode toggle */}
        <div className="glass-card !p-1 flex gap-1">
          <button
            onClick={() => setMode('war')}
            className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-300 ${
              mode === 'war'
                ? 'bg-accent text-accent-foreground glow-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            ⚔️ <span className="hidden md:inline">Conflict</span>
          </button>
          <button
            onClick={() => setMode('disaster')}
            className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-300 ${
              mode === 'disaster'
                ? 'bg-primary text-primary-foreground glow-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🌊 <span className="hidden md:inline">Disaster</span>
          </button>
        </div>

        {/* Simulate */}
        <button
          onClick={isSimulating ? onStopSimulate : onSimulate}
          className={`glass-card !p-2 transition-all duration-300 ${
            isSimulating ? 'glow-danger text-destructive' : 'hover:glow-primary text-primary'
          }`}
          title={isSimulating ? 'Stop simulation' : 'Simulate crisis'}
        >
          <Radio className={`h-4 w-4 ${isSimulating ? 'animate-pulse-glow' : ''}`} />
        </button>

        {/* Prediction toggle */}
        {onTogglePredictions && (
          <button
            onClick={onTogglePredictions}
            className={`glass-card !p-2 transition-all duration-300 ${
              showPredictions ? 'glow-primary text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
            title={showPredictions ? 'Hide predictions' : 'Show predictions'}
          >
            {showPredictions ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        )}

        {/* Offline */}
        <button
          onClick={isOffline && offlineCount > 0 ? onSync : onToggleOffline}
          className={`glass-card !p-2 transition-all ${
            isOffline ? 'text-warning' : 'text-safe'
          }`}
          title={isOffline ? `Offline (${offlineCount} queued) - click to sync` : 'Online'}
        >
          {isOffline ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4" />}
        </button>

        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
          <Zap className="h-3 w-3 text-primary" />
          <span className="font-body">AI Active</span>
        </div>
      </div>
    </nav>
  );
}
