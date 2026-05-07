import { useState } from "react";
import { useFinanceStats } from "@/hooks/useFinanceStats";
import { useFinanceStore, type CurrencyCode, type GoalItem as StoreGoalItem, type FinanceState } from "@/lib/finance-store";
import { formatCurrency, formatNumber, formatMonth } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";

interface GoalProgressItem extends StoreGoalItem {
  current: number;
  assetLabel: string;
  percentage: number;
}

// Isolated Sub-component for individual goal management
const GoalItem = ({
  goal,
  store,
  displayCurrency
}: {
  goal: GoalProgressItem,
  store: FinanceState,
  displayCurrency: CurrencyCode
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleTransaction = (type: 'add' | 'remove') => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val <= 0) return;

    if (type === 'add') store.allocateToGoal(goal.id, val);
    if (type === 'remove') store.withdrawFromGoal(goal.id, val);

    setInputValue('');
  };

  return (
    <div className="space-y-4 group border-b border-slate-200 pb-6 last:border-0">
      <div className="flex justify-between items-start gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <span className="text-xs sm:text-sm font-bold uppercase truncate block tracking-widest text-slate-800">{goal.label}</span>
          <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold font-mono uppercase tracking-tighter truncate block mt-1">
            TARGET: {formatMonth(goal.deadline)} // SOURCE: {goal.assetLabel}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className={`text-base sm:text-lg font-black font-mono ${goal.percentage >= 100 ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {formatNumber(goal.percentage)}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <ProgressBar percentage={goal.percentage} color={goal.percentage >= 100 ? 'emerald' : 'indigo'} />
        <div className="flex justify-between text-[9px] sm:text-[10px] font-mono font-bold text-slate-400 uppercase">
          <span>{formatCurrency(goal.current, displayCurrency)}</span>
          <span>{formatCurrency(goal.targetAmount, displayCurrency)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-sm overflow-hidden p-1">
          <button
            onClick={() => handleTransaction('remove')}
            className="text-rose-600 hover:bg-rose-50 px-1.5 sm:px-2 py-1 transition-colors shrink-0"
            title="Withdraw Funds"
          >
            <span className="material-symbols-outlined text-xs sm:text-sm font-black">remove</span>
          </button>
          <input
            type="number"
            placeholder="0.00"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTransaction('add');
            }}
            className="flex-1 bg-transparent outline-none text-[10px] sm:text-[11px] font-bold text-center font-mono text-slate-800 placeholder:text-slate-300 min-w-0"
          />
          <button
            onClick={() => handleTransaction('add')}
            className="text-emerald-600 hover:bg-emerald-50 px-1.5 sm:px-2 py-1 transition-colors shrink-0"
            title="Save Funds"
          >
            <span className="material-symbols-outlined text-xs sm:text-sm font-black">add</span>
          </button>
        </div>
        <button 
          onClick={() => {
            if (window.confirm(`Are you sure you want to abort mission "${goal.label}"? Funds already saved will remain in their source assets.`)) {
              store.removeGoal(goal.id);
            }
          }} 
          className="text-slate-300 hover:text-rose-600 p-1 transition-all shrink-0"
          title="Abort Mission"
        >
          <span className="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    </div>
  );
};

export const GoalTracker = ({ onAddMission }: { onAddMission?: () => void }) => {
  const { stats, displayCurrency } = useFinanceStats();
  const store = useFinanceStore();

  return (
    <section className="card-blueprint p-4 sm:p-6 md:p-8 space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-indigo-600 bg-indigo-50 p-2 rounded-sm text-lg sm:text-xl">target</span>
          <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-slate-800">Active Missions</h2>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8 max-h-[500px] sm:max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200">
        {stats.goalProgress.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <EmptyState icon="flag" message="NO ACTIVE MISSIONS // STATUS IDLE" />
            {onAddMission && (
              <button
                onClick={onAddMission}
                className="blueprint-btn-primary px-4 sm:px-8 py-3 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">add_circle</span>
                INITIALIZE MISSION
              </button>
            )}
          </div>
        ) : (
          stats.goalProgress.map(goal => (
            <GoalItem
              key={goal.id}
              goal={goal}
              store={store}
              displayCurrency={displayCurrency}
            />
          ))
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono uppercase tracking-widest text-center italic">
          Funds Movement Only // Internal Ledger Authorized
        </p>
      </div>
    </section>
  );
};
