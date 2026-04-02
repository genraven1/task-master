import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { useAllTasks } from '../hooks/useTasks';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { data: tasks } = useAllTasks();

  if (!user) return null;

  const xpForNextLevel = user.level * 100;
  const xpInCurrentLevel = user.xp;
  const xpPercent = Math.round((xpInCurrentLevel / xpForNextLevel) * 100);

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.completed).length ?? 0;
  const habits = tasks?.filter((t) => t.type === 'HABIT').length ?? 0;
  const dailies = tasks?.filter((t) => t.type === 'DAILY').length ?? 0;
  const todos = tasks?.filter((t) => t.type === 'TODO').length ?? 0;
  const maxStreak = tasks ? Math.max(...tasks.map((t) => t.streak), 0) : 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const achievements = [
    { icon: '🥇', label: 'First Quest', unlocked: completedTasks >= 1 },
    { icon: '⚔️', label: 'Warrior', unlocked: completedTasks >= 10 },
    { icon: '🔥', label: 'On Fire', unlocked: maxStreak >= 3 },
    { icon: '🏆', label: 'Champion', unlocked: completedTasks >= 50 },
    { icon: '💎', label: 'Diamond', unlocked: user.level >= 10 },
    { icon: '🌟', label: 'Legend', unlocked: user.level >= 25 },
  ];

  return (
    <div className="px-4 pt-3 pb-4">
      {/* Profile Header */}
      <div className="card mb-4 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-purple to-purple-900 rounded-full flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg shadow-purple-900/50">
          ⚔️
        </div>
        <h2 className="text-white font-bold text-2xl">{user.username}</h2>
        <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="bg-brand-darker rounded-xl px-3 py-2 text-center">
            <div className="text-brand-gold font-bold text-lg">{user.level}</div>
            <div className="text-gray-500 text-xs">Level</div>
          </div>
          <div className="bg-brand-darker rounded-xl px-3 py-2 text-center">
            <div className="text-brand-gold font-bold text-lg">{user.gold.toLocaleString()}</div>
            <div className="text-gray-500 text-xs">Gold 💰</div>
          </div>
          <div className="bg-brand-darker rounded-xl px-3 py-2 text-center">
            <div className="text-green-400 font-bold text-lg">{user.hp}</div>
            <div className="text-gray-500 text-xs">HP ❤️</div>
          </div>
        </div>
      </div>

      {/* XP Progress */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">✨ Experience Points</h3>
          <span className="text-brand-gold text-sm font-bold">{xpPercent}%</span>
        </div>
        <ProgressBar value={xpInCurrentLevel} max={xpForNextLevel} color="gold" showText label={`Level ${user.level} → ${user.level + 1}`} />
        <p className="text-gray-500 text-xs mt-2 text-center">
          {xpForNextLevel - xpInCurrentLevel} XP to next level
        </p>
      </div>

      {/* HP */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">❤️ Health Points</h3>
          <span className={`text-sm font-bold ${user.hp < user.maxHp * 0.3 ? 'text-red-400' : 'text-green-400'}`}>
            {user.hp}/{user.maxHp}
          </span>
        </div>
        <ProgressBar value={user.hp} max={user.maxHp} color={user.hp < user.maxHp * 0.3 ? 'red' : 'green'} />
      </div>

      {/* Stats */}
      <div className="card mb-4">
        <h3 className="text-white font-semibold mb-3">📊 Quest Stats</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Quests', value: totalTasks, icon: '📋' },
            { label: 'Completed', value: completedTasks, icon: '✅' },
            { label: 'Habits', value: habits, icon: '🔄' },
            { label: 'Dailies', value: dailies, icon: '📅' },
            { label: 'Todos', value: todos, icon: '📝' },
            { label: 'Best Streak', value: `${maxStreak} 🔥`, icon: '🏆' },
          ].map((stat) => (
            <div key={stat.label} className="bg-brand-darker rounded-xl p-3">
              <div className="text-xl">{stat.icon}</div>
              <div className="text-white font-bold text-lg">{stat.value}</div>
              <div className="text-gray-500 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className="card mb-6">
        <h3 className="text-white font-semibold mb-3">🏅 Achievements</h3>
        <div className="grid grid-cols-3 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.label}
              className={`rounded-xl p-3 text-center transition-all ${
                ach.unlocked
                  ? 'bg-brand-purple/20 border border-brand-purple/40'
                  : 'bg-brand-darker/50 opacity-40'
              }`}
            >
              <div className="text-2xl mb-1">{ach.icon}</div>
              <div className={`text-xs font-semibold ${ach.unlocked ? 'text-white' : 'text-gray-600'}`}>
                {ach.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3.5 rounded-xl border border-red-800/50 text-red-400 hover:bg-red-900/20 hover:border-red-600 transition-all font-semibold"
      >
        🚪 Logout
      </button>
    </div>
  );
}
