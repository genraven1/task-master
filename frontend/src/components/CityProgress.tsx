import type { City } from '../types';
import ProgressBar from './ProgressBar';

interface CityProgressProps {
  city: City;
  compact?: boolean;
}

export default function CityProgress({ city, compact = false }: CityProgressProps) {
  const avgBuildingLevel = city.buildings && city.buildings.length > 0
    ? city.buildings.reduce((s, b) => s + b.level, 0) / city.buildings.length
    : 1;

  const displayProgress = city.level >= 5 ? 1 : (avgBuildingLevel - Math.floor(avgBuildingLevel));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-base">🏰</span>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs text-gray-300 font-semibold">{city.name}</span>
            <span className="text-xs text-gray-400">Lv.{city.level}</span>
          </div>
          <ProgressBar
            value={Math.round(displayProgress * 100)}
            max={100}
            color="purple"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏰</span>
          <div>
            <h3 className="text-white font-bold">{city.name}</h3>
            <p className="text-gray-400 text-xs">{city.members?.length ?? 0} citizens</p>
          </div>
        </div>
        <div className="bg-brand-purple/20 border border-brand-purple/40 rounded-xl px-3 py-1">
          <span className="text-brand-purple font-bold text-sm">Lv.{city.level}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400">City Progress</span>
        <span className="text-xs text-gray-500">Avg building: {avgBuildingLevel.toFixed(1)}</span>
      </div>
      <ProgressBar
        value={Math.round(displayProgress * 100)}
        max={100}
        color="purple"
      />

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 bg-brand-darker rounded-lg px-2 py-1.5">
          <span>🌾</span><span className="text-gray-300">{city.food}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-darker rounded-lg px-2 py-1.5">
          <span>🪵</span><span className="text-gray-300">{city.wood}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-darker rounded-lg px-2 py-1.5">
          <span>⛏️</span><span className="text-gray-300">{city.stone}</span>
        </div>
        <div className="flex items-center gap-1.5 bg-brand-darker rounded-lg px-2 py-1.5">
          <span>💰</span><span className="text-gray-300">{city.gold}</span>
        </div>
      </div>
    </div>
  );
}
