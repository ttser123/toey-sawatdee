import { useFinanceStats } from "@/hooks/useFinanceStats";
import { formatNumber, formatCurrency } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";

export const RuleValidation = () => {
  const { stats, displayCurrency } = useFinanceStats();

  const getPercentage = (val: number) => stats.monthlyIncome > 0 ? (val / stats.monthlyIncome) * 100 : 0;
  const necP = getPercentage(stats.breakdown.necessity);
  const wantP = getPercentage(stats.breakdown.want);
  const saveP = getPercentage(stats.breakdown.savings);

  const rules = [
    { 
      label: 'NECESSITIES (50%)', 
      val: necP, 
      amount: stats.breakdown.necessity,
      max: 50, 
      color: necP > 50 ? 'rose' : 'slate', 
      desc: 'Survival_Protocol // Housing_Bills_Food' 
    },
    { 
      label: 'WANTS (30%)', 
      val: wantP, 
      amount: stats.breakdown.want,
      max: 30, 
      color: wantP > 30 ? 'rose' : 'indigo', 
      desc: 'Lifestyle_Buffer // Hobbies_Joy' 
    },
    { 
      label: 'SAVINGS (20%)', 
      val: saveP, 
      amount: stats.breakdown.savings,
      min: 20, 
      color: saveP < 20 ? 'amber' : 'emerald', 
      desc: 'Wealth_Accumulation // Investments_Debt' 
    }
  ];

  return (
    <section className="card-blueprint p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-800">
          <span className="material-symbols-outlined bg-slate-100 p-2 text-slate-600 rounded-sm">analytics</span>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-800">50_30_20_Protocol</h2>
        </div>
        <div className="sm:text-right">
          <span className="text-[9px] sm:text-[10px] font-black text-slate-400 block uppercase tracking-widest">Monthly_Fuel_Level</span>
          <span className="text-lg sm:text-xl font-black font-mono text-indigo-600">{formatCurrency(stats.monthlyIncome, displayCurrency)}</span>
        </div>
      </div>

      <div className="space-y-8 sm:space-y-10">
        {rules.map(r => (
          <div key={r.label} className="space-y-4">
            <div className="flex justify-between items-end font-mono">
              <div className="space-y-1 min-w-0">
                <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest truncate block ${r.color === 'rose' ? 'text-rose-600' : 'text-slate-500'}`}>
                  {r.label}
                </span>
                <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono uppercase tracking-[0.1em] sm:tracking-[0.2em] truncate">{r.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-base sm:text-lg font-black block ${r.color === 'rose' ? 'text-rose-600' : 'text-slate-800'}`}>
                  {formatNumber(r.val)}%
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                  {formatCurrency(r.amount, displayCurrency)}
                </span>
              </div>
            </div>
            
            <div className="relative pt-2">
              <ProgressBar percentage={r.val} color={r.color as any} />
              {r.label.includes('WANTS') && r.val > 30 && (
                <div className="absolute -top-4 right-0">
                  <Badge variant="rose" className="animate-bounce shadow-none text-[8px] py-0.5">Gilt_Detected</Badge>
                </div>
              )}
              {r.label.includes('SAVINGS') && r.val < 20 && (
                <div className="absolute -top-4 right-0">
                  <Badge variant="amber" className="text-[8px] py-0.5">Efficiency_Low</Badge>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">System_Status</span>
        <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-sm border ${
          necP <= 50 && wantP <= 30 && saveP >= 20 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-slate-50 text-slate-600 border-slate-200'
        }`}>
          {necP <= 50 && wantP <= 30 && saveP >= 20 ? 'OPTIMIZED_ALLOCATION' : 'REBALANCING_REQUIRED'}
        </span>
      </div>
    </section>
  );
};

