export const ProgressBar = ({ 
  percentage, 
  color = 'indigo' 
}: { 
  percentage: number, 
  color?: 'indigo' | 'emerald' | 'rose' | 'slate' | 'amber' 
}) => {
  const colors = {
    indigo: 'bg-indigo-500',
    emerald: 'bg-emerald-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-400',
    amber: 'bg-amber-400',
  };
  return (
    <div className="h-2 w-full bg-slate-100 rounded-none overflow-hidden">
      <div
        className={`h-full transition-all duration-1000 ${colors[color]}`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
};
