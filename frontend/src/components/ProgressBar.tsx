interface ProgressBarProps {
  value: number;
  max: number;
  color?: 'gold' | 'red' | 'green' | 'purple';
  showText?: boolean;
  label?: string;
  className?: string;
}

export default function ProgressBar({ value, max, color = 'purple', showText = false, label, className = '' }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const colorClasses = {
    gold: 'bg-gradient-to-r from-yellow-600 to-brand-gold',
    red: 'bg-gradient-to-r from-red-700 to-red-500',
    green: 'bg-gradient-to-r from-green-700 to-green-500',
    purple: 'bg-gradient-to-r from-purple-700 to-brand-purple',
  };

  const bgClasses = {
    gold: 'bg-yellow-950/50',
    red: 'bg-red-950/50',
    green: 'bg-green-950/50',
    purple: 'bg-purple-950/50',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showText) && (
        <div className="flex justify-between items-center mb-1">
          {label && <span className="text-xs text-gray-400 font-medium">{label}</span>}
          {showText && (
            <span className="text-xs text-gray-300 font-mono">
              {value.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <div className={`w-full h-3 rounded-full ${bgClasses[color]} overflow-hidden`}>
        <div
          className={`h-full rounded-full ${colorClasses[color]} transition-all duration-500 ease-out shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
