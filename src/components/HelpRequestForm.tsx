import { useState } from 'react';
import { Send, MapPin } from 'lucide-react';
import type { RequestType, HelpRequest, CrisisMode } from '@/hooks/useCrisisData';

interface Props {
  mode: CrisisMode;
  onSubmit: (req: Omit<HelpRequest, 'id' | 'priority' | 'timestamp' | 'status'>) => void;
  isOffline: boolean;
}

const typeLabels: Record<RequestType, string> = {
  medical: '🏥 Medical',
  food: '🍞 Food',
  rescue: '🚨 Rescue',
  shelter: '🏠 Shelter',
  water: '💧 Water',
};

export function HelpRequestForm({ mode, onSubmit, isOffline }: Props) {
  const [type, setType] = useState<RequestType>('medical');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const baseLat = mode === 'war' ? 34.08 : 20.59;
  const baseLng = mode === 'war' ? 74.80 : 78.96;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      lat: baseLat + (Math.random() - 0.5) * 0.1,
      lng: baseLng + (Math.random() - 0.5) * 0.1,
      locationName: location || 'Auto-detected',
      type,
      description: description || 'Emergency assistance needed',
    });
    setDescription('');
    setLocation('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="font-display text-sm font-semibold text-foreground flex items-center gap-2">
        <Send className="h-4 w-4 text-primary" /> Request Help
        {isOffline && <span className="text-[10px] text-warning font-body">(offline)</span>}
      </h3>

      <div className="grid grid-cols-5 gap-1">
        {(Object.keys(typeLabels) as RequestType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`text-[10px] py-1.5 px-1 rounded-md font-body transition-all ${
              type === t
                ? 'bg-primary/20 text-primary border border-primary/40'
                : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {typeLabels[t].split(' ')[0]}
          </button>
        ))}
      </div>

      <div className="relative">
        <MapPin className="absolute left-2 top-2.5 h-3 w-3 text-muted-foreground" />
        <input
          value={location}
          onChange={e => setLocation(e.target.value)}
          placeholder="Location (auto-detect)"
          className="w-full bg-secondary/50 border border-border/50 rounded-lg pl-7 pr-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
      </div>

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Describe the emergency..."
        rows={2}
        className="w-full bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-xs font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
      />

      <button
        type="submit"
        className="w-full py-2 rounded-lg text-xs font-display font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-all glow-primary"
      >
        {isOffline ? 'Queue Request' : 'Submit Request'}
      </button>
    </form>
  );
}
