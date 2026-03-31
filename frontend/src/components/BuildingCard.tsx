import type { Building } from '../types';
import ProgressBar from './ProgressBar';

interface BuildingCardProps {
  building: Building;
}

const MAX_LEVEL = 5;

export default function BuildingCard({ building }: BuildingCardProps) {
  const isMaxed = building.level >= MAX_LEVEL;

  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{building.icon}</span>
          <div>
            <p className="text-white font-semibold text-sm">{building.name}</p>
            <p className="text-gray-400 text-xs">Level {building.level}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: MAX_LEVEL }).map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${i < building.level ? 'bg-brand-gold' : 'bg-gray-700'}`}
            />
          ))}
        </div>
      </div>

      {!isMaxed && (
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Progress to Lv.{building.level + 1}</span>
            <span className="text-xs text-gray-500 font-mono">
              {building.progress}/{building.progressRequired}
            </span>
          </div>
          <ProgressBar
            value={building.progress}
            max={building.progressRequired}
            color="gold"
          />
        </div>
      )}
      {isMaxed && (
        <p className="text-xs text-brand-gold font-semibold text-center">✨ Maxed Out!</p>
      )}
    </div>
  );
}
