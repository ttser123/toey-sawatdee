import { useFinanceStats } from "@/hooks/useFinanceStats";
import { useFinanceStore } from "@/lib/finance-store";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";

export const GoalTracker = () => {
  const { stats, displayCurrency } = useFinanceStats();
  const store = useFinanceStore();

  return (
    <section className="card-blueprint p-6 md:p-8 space-y-6 h-full bg-slate-900 text-white border-slate-800">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined bg-indigo-600 p-2 text-white rounded-sm">target</span>
        <h2 className="text-xl font-black uppercase tracking-tight font-mono">Active_Missions</h2>
      </div>

      <div className="space-y-8 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
        {stats.goalProgress.length === 0 ? (
          <EmptyState icon="flag" message="NO_ACTIVE_MISSIONS // STATUS_IDLE" className="text-slate-500" />
        ) : (
          stats.goalProgress.map(goal => (
            <div key={goal.id} className="space-y-4 group border-b border-slate-800 pb-6 last:border-0">
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-black uppercase truncate block tracking-widest">{goal.label}</span>
                  <span className="text-[9px] text-slate-500 font-bold font-mono uppercase tracking-tighter truncate block mt-1">
                    TARGET_DATE: {goal.deadline} // FUND_SOURCE: {goal.assetLabel}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-black font-mono ${goal.percentage >= 100 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                    {formatNumber(goal.percentage)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <ProgressBar percentage={goal.percentage} color={goal.percentage >= 100 ? 'emerald' : 'indigo'} />
                <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
                  <span>{formatCurrency(goal.current, displayCurrency)}</span>
                  <span>{formatCurrency(goal.targetAmount, displayCurrency)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 flex items-center bg-slate-800 border border-slate-700 rounded-sm overflow-hidden p-1">
                  <button 
                    onClick={(e) => {
                      const input = (e.currentTarget.nextElementSibling as HTMLInputElement);
                      const val = parseFloat(input.value);
                      if (!isNaN(val) && val > 0) { store.withdrawFromGoal(goal.id, val); input.value = ''; }
                    }} 
                    className="text-rose-400 hover:bg-rose-900/30 px-2 py-1 transition-colors"
                    title="Withdraw Funds"
                  >
                    <span className="material-symbols-outlined text-sm font-black">remove</span>
                  </button>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="flex-1 bg-transparent outline-none text-[11px] font-black text-center font-mono text-white placeholder:text-slate-600" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = parseFloat((e.target as HTMLInputElement).value);
                        if (!isNaN(val) && val > 0) { store.allocateToGoal(goal.id, val); (e.target as HTMLInputElement).value = ''; }
                      }
                    }} 
                  />
                  <button 
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      const val = parseFloat(input.value);
                      if (!isNaN(val) && val > 0) { store.allocateToGoal(goal.id, val); input.value = ''; }
                    }} 
                    className="text-emerald-400 hover:bg-emerald-900/30 px-2 py-1 transition-colors"
                    title="Save Funds"
                  >
                    <span className="material-symbols-outlined text-sm font-black">add</span>
                  </button>
                </div>
                <button 
                  onClick={() => store.removeGoal(goal.id)} 
                  className="text-slate-600 hover:text-rose-500 p-1 transition-all"
                  title="Abort Mission"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="pt-4 border-t border-slate-800">
        <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest text-center italic">
          Funds_Movement_Only // Internal_Ledger_Authorized
        </p>
      </div>
    </section>
  );
};
