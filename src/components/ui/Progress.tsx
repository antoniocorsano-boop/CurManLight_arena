
interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const variants = {
  default: 'bg-indigo-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
};

const heights = {
  sm: 'h-1.5',
  md: 'h-2.5',
};

export function Progress({ value, max = 100, variant = 'default', size = 'md', showLabel = false }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-200 rounded-full ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full transition-all ${variants[variant]}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 mt-1">{Math.round(percent)}%</span>
      )}
    </div>
  );
}
