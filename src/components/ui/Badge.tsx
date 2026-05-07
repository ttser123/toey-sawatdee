import React from 'react';

export type BadgeVariant = 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({
  children,
  variant = 'indigo',
  className = '',
  ...props
}: BadgeProps) => {

  const styles: Record<BadgeVariant, string> = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    slate: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  const baseClasses = "px-2 py-0.5 border text-[10px] font-bold font-mono rounded-sm uppercase";
  const combinedClasses = `${baseClasses} ${styles[variant]} ${className}`.trim();

  return (
    <span className={combinedClasses} {...props}>
      {children}
    </span>
  );
};