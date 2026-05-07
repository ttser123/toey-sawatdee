export const EmptyState = ({ 
  icon, 
  message 
}: { 
  icon: string, 
  message: string 
}) => (
  <div className="border-2 border-dashed border-slate-300 rounded-sm p-8 text-center bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center text-slate-400 gap-2">
    <span className="material-symbols-outlined text-4xl text-slate-300">{icon}</span>
    <p className="text-sm font-mono">{message}</p>
  </div>
);
