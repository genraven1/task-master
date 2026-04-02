import { useState } from 'react';
import { useMyCity, useCreateCity, useJoinCity, useLeaveCity } from '../hooks/useCity';
import { useAuthStore } from '../store/authStore';
import BuildingCard from '../components/BuildingCard';
import ResourceBar from '../components/ResourceBar';
import ExpeditionPanel from '../components/ExpeditionPanel';
import type { ResourceType } from '../types';

export default function CityPage() {
  const { data: city, isLoading, error } = useMyCity();
  const { user } = useAuthStore();
  const [mode, setMode] = useState<'none' | 'create' | 'join'>('none');
  const [cityName, setCityName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [actionError, setActionError] = useState('');
  const [copied, setCopied] = useState(false);

  const createCity = useCreateCity();
  const joinCity = useJoinCity();
  const leaveCity = useLeaveCity();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;
    setActionError('');
    try {
      await createCity.mutateAsync(cityName.trim());
      setMode('none');
      setCityName('');
    } catch {
      setActionError('Failed to create city. Please try again.');
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setActionError('');
    try {
      await joinCity.mutateAsync(inviteCode.trim().toUpperCase());
      setMode('none');
      setInviteCode('');
    } catch {
      setActionError('Invalid invite code or you are already in a city.');
    }
  };

  const handleLeave = async () => {
    if (!confirm('Are you sure you want to leave this city?')) return;
    try {
      await leaveCity.mutateAsync();
    } catch {
      setActionError('Could not leave city. Founders cannot leave their city.');
    }
  };

  const copyInvite = () => {
    if (city?.inviteCode) {
      navigator.clipboard.writeText(city.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resources: ResourceType[] = ['FOOD', 'WOOD', 'STONE', 'GOLD'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <span className="text-gray-400 animate-pulse">Loading city...</span>
      </div>
    );
  }

  // No city – show create/join options
  if (!city || error) {
    return (
      <div className="px-4 py-6 space-y-4">
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🏰</div>
          <h2 className="text-white font-bold text-xl mb-1">No City Yet</h2>
          <p className="text-gray-400 text-sm">Found a civilization or join one with an invite code.</p>
        </div>

        {mode === 'none' && (
          <div className="flex flex-col gap-3">
            <button onClick={() => setMode('create')} className="btn-primary w-full">
              🏗️ Found a City
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full py-3 rounded-xl border border-purple-800/50 text-gray-300 hover:border-brand-purple font-semibold transition-all"
            >
              🚪 Join a City
            </button>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-3">
            <input
              type="text"
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="City name..."
              className="input-field"
              maxLength={50}
              autoFocus
            />
            {actionError && <p className="text-red-400 text-sm">{actionError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setMode('none')} className="flex-1 py-3 rounded-xl border border-purple-800/50 text-gray-400 font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={createCity.isPending} className="flex-1 btn-primary disabled:opacity-50">
                {createCity.isPending ? 'Creating...' : '🏗️ Found City'}
              </button>
            </div>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-3">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Invite code (e.g. ABC123456789)"
              className="input-field tracking-widest"
              maxLength={12}
              autoFocus
            />
            {actionError && <p className="text-red-400 text-sm">{actionError}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => setMode('none')} className="flex-1 py-3 rounded-xl border border-purple-800/50 text-gray-400 font-semibold">
                Cancel
              </button>
              <button type="submit" disabled={joinCity.isPending} className="flex-1 btn-primary disabled:opacity-50">
                {joinCity.isPending ? 'Joining...' : '🚪 Join City'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  const myMembership = city.members?.find((m) => m.userId === user?.id);
  const isFounder = myMembership?.role === 'FOUNDER';

  return (
    <div className="px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white font-bold text-xl flex items-center gap-2">
            🏰 {city.name}
          </h1>
          <p className="text-gray-400 text-sm">
            Level {city.level} · {city.members?.length ?? 0} citizens
          </p>
        </div>
        <div className="bg-brand-purple/20 border border-brand-purple/40 rounded-xl px-3 py-1.5">
          <span className="text-brand-purple font-bold">Lv.{city.level}</span>
        </div>
      </div>

      {/* Invite code */}
      <div className="card flex items-center justify-between gap-3">
        <div>
          <p className="text-gray-400 text-xs mb-0.5">Invite Code</p>
          <p className="text-white font-mono font-bold tracking-widest">{city.inviteCode}</p>
        </div>
        <button
          onClick={copyInvite}
          className="text-sm bg-brand-darker border border-purple-800/50 hover:border-brand-purple rounded-xl px-3 py-2 text-gray-300 transition-colors"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      {/* Resources */}
      <div className="card space-y-3">
        <h3 className="text-white font-semibold text-sm">📦 City Resources</h3>
        {resources.map((rt) => (
          <ResourceBar key={rt} type={rt} amount={city[rt.toLowerCase() as keyof typeof city] as number} />
        ))}
      </div>

      {/* Buildings */}
      <div>
        <h3 className="text-white font-semibold text-sm mb-2">🏗️ Buildings</h3>
        <div className="grid grid-cols-2 gap-2">
          {(city.buildings ?? []).map((b) => (
            <BuildingCard key={b.id} building={b} />
          ))}
        </div>
      </div>

      {/* Population & Culture */}
      <div className="card grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">👥</span>
          <div>
            <p className="text-gray-400 text-xs">Population</p>
            <p className="text-white font-bold">{city.population ?? 0}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🎭</span>
          <div>
            <p className="text-gray-400 text-xs">Culture</p>
            <p className="text-white font-bold">{city.culture ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Expeditions */}
      <div className="card">
        <ExpeditionPanel city={city} />
      </div>

      {/* My contribution */}
      {myMembership && (
        <div className="card">
          <h3 className="text-white font-semibold text-sm mb-2">🎖️ My Contributions</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-brand-darker rounded-lg px-2 py-1.5">
              <span>🌾</span><span className="text-gray-300">{myMembership.foodContributed}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-darker rounded-lg px-2 py-1.5">
              <span>🪵</span><span className="text-gray-300">{myMembership.woodContributed}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-darker rounded-lg px-2 py-1.5">
              <span>⛏️</span><span className="text-gray-300">{myMembership.stoneContributed}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-brand-darker rounded-lg px-2 py-1.5">
              <span>💰</span><span className="text-gray-300">{myMembership.goldContributed}</span>
            </div>
          </div>
          <div className="mt-2 text-center text-xs text-gray-400">
            Total: <span className="text-brand-gold font-bold">{myMembership.totalContributed}</span> resources contributed
          </div>
        </div>
      )}

      {/* Members */}
      <div className="card">
        <h3 className="text-white font-semibold text-sm mb-3">👥 Citizens</h3>
        <div className="space-y-2">
          {(city.members ?? [])
            .sort((a, b) => b.totalContributed - a.totalContributed)
            .map((m) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{m.role === 'FOUNDER' ? '👑' : '🧑'}</span>
                  <span className="text-sm text-white font-medium">{m.username}</span>
                  {m.userId === user?.id && (
                    <span className="text-xs text-brand-purple">(you)</span>
                  )}
                </div>
                <span className="text-xs text-gray-400">{m.totalContributed} contributed</span>
              </div>
            ))}
        </div>
      </div>

      {/* Leave */}
      {!isFounder && (
        <button
          onClick={handleLeave}
          disabled={leaveCity.isPending}
          className="w-full py-3 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-900/20 font-semibold transition-all text-sm disabled:opacity-50"
        >
          🚪 Leave City
        </button>
      )}
    </div>
  );
}
