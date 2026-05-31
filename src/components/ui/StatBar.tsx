interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: string;
}

export function StatBar({ label, value, max = 100, color, icon }: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100);
  const barColor = color ?? (pct >= 85 ? '#22c55e' : pct >= 70 ? '#eab308' : '#ef4444');

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400 flex items-center gap-1">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className="text-xs font-bold text-white">{value}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}
