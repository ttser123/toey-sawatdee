'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useFinanceStore, type CurrencyCode } from '@/lib/finance-store';
import { formatMonth, getCurrentMonth } from '@/lib/utils';

interface HudHeaderProps {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  children?: React.ReactNode;
}

export default function HudHeader({
  title,
  subtitle = 'System_Active // Data_Synced',
  statusLabel = 'ONLINE',
  children
}: HudHeaderProps) {
  const pathname = usePathname();
  const store = useFinanceStore();
  const isFinancePage = pathname === '/finance';
  const isSynced = store.viewMonth === getCurrentMonth();

  const handleMonthChange = (offset: number) => {
    const [year, month] = store.viewMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + offset, 1);
    const newMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    store.setViewMonth(newMonth);
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-300 pb-6">
      <div className="min-w-0">
        <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tighter font-mono uppercase">{title}</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-radar-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">{subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        {isFinancePage && (
          <>
            <div className="flex items-center gap-2 bg-white/70 backdrop-blur-sm p-2 rounded-sm border border-slate-300">
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono whitespace-nowrap">Currency:</span>
              <select
                className="text-xs md:text-sm font-bold outline-none border-none bg-transparent font-mono cursor-pointer"
                value={store.displayCurrency}
                onChange={(e) => store.setDisplayCurrency(e.target.value as CurrencyCode)}
              >
                {['THB', 'AUD', 'USD', 'EUR'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* TACTICAL PAGINATOR */}
            <div className="flex items-center bg-white/70 backdrop-blur-sm p-1 rounded-sm border border-slate-300">
              <button 
                onClick={() => handleMonthChange(-1)}
                className="p-1.5 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
              </button>

              <div className="px-4 text-center min-w-[110px]">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-[0.2em] leading-none mb-1">View_Period</span>
                <span 
                  onClick={() => !isSynced && store.setViewMonth(getCurrentMonth())}
                  className={`text-sm font-black font-mono uppercase leading-none block transition-all ${
                    isSynced 
                      ? 'text-slate-800' 
                      : 'text-amber-500 cursor-pointer hover:text-amber-600 hover:underline decoration-2 underline-offset-4'
                  }`}
                  title={!isSynced ? "Sync with Current Month" : undefined}
                >
                  {formatMonth(store.viewMonth)}
                </span>
              </div>

              <button 
                onClick={() => handleMonthChange(1)}
                className="p-1.5 hover:bg-slate-100 rounded-sm text-slate-500 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
              </button>
            </div>
          </>
        )}
        {children}
      </div>
    </header>
  );
}
