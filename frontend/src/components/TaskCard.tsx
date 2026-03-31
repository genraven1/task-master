import { useState } from 'react';
import type { Task } from '../types';
import { useCompleteTask, useDeleteTask } from '../hooks/useTasks';
import { useAuthStore } from '../store/authStore';
import LevelUpToast from './LevelUpToast';

interface TaskCardProps {
  task: Task;
  onXpGained?: (xp: number, gold: number) => void;
}

const difficultyConfig = {
  EASY: { label: 'Easy', className: 'badge-easy', stars: '⭐' },
  MEDIUM: { label: 'Medium', className: 'badge-medium', stars: '⭐⭐' },
  HARD: { label: 'Hard', className: 'badge-hard', stars: '⭐⭐⭐' },
  EPIC: { label: 'Epic', className: 'badge-epic', stars: '⭐⭐⭐⭐' },
};

const typeConfig = {
  DAILY: { label: 'Daily', color: 'text-blue-400', icon: '📅' },
  TODO: { label: 'Todo', color: 'text-purple-400', icon: '✅' },
  HABIT: { label: 'Habit', color: 'text-green-400', icon: '🔄' },
};

export default function TaskCard({ task, onXpGained }: TaskCardProps) {
  const [completing, setCompleting] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [leveledUp, setLeveledUp] = useState(false);
  const { updateUser, user } = useAuthStore();
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();

  const diff = difficultyConfig[task.difficulty];
  const typeConf = typeConfig[task.type];

  const handleComplete = async () => {
    if (task.completed || completing) return;
    setCompleting(true);
    try {
      const result = await completeTask.mutateAsync(task.id);
      updateUser(result.user);
      setJustCompleted(true);
      if (result.leveledUp) {
        setLeveledUp(true);
      }
      onXpGained?.(result.xpGained, result.goldGained);
    } catch (err) {
      console.error('Failed to complete task:', err);
    } finally {
      setCompleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask.mutateAsync(task.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <>
      {leveledUp && user && (
        <LevelUpToast level={user.level} onClose={() => setLeveledUp(false)} />
      )}
      <div
        className={`card mb-3 transition-all duration-300 ${
          task.completed || justCompleted ? 'opacity-60' : 'animate-fade-in'
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={handleComplete}
            disabled={task.completed || justCompleted || completing}
            className={`flex-shrink-0 w-11 h-11 rounded-xl border-2 flex items-center justify-center transition-all duration-200 active:scale-90 ${
              task.completed || justCompleted
                ? 'bg-green-800/40 border-green-600 text-green-400'
                : 'border-purple-600 hover:border-brand-gold hover:bg-brand-gold/10 text-transparent hover:text-brand-gold'
            }`}
          >
            {completing ? (
              <span className="text-brand-gold animate-spin text-base">⌛</span>
            ) : task.completed || justCompleted ? (
              <span className="text-green-400 text-lg animate-check">✓</span>
            ) : (
              <span className="text-lg">○</span>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-semibold text-base leading-tight ${task.completed || justCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
                {task.title}
              </h3>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diff.className}`}>
                  {diff.label}
                </span>
              </div>
            </div>

            {task.description && (
              <p className="text-gray-400 text-xs mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${typeConf.color}`}>
                  {typeConf.icon} {typeConf.label}
                </span>
                {task.streak > 0 && (
                  <span className="text-xs text-orange-400 font-semibold">
                    🔥 {task.streak}
                  </span>
                )}
                {task.dueDate && (
                  <span className="text-xs text-gray-500">
                    📆 {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-gold font-semibold">+{task.xpReward} XP</span>
                <span className="text-xs text-yellow-500 font-semibold">+{task.goldReward}💰</span>
                <button
                  onClick={handleDelete}
                  className="text-gray-600 hover:text-red-400 transition-colors text-sm ml-1"
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
