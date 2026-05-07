'use client';

import { useState, useEffect } from 'react';
import { FinancialSummary } from '@/components/dashboard/FinancialSummary';
import { GoalTracker } from '@/components/dashboard/GoalTracker';
import { RuleValidation } from '@/components/dashboard/RuleValidation';
import { AssetForm } from '@/components/forms/AssetForm';
import { IncomeForm } from '@/components/forms/IncomeForm';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { GoalForm } from '@/components/forms/GoalForm';

type RecordTab = 'assets' | 'incomes' | 'expenses' | 'goals';

export default function FinancePage() {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [activeMode, setActiveMode] = useState<'reality_check' | 'input_buffer'>('reality_check');
  const [recordTab, setRecordTab] = useState<RecordTab>('assets');

  // Hydration fix
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  if (!hasHydrated) return <div className="max-w-5xl mx-auto p-8 animate-pulse bg-blueprint h-screen" />;

  const renderInputBuffer = () => {
    const components: Record<RecordTab, React.ReactNode> = {
      assets: <AssetForm />,
      incomes: <IncomeForm />,
      expenses: <ExpenseForm />,
      goals: <GoalForm />,
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-wrap gap-2">
          {(['assets', 'incomes', 'expenses', 'goals'] as RecordTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setRecordTab(tab)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-[9px] sm:text-[10px] font-black font-mono uppercase tracking-widest border transition-all ${recordTab === tab
                  ? 'bg-slate-800 text-white border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,0.3)]'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div>
          {components[recordTab]}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* MODE SWITCHER */}
      <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {[
          { id: 'reality_check', label: 'Reality Check', icon: 'radar' },
          { id: 'input_buffer', label: 'Input Buffer', icon: 'settings_input_component' }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setActiveMode(mode.id as any)}
            className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-4 sm:px-6 py-2.5 text-[10px] sm:text-[11px] font-black font-mono uppercase tracking-widest transition-all border ${activeMode === mode.id
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.3)]'
                : 'bg-white/50 text-slate-500 border-slate-300 hover:bg-slate-100'
              }`}
          >
            <span className="material-symbols-outlined text-sm">{mode.icon}</span>
            <span className="whitespace-nowrap">[{mode.label}]</span>
          </button>
        ))}
      </nav>

      {activeMode === 'reality_check' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {/* ZONE A: TOP HUD */}
          <div className="w-full">
            <FinancialSummary />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* ZONE B: THE ARENA (60-70%) */}
            <div className="w-full lg:w-2/3">
              <RuleValidation />
            </div>

            {/* ZONE C: ACTIVE MISSIONS (30-40%) */}
            <div className="w-full lg:w-1/3">
              <GoalTracker onAddMission={() => {
                setActiveMode('input_buffer');
                setRecordTab('goals');
              }} />
            </div>
          </div>
        </div>
      ) : (
        renderInputBuffer()
      )}

      <footer className="pt-12 border-t border-slate-200">
        <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em] leading-relaxed text-center">
          Tactical Financial Interface // Ver 2.4.0 // System Ready
        </p>
      </footer>
    </div>
  );
}
