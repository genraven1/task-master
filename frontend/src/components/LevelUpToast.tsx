import { useEffect, useState } from 'react';

interface LevelUpToastProps {
  level: number;
  onClose: () => void;
}

export default function LevelUpToast({ level, onClose }: LevelUpToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-gradient-to-r from-purple-700 to-brand-purple border-2 border-brand-gold rounded-2xl px-6 py-4 shadow-2xl shadow-purple-900/50 text-center min-w-[260px]">
        <div className="text-3xl mb-1">🎉⚔️🎉</div>
        <div className="text-brand-gold font-bold text-lg">LEVEL UP!</div>
        <div className="text-white font-semibold">You reached Level {level}!</div>
        <div className="text-gray-300 text-sm mt-1">Keep conquering your quests!</div>
      </div>
    </div>
  );
}
