import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  /** Tailwind gradient classes, e.g. "from-indigo-500 to-purple-600" */
  gradient?: string;
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, gradient = 'from-indigo-500 to-purple-600' }: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden bg-card border rounded-xl p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Animated gradient halo */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradient} transition-all duration-500`} />
      {/* Decorative blur blob */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl group-hover:opacity-30 transition-opacity duration-500`} />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-extrabold mt-1 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.positive ? 'text-success' : 'text-destructive'}`}>
              {trend.positive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${gradient} blur-md opacity-50 -z-10`} />
        </div>
      </div>
    </div>
  );
}
