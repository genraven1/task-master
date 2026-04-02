import type { ResourceType } from '../types';

interface ResourceBarProps {
  type: ResourceType;
  amount: number;
  className?: string;
}

const resourceConfig: Record<ResourceType, { label: string; icon: string; color: string; bg: string }> = {
  FOOD:  { label: 'Food',  icon: '🌾', color: 'bg-green-500',  bg: 'bg-green-950/50' },
  WOOD:  { label: 'Wood',  icon: '🪵', color: 'bg-yellow-700', bg: 'bg-yellow-950/50' },
  STONE: { label: 'Stone', icon: '⛏️', color: 'bg-gray-400',   bg: 'bg-gray-800/50'  },
  GOLD:  { label: 'Gold',  icon: '💰', color: 'bg-yellow-400', bg: 'bg-yellow-950/50' },
};

export default function ResourceBar({ type, amount, className = '' }: ResourceBarProps) {
  const cfg = resourceConfig[type];
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-lg">{cfg.icon}</span>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-0.5">
          <span className="text-xs text-gray-400 font-medium">{cfg.label}</span>
          <span className="text-xs text-gray-300 font-mono">{amount.toLocaleString()}</span>
        </div>
        <div className={`h-1.5 rounded-full ${cfg.bg} overflow-hidden`}>
          <div
            className={`h-full rounded-full ${cfg.color} transition-all duration-500`}
            style={{ width: `${Math.min((amount / 500) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export { resourceConfig };
