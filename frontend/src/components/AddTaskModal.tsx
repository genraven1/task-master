import { useState } from 'react';
import { useCreateTask } from '../hooks/useTasks';
import type { CreateTaskRequest } from '../types';

interface AddTaskModalProps {
  defaultType?: 'DAILY' | 'TODO' | 'HABIT';
  onClose: () => void;
}

export default function AddTaskModal({ defaultType = 'TODO', onClose }: AddTaskModalProps) {
  const [form, setForm] = useState<CreateTaskRequest>({
    title: '',
    description: '',
    type: defaultType,
    difficulty: 'EASY',
    dueDate: '',
    tags: '',
  });
  const [error, setError] = useState('');
  const createTask = useCreateTask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    try {
      const payload: CreateTaskRequest = {
        title: form.title.trim(),
        type: form.type,
        difficulty: form.difficulty,
      };
      if (form.description?.trim()) payload.description = form.description.trim();
      if (form.dueDate) payload.dueDate = form.dueDate;
      if (form.tags?.trim()) payload.tags = form.tags.trim();

      await createTask.mutateAsync(payload);
      onClose();
    } catch (err) {
      setError('Failed to create task. Please try again.');
    }
  };

  const difficultyOptions: Array<{ value: CreateTaskRequest['difficulty']; label: string; color: string }> = [
    { value: 'EASY', label: '⭐ Easy', color: 'border-green-600 text-green-400' },
    { value: 'MEDIUM', label: '⭐⭐ Medium', color: 'border-yellow-600 text-yellow-400' },
    { value: 'HARD', label: '⭐⭐⭐ Hard', color: 'border-orange-600 text-orange-400' },
    { value: 'EPIC', label: '⭐⭐⭐⭐ Epic', color: 'border-red-600 text-red-400' },
  ];

  const typeOptions: Array<{ value: CreateTaskRequest['type']; label: string; icon: string }> = [
    { value: 'DAILY', label: 'Daily', icon: '📅' },
    { value: 'TODO', label: 'Todo', icon: '✅' },
    { value: 'HABIT', label: 'Habit', icon: '🔄' },
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-brand-darker w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-purple-800/50 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-purple-900/30">
          <h2 className="text-white font-bold text-lg">⚔️ New Quest</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Quest Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What will you conquer?"
              className="input-field"
              maxLength={100}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional details..."
              className="input-field resize-none"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Quest Type</label>
            <div className="grid grid-cols-3 gap-2">
              {typeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: opt.value })}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    form.type === opt.value
                      ? 'bg-brand-purple border-brand-purple text-white'
                      : 'border-purple-800/50 text-gray-400 hover:border-purple-600'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
            <div className="grid grid-cols-2 gap-2">
              {difficultyOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm({ ...form, difficulty: opt.value })}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    form.difficulty === opt.value
                      ? `bg-brand-card ${opt.color}`
                      : 'border-purple-800/50 text-gray-500 hover:border-purple-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {form.type === 'TODO' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Due Date</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="input-field"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="health, work, learning..."
              className="input-field"
            />
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-2.5 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-purple-800/50 text-gray-400 hover:text-white hover:border-purple-600 transition-all font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTask.isPending}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {createTask.isPending ? '⌛ Adding...' : '⚔️ Add Quest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
