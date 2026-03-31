import { useState } from 'react';
import { useAllTasks } from '../hooks/useTasks';
import TaskList from '../components/TaskList';
import { useAuthStore } from '../store/authStore';

type TabType = 'ALL' | 'DAILY' | 'TODO' | 'HABIT';

const tabs: { key: TabType; label: string; icon: string }[] = [
  { key: 'ALL', label: 'All', icon: '🗺️' },
  { key: 'DAILY', label: 'Dailies', icon: '📅' },
  { key: 'TODO', label: 'Todos', icon: '✅' },
  { key: 'HABIT', label: 'Habits', icon: '🔄' },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [xpToast, setXpToast] = useState<{ xp: number; gold: number } | null>(null);
  const { data: tasks, isLoading } = useAllTasks();
  const { user } = useAuthStore();

  const filteredTasks = tasks
    ? activeTab === 'ALL'
      ? tasks
      : tasks.filter((t) => t.type === activeTab)
    : [];

  const handleXpGained = (xp: number, gold: number) => {
    setXpToast({ xp, gold });
    setTimeout(() => setXpToast(null), 2500);
  };

  return (
    <div className="relative">
      {/* XP Gained Toast */}
      {xpToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-brand-card border border-brand-gold/30 rounded-2xl px-4 py-3 shadow-2xl">
            <div className="text-brand-gold font-bold text-sm">+{xpToast.xp} XP</div>
            <div className="text-yellow-500 text-xs">+{xpToast.gold} 💰 Gold</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <h1 className="text-white font-bold text-xl">
          ⚔️ Welcome back, <span className="text-brand-gold">{user?.username}</span>!
        </h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {filteredTasks.filter(t => !t.completed).length} active quests
        </p>
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3">
        <div className="flex gap-1 bg-brand-darker rounded-2xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-brand-purple text-white shadow-lg'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <TaskList
        tasks={filteredTasks}
        type={activeTab !== 'ALL' ? activeTab : undefined}
        isLoading={isLoading}
        onXpGained={handleXpGained}
      />
    </div>
  );
}
