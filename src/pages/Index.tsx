import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { CrisisMap } from '@/components/CrisisMap';
import { HelpRequestForm } from '@/components/HelpRequestForm';
import { RequestsList } from '@/components/RequestsList';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { AlertsPanel } from '@/components/AlertsPanel';
import { SafeRoutePanel } from '@/components/SafeRoutePanel';
import { PredictionPanel } from '@/components/PredictionPanel';
import { PredictionAlerts } from '@/components/PredictionAlerts';
import { useCrisisData, type SafeRoute } from '@/hooks/useCrisisData';
import { usePredictionData } from '@/hooks/usePredictionData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type SidebarTab = 'requests' | 'analytics' | 'alerts' | 'predictions';

export default function Index() {
  const crisis = useCrisisData();
  const prediction = usePredictionData(crisis.mode);
  const [safeRoute, setSafeRoute] = useState<SafeRoute | null>(null);
  const [activeTab, setActiveTab] = useState<SidebarTab>('requests');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs: { id: SidebarTab; label: string; emoji: string }[] = [
    { id: 'requests', label: 'Requests', emoji: '📢' },
    { id: 'predictions', label: 'Predict', emoji: '🔮' },
    { id: 'analytics', label: 'Stats', emoji: '📊' },
    { id: 'alerts', label: 'Alerts', emoji: '⚠️' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar
        mode={crisis.mode}
        setMode={crisis.setMode}
        isSimulating={crisis.isSimulating}
        onSimulate={crisis.startSimulation}
        onStopSimulate={crisis.stopSimulation}
        isOffline={crisis.isOffline}
        onToggleOffline={() => crisis.setIsOffline(!crisis.isOffline)}
        offlineCount={crisis.offlineQueue.length}
        onSync={crisis.syncOffline}
        showPredictions={prediction.showPredictions}
        onTogglePredictions={() => prediction.setShowPredictions(!prediction.showPredictions)}
      />

      {/* Prediction early-warning popups */}
      {prediction.showPredictions && <PredictionAlerts alerts={prediction.alerts} />}

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative">
          <CrisisMap
            center={crisis.mapCenter}
            defaultZoom={crisis.defaultZoom}
            zones={crisis.zones}
            requests={crisis.requests}
            shelters={crisis.shelters}
            safeRoute={safeRoute}
            predictionZones={prediction.predictionZones}
            showPredictions={prediction.showPredictions}
          />

          {/* Mode indicator overlay */}
          <div className="absolute top-3 right-3 z-20 glass-card !p-2 !px-3 animate-fade-in">
            <p className="text-[10px] font-display font-semibold">
              {crisis.mode === 'war' ? '⚔️ CONFLICT MODE – J&K' : '🌊 DISASTER MODE – INDIA'}
            </p>
            <p className="text-[10px] font-body text-muted-foreground">
              {crisis.zones.filter(z => z.type === 'danger').length} danger zones active
            </p>
            {prediction.showPredictions && (
              <p className="text-[10px] font-body text-accent mt-0.5">
                🔮 Predictions ON
              </p>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden absolute bottom-3 right-3 z-20 glass-card !p-2"
          >
            {sidebarOpen ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>

        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-80 md:w-[340px]' : 'w-0'
          } transition-all duration-300 overflow-hidden border-l border-border/50 bg-card/50 backdrop-blur-xl flex flex-col absolute md:relative right-0 top-0 bottom-0 z-30 md:z-auto`}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {/* Tabs */}
            <div className="flex gap-1 glass-card !p-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-display font-medium transition-all ${
                    activeTab === t.id
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>

            {/* Form always visible */}
            <HelpRequestForm mode={crisis.mode} onSubmit={crisis.addRequest} isOffline={crisis.isOffline} />

            <div className="border-t border-border/30" />

            {/* Safe Route */}
            <SafeRoutePanel safeRoute={safeRoute} onGenerate={setSafeRoute} mode={crisis.mode} />

            <div className="border-t border-border/30" />

            {/* Tab content */}
            {activeTab === 'requests' && <RequestsList requests={crisis.requests} />}
            {activeTab === 'analytics' && <AnalyticsPanel analytics={crisis.analytics} />}
            {activeTab === 'alerts' && <AlertsPanel alerts={crisis.alerts} />}
            {activeTab === 'predictions' && (
              <PredictionPanel
                floodRisk={prediction.floodRisk}
                areaRisks={prediction.areaRisks}
                riskTimeline={prediction.riskTimeline}
                inputs={prediction.inputs}
                setInputs={prediction.setInputs}
                riskColor={prediction.riskColor}
              />
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border/30 p-3 text-center">
            <p className="text-[10px] font-body text-muted-foreground">
              AI Crisis Response India v2.0 • NDMA + ISRO + IMD Integrated
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
