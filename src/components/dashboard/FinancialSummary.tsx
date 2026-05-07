import { useFinanceStats } from "@/hooks/useFinanceStats";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const FinancialSummary = () => {
  const { stats, displayCurrency } = useFinanceStats();
  const isCritical = stats.runway < 6;

  return (
    <section className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500`}>
      {/* AVAILABLE ASSETS */}
      <div className="card-blueprint p-4 sm:p-6 flex flex-col justify-center border-l-4 border-l-indigo-600">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <span className="material-symbols-outlined text-sm">payments</span>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em]">Available Assets // Bullet Count</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black font-mono tracking-tighter text-slate-800">
            {formatCurrency(stats.availableAssets, displayCurrency)}
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Liquid Reserve</span>
        </div>
      </div>

      {/* EMERGENCY RUNWAY */}
      <div className={`card-blueprint p-4 sm:p-6 flex flex-col justify-center border-l-4 transition-colors duration-300 ${
        isCritical 
          ? 'border-l-rose-600 bg-rose-50 animate-pulse' 
          : 'border-l-emerald-500'
      }`}>
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <span className={`material-symbols-outlined text-sm ${isCritical ? 'text-rose-600' : ''}`}>
            {isCritical ? 'warning' : 'timer'}
          </span>
          <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] ${isCritical ? 'text-rose-600' : ''}`}>
            Emergency Runway // Survival Horizon
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tighter ${isCritical ? 'text-rose-700' : 'text-slate-800'}`}>
            {stats.breakdown.necessity > 0 ? formatNumber(stats.runway) : 'N/A'}
          </span>
          <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${isCritical ? 'text-rose-600' : 'text-slate-400'}`}>
            {stats.breakdown.necessity > 0 ? 'Months Remaining' : 'Waiting for Expenses'}
          </span>
        </div>
      </div>
    </section>
  );
};

