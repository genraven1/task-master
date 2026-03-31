import { useAuthStore } from '../store/authStore';
import ProgressBar from './ProgressBar';

export default function UserStats() {
  const { user } = useAuthStore();

  if (!user) return null;

  const xpForNextLevel = user.level * 100;
  const xpInCurrentLevel = user.xp % xpForNextLevel;

  return (
    <div className="bg-brand-darker border-b border-purple-900/30 px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-brand-purple rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg shadow-purple-900/30">
            <span className="text-base">⚔️</span>
            <span className="text-white font-bold text-sm">Lv.{user.level}</span>
          </div>
          <div className="text-gray-300 text-sm font-semibold">{user.username}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-brand-card rounded-xl px-3 py-1.5">
            <span className="text-base">💰</span>
            <span className="text-brand-gold font-bold text-sm">{user.gold.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-red-400 text-xs">❤️</span>
            <span className="text-xs text-gray-400 font-medium">HP</span>
            <span className="text-xs text-gray-500 ml-auto">{user.hp}/{user.maxHp}</span>
          </div>
          <ProgressBar
            value={user.hp}
            max={user.maxHp}
            color={user.hp < user.maxHp * 0.3 ? 'red' : 'green'}
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-yellow-400 text-xs">✨</span>
            <span className="text-xs text-gray-400 font-medium">XP</span>
            <span className="text-xs text-gray-500 ml-auto">{xpInCurrentLevel}/{xpForNextLevel}</span>
          </div>
          <ProgressBar
            value={xpInCurrentLevel}
            max={xpForNextLevel}
            color="gold"
          />
        </div>
      </div>
    </div>
  );
}
