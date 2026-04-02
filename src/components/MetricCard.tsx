
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string | number;
  subValueColor?: string;
  pillText?: string;
  pillVariant?: 'default' | 'success' | 'warning' | 'danger';
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  subValue,
  subValueColor = 'text-slate-400',
  pillText, 
  pillVariant = 'default' 
}) => {
  const variantStyles = {
    default: 'bg-white/10 text-slate-300 border border-white/5',
    success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/10',
    warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/10',
    danger: 'bg-rose-500/20 text-rose-300 border border-rose-500/10',
  };

  const hasValue = value !== undefined && value !== null && value !== '';
  const hasSubValue = subValue !== undefined && subValue !== null && subValue !== '';

  return (
    <div className="group bg-white/[0.03] backdrop-blur-3xl rounded-[2rem] p-6 border border-white/10 shadow-xl flex flex-col justify-between hover:bg-white/[0.07] transition-all hover:scale-[1.03] duration-500 ring-1 ring-white/5 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-blue-500/10 transition-all"></div>
      
      <div className="text-[10px] font-black tracking-[0.2em] text-slate-500 mb-3 truncate uppercase">
        {label}
      </div>
      
      <div className="mb-4">
        <div className="text-3xl font-black text-white/95 tracking-tighter drop-shadow-sm">
          {hasValue ? value : '--'}
        </div>
        {hasSubValue && (
          <div className={`text-[12px] font-extrabold mt-1 tracking-tight flex items-center ${subValueColor}`}>
            {subValue}
          </div>
        )}
      </div>

      {pillText && (
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest inline-block self-start backdrop-blur-md uppercase ${variantStyles[pillVariant]}`}>
          {pillText}
        </div>
      )}
    </div>
  );
};
