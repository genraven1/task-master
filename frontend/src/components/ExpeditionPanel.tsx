import { useState, useEffect } from 'react';
import type { City, Expedition, ExpeditionType, ExpeditionDuration } from '../types';
import { useLaunchExpedition, useClaimExpedition } from '../hooks/useCity';
import { useAuthStore } from '../store/authStore';

interface ExpeditionPanelProps {
  city: City;
}

const EXPEDITION_TYPES: { type: ExpeditionType; label: string; icon: string; description: string }[] = [
  { type: 'FORAGING',        label: 'Foraging',       icon: '🌿', description: '+Food' },
  { type: 'LOGGING',         label: 'Logging',        icon: '🪓', description: '+Wood' },
  { type: 'MINING',          label: 'Mining',         icon: '⛏️', description: '+Stone' },
  { type: 'TREASURY_RAID',   label: 'Treasury Raid',  icon: '💰', description: '+Gold' },
  { type: 'RECRUITMENT',     label: 'Recruitment',    icon: '👥', description: '+Citizens' },
  { type: 'CULTURAL_VOYAGE', label: 'Cultural Voyage',icon: '🎭', description: '+Culture' },
];

const DURATIONS: { value: ExpeditionDuration; label: string; hours: string }[] = [
  { value: 'SHORT',  label: 'Short',  hours: '1h' },
  { value: 'MEDIUM', label: 'Medium', hours: '4h' },
  { value: 'LONG',   label: 'Long',   hours: '8h' },
];

const DURATION_MULT: Record<ExpeditionDuration, number> = { SHORT: 1, MEDIUM: 4, LONG: 8 };

function calcReward(cityLevel: number, type: ExpeditionType, duration: ExpeditionDuration): string {
  const mult = DURATION_MULT[duration];
  const resource = cityLevel * 15 * mult;
  const small = cityLevel * mult;
  if (type === 'RECRUITMENT') return `+${small} citizens`;
  if (type === 'CULTURAL_VOYAGE') return `+${small} culture`;
  return `+${resource}`;
}

function Countdown({ completesAt }: { completesAt: string }) {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(completesAt).getTime() - Date.now();
      if (diff <= 0) {
        setLabel('Ready!');
        return;
      }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      // Show hours+minutes when ≥1h remains; switch to minutes+seconds for the last hour
      // so the countdown feels increasingly urgent as the expedition nears completion.
      setLabel(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [completesAt]);

  const isReady = new Date(completesAt).getTime() <= Date.now();
  return (
    <span className={isReady ? 'text-green-400 font-semibold' : 'text-gray-400'}>
      {label}
    </span>
  );
}

function rewardSummary(e: Expedition): string {
  if (e.rewardFood > 0)     return `+${e.rewardFood} 🌾`;
  if (e.rewardWood > 0)     return `+${e.rewardWood} 🪵`;
  if (e.rewardStone > 0)    return `+${e.rewardStone} 🪨`;
  if (e.rewardGold > 0)     return `+${e.rewardGold} 💰`;
  if (e.rewardCitizens > 0) return `+${e.rewardCitizens} 👥`;
  if (e.rewardCulture > 0)  return `+${e.rewardCulture} 🎭`;
  return '';
}

export default function ExpeditionPanel({ city }: ExpeditionPanelProps) {
  const { user } = useAuthStore();
  const launchMutation = useLaunchExpedition();
  const claimMutation  = useClaimExpedition();

  const [showLaunch, setShowLaunch] = useState(false);
  const [selectedType, setSelectedType]         = useState<ExpeditionType>('FORAGING');
  const [selectedDuration, setSelectedDuration] = useState<ExpeditionDuration>('SHORT');
  const [launchError, setLaunchError] = useState('');

  const expeditions = city.expeditions ?? [];
  const activeExpeditions = expeditions.filter((e) => e.status === 'ACTIVE');
  const myActiveExpedition = activeExpeditions.find((e) => e.launchedByUserId === user?.id);

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaunchError('');
    try {
      await launchMutation.mutateAsync({ expeditionType: selectedType, duration: selectedDuration });
      setShowLaunch(false);
    } catch {
      setLaunchError('Failed to launch expedition. You may already have one active.');
    }
  };

  const handleClaim = async (expeditionId: number) => {
    try {
      await claimMutation.mutateAsync(expeditionId);
    } catch {
      // silently ignore – countdown prevents premature clicks
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">⚔️ Expeditions</h3>
        {!myActiveExpedition && !showLaunch && (
          <button
            onClick={() => setShowLaunch(true)}
            className="text-xs bg-brand-purple/20 border border-brand-purple/40 text-brand-purple rounded-xl px-3 py-1 hover:bg-brand-purple/30 transition-colors"
          >
            + Send Expedition
          </button>
        )}
      </div>

      {/* Active expeditions */}
      {activeExpeditions.length > 0 && (
        <div className="space-y-2">
          {activeExpeditions.map((exp) => {
            const isReady = new Date(exp.completesAt).getTime() <= Date.now();
            const isOwn = exp.launchedByUserId === user?.id;
            return (
              <div key={exp.id} className="card flex items-center gap-3">
                <span className="text-2xl">{exp.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-sm truncate">{exp.name}</p>
                    <span className="text-xs text-gray-500 capitalize">{exp.duration.toLowerCase()}</span>
                  </div>
                  <p className="text-gray-400 text-xs">
                    by {exp.launchedByUsername} · {rewardSummary(exp)}
                  </p>
                  <div className="mt-0.5">
                    <Countdown completesAt={exp.completesAt} />
                  </div>
                </div>
                {isOwn && isReady && (
                  <button
                    onClick={() => handleClaim(exp.id)}
                    disabled={claimMutation.isPending}
                    className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50 shrink-0"
                  >
                    Claim
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recently claimed */}
      {expeditions.some((e) => e.status === 'CLAIMED') && (
        <div className="space-y-1.5">
          {expeditions
            .filter((e) => e.status === 'CLAIMED')
            .slice(0, 5)
            .map((exp) => (
              <div key={exp.id} className="flex items-center gap-2 px-2 py-1.5 rounded-xl bg-brand-darker border border-purple-900/30 opacity-60">
                <span className="text-lg">{exp.icon}</span>
                <span className="text-xs text-gray-400 flex-1 truncate">{exp.name} · {exp.duration.toLowerCase()}</span>
                <span className="text-xs text-green-500 font-semibold">{rewardSummary(exp)}</span>
                <span className="text-xs text-gray-600">✓ Claimed</span>
              </div>
            ))}
        </div>
      )}

      {activeExpeditions.length === 0 && !showLaunch && (
        <p className="text-gray-500 text-xs text-center py-2">No active expeditions. Send one out!</p>
      )}

      {/* Launch form */}
      {showLaunch && (
        <form onSubmit={handleLaunch} className="card space-y-4">
          <p className="text-white font-semibold text-sm">🗺️ New Expedition</p>

          {/* Type picker */}
          <div>
            <p className="text-gray-400 text-xs mb-2">Choose type</p>
            <div className="grid grid-cols-3 gap-2">
              {EXPEDITION_TYPES.map(({ type, label, icon, description }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-xs font-medium transition-all ${
                    selectedType === type
                      ? 'border-brand-purple bg-brand-purple/20 text-white'
                      : 'border-purple-900/40 bg-brand-darker text-gray-400 hover:border-brand-purple/50'
                  }`}
                >
                  <span className="text-xl">{icon}</span>
                  <span className="leading-tight text-center">{label}</span>
                  <span className="text-gray-500 text-[10px]">{description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Duration picker */}
          <div>
            <p className="text-gray-400 text-xs mb-2">Choose duration</p>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map(({ value, label, hours }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedDuration(value)}
                  className={`flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs font-medium transition-all ${
                    selectedDuration === value
                      ? 'border-brand-purple bg-brand-purple/20 text-white'
                      : 'border-purple-900/40 bg-brand-darker text-gray-400 hover:border-brand-purple/50'
                  }`}
                >
                  <span className="font-bold">{label}</span>
                  <span className="text-gray-500">{hours}</span>
                  <span className="text-green-400 font-semibold text-[10px] mt-0.5">
                    {calcReward(city.level, selectedType, value)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {launchError && <p className="text-red-400 text-xs">{launchError}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setShowLaunch(false); setLaunchError(''); }}
              className="flex-1 py-2 rounded-xl border border-purple-800/50 text-gray-400 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={launchMutation.isPending}
              className="flex-1 btn-primary text-sm disabled:opacity-50"
            >
              {launchMutation.isPending ? 'Sending…' : '⚔️ Send'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
