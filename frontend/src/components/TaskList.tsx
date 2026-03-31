import { useState } from 'react';
import type { Task, ResourceType } from '../types';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';

interface TaskListProps {
  tasks: Task[];
  type?: 'DAILY' | 'TODO' | 'HABIT';
  isLoading?: boolean;
  onXpGained?: (xp: number, gold: number, resourceType: ResourceType, resourceGained: number) => void;
}

export default function TaskList({ tasks, type, isLoading, onXpGained }: TaskListProps) {
  const [showModal, setShowModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  if (isLoading) {
    return (
      <div className="px-4 py-8 flex flex-col items-center justify-center gap-3">
        <div className="text-4xl animate-spin">⚔️</div>
        <p className="text-gray-400">Loading quests...</p>
      </div>
    );
  }

  return (
    <div className="px-4">
      {activeTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-4 text-center">
          <div className="text-6xl">🏆</div>
          <h3 className="text-white font-bold text-lg">No quests yet!</h3>
          <p className="text-gray-400 text-sm max-w-xs">
            Tap the <span className="text-brand-gold font-bold">+</span> button to add your first quest and start earning XP!
          </p>
        </div>
      ) : (
        <>
          {activeTasks.map((task) => (
            <TaskCard key={task.id} task={task} onXpGained={onXpGained} />
          ))}

          {completedTasks.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-3"
              >
                <span>{showCompleted ? '▼' : '▶'}</span>
                <span>Completed ({completedTasks.length})</span>
              </button>
              {showCompleted && completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onXpGained={onXpGained} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-brand-purple hover:bg-purple-500 rounded-full shadow-2xl shadow-purple-900/60 flex items-center justify-center text-2xl text-white transition-all duration-200 active:scale-90 z-30"
      >
        +
      </button>

      {showModal && (
        <AddTaskModal
          defaultType={type}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
