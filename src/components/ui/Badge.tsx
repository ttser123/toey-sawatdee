export const Badge = ({ 
  children, 
  variant = 'indigo' 
}: { 
  children: React.ReactNode, 
  variant?: 'indigo' | 'emerald' | 'rose' | 'amber' | 'slate' 
}) => {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    slate: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  return (
    <span className={`px-2 py-0.5 border text-[10px] font-bold font-mono rounded-sm uppercase ${styles[variant]}`}>
      {children}
    </span>
  );
};
