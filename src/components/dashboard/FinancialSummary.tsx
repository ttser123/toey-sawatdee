import { useFinanceStats } from "@/hooks/useFinanceStats";
import { formatCurrency, formatNumber } from "@/lib/utils";

export const FinancialSummary = () => {
  const { stats, displayCurrency } = useFinanceStats();
  const isCritical = stats.runway < 6;

  return (
    <section className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500`}>
      {/* AVAILABLE ASSETS */}
      <div className="card-blueprint p-6 flex flex-col justify-center border-l-4 border-l-indigo-600 bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <span className="material-symbols-outlined text-sm">payments</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Available_Assets // Bullet_Count</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black font-mono tracking-tighter text-slate-900">
            {formatCurrency(stats.availableAssets, displayCurrency)}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Liquid_Reserve</span>
        </div>
      </div>

      {/* EMERGENCY RUNWAY */}
      <div className={`card-blueprint p-6 flex flex-col justify-center border-l-4 transition-colors duration-300 ${
        isCritical 
          ? 'border-l-rose-600 bg-rose-50 animate-pulse' 
          : 'border-l-emerald-500 bg-white/50 backdrop-blur-sm'
      }`}>
        <div className="flex items-center gap-2 text-slate-400 mb-1">
          <span className={`material-symbols-outlined text-sm ${isCritical ? 'text-rose-600' : ''}`}>
            {isCritical ? 'warning' : 'timer'}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCritical ? 'text-rose-600' : ''}`}>
            Emergency_Runway // Survival_Horizon
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-black font-mono tracking-tighter ${isCritical ? 'text-rose-700' : 'text-slate-900'}`}>
            {formatNumber(stats.runway)}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${isCritical ? 'text-rose-600' : 'text-slate-400'}`}>
            Months_Remaining
          </span>
        </div>
      </div>
    </section>
  );
};
