import { type ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'green' | 'blue' | 'orange' | 'purple' | 'red' | 'yellow';
  change?: string;
  changeType?: 'up' | 'down';
}

const colorMap = {
  green: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400 glow-green',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/20 text-blue-400 glow-blue',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/20 text-orange-400 glow-orange',
  purple: 'from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400 glow-purple',
  red: 'from-red-500/20 to-red-600/10 border-red-500/20 text-red-400',
  yellow: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/20 text-yellow-400',
};

const iconBgMap = {
  green: 'bg-emerald-500/20',
  blue: 'bg-blue-500/20',
  orange: 'bg-orange-500/20',
  purple: 'bg-violet-500/20',
  red: 'bg-red-500/20',
  yellow: 'bg-yellow-500/20',
};

export function StatCard({ title, value, icon, color, change, changeType }: StatCardProps) {
  return (
    <div className={`glass-card p-4 lg:p-6 bg-gradient-to-br ${colorMap[color]} relative overflow-hidden`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1 lg:space-y-2 min-w-0">
          <p className="text-xs lg:text-sm font-medium text-white/50 uppercase tracking-wider">{title}</p>
          <p className="text-xl lg:text-3xl font-bold text-white truncate">{value}</p>
          {change && (
            <p className={`text-xs font-medium ${changeType === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {changeType === 'up' ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className={`p-2 lg:p-3 rounded-xl shrink-0 ${iconBgMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
