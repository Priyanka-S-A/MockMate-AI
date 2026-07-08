import React from 'react';

/**
 * StatCard - Reusable metric display card with icon, value, label and optional trend.
 */
const StatCard = ({ title, value, subtitle, icon: Icon, color = 'gold', trend, trendLabel }) => {
  const colorMap = {
    gold: {
      bg: 'bg-gold-500/10',
      border: 'border-gold-500/20',
      icon: 'text-gold-500',
      iconBg: 'bg-gold-500/10',
      value: 'text-gold-400',
    },
    green: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      icon: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      value: 'text-emerald-400',
    },
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      icon: 'text-blue-400',
      iconBg: 'bg-blue-500/10',
      value: 'text-blue-400',
    },
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      icon: 'text-purple-400',
      iconBg: 'bg-purple-500/10',
      value: 'text-purple-400',
    },
  };

  const c = colorMap[color] || colorMap.gold;
  const isPositive = trend > 0;
  const isNeutral = trend === 0 || trend === undefined;

  return (
    <div className={`relative p-6 rounded-2xl border ${c.border} bg-neutral-950/60 backdrop-blur-sm transition-glow group overflow-hidden`}>
      {/* Subtle corner glow */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.bg} blur-2xl opacity-50 group-hover:opacity-80 transition-opacity`} />

      <div className="relative flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl ${c.iconBg} border ${c.border}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1
            ${isNeutral ? 'bg-neutral-800 text-neutral-400' : isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            <span>{isPositive ? '↑' : isNeutral ? '→' : '↓'}</span>
            <span>{Math.abs(trend)}{trendLabel || ''}</span>
          </span>
        )}
      </div>

      <div className="relative">
        <div className={`text-3xl font-extrabold tracking-tight mb-1 ${c.value}`}>{value}</div>
        <div className="text-sm font-semibold text-neutral-200">{title}</div>
        {subtitle && <div className="text-xs text-neutral-500 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
};

export default StatCard;
