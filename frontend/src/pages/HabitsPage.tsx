import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskList from '../components/TaskList';
import type { ResourceType } from '../types';

export default function HabitsPage() {
  const [xpToast, setXpToast] = useState<{ xp: number; gold: number; resourceType: ResourceType; resourceGained: number } | null>(null);
  const { data: tasks, isLoading } = useTasks('HABIT');

  const handleXpGained = (xp: number, gold: number, resourceType: ResourceType, resourceGained: number) => {
    setXpToast({ xp, gold, resourceType, resourceGained });
    setTimeout(() => setXpToast(null), 2500);
  };

  return (
    <div>
      {xpToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-brand-card border border-brand-gold/30 rounded-2xl px-4 py-3 shadow-2xl">
            <div className="text-brand-gold font-bold text-sm">+{xpToast.xp} XP</div>
            <div className="text-yellow-500 text-xs">+{xpToast.gold} 💰 Gold</div>
            {xpToast.resourceGained > 0 && (
              <div className="text-green-400 text-xs">+{xpToast.resourceGained} for city 🏰</div>
            )}
          </div>
        </div>
      )}
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-white font-bold text-xl">🔄 Habits</h1>
        <p className="text-gray-400 text-sm mt-0.5">Recurring actions that build character</p>
      </div>
      <TaskList tasks={tasks ?? []} type="HABIT" isLoading={isLoading} onXpGained={handleXpGained} />
    </div>
  );
}
