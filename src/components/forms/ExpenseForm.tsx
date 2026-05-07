import { useState } from 'react';
import { useFinanceStore, type Category, type Frequency } from '@/lib/finance-store';
import { formatCurrency } from '@/lib/utils';

export const ExpenseForm = () => {
  const store = useFinanceStore();
  const [form, setForm] = useState({ label: '', amount: '', cat: 'necessity' as Category, freq: 'monthly' as Frequency, target: store.viewMonth });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.amount) return;
    store.addExpense({ 
      label: form.label, 
      amount: parseFloat(form.amount), 
      category: form.cat, 
      frequency: form.freq, 
      targetMonth: (form.freq === 'one-time' || form.freq === 'yearly') ? form.target : undefined 
    });
    setForm({ ...form, label: '', amount: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 70% LEDGER */}
      <div className="w-full lg:w-[70%] card-blueprint p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm font-mono">
            <span className="material-symbols-outlined bg-slate-100 p-1.5 text-slate-600 rounded-sm text-lg">receipt_long</span>
            Expense_Ledger // Resource_Drain
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total_Logs: {store.expenses.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-3 pl-2">Expense_Label</th>
                <th className="pb-3 text-center">Category</th>
                <th className="pb-3 text-center">Frequency</th>
                <th className="pb-3 text-right">Value_Amount</th>
                <th className="pb-3 text-right pr-2 w-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {store.expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 uppercase italic">Ledger_Empty // Systems_Optimal</td>
                </tr>
              ) : (
                store.expenses.map(exp => (
                  <tr key={exp.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-700">{exp.label}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase ${
                        exp.category === 'necessity' ? 'bg-slate-100 text-slate-600' : 
                        exp.category === 'want' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 text-center text-[9px] text-slate-500 font-bold uppercase">
                      {exp.frequency} {exp.targetMonth ? `[${exp.targetMonth}]` : ''}
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">{formatCurrency(exp.amount, store.displayCurrency)}</td>
                    <td className="py-3 text-right pr-2">
                      <button onClick={() => store.removeExpense(exp.id)} className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                        <span className="material-symbols-outlined text-sm">delete_forever</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30% ADD FORM */}
      <div className="w-full lg:w-[30%] card-blueprint p-6 space-y-6 bg-slate-50/50 border-dashed">
        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs font-mono">
          <span className="material-symbols-outlined text-sm">add_box</span>
          Register_Expenditure
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Expense_Name</label>
            <input required type="text" placeholder="e.g. Rent, Netflix, Stocks" className="blueprint-input w-full" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Amount</label>
            <input required type="number" step="0.01" placeholder="0.00" className="blueprint-input w-full font-mono text-center" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Classification</label>
              <select className="blueprint-input w-full font-mono text-[10px] font-black" value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value as any })}>
                <option value="necessity">NECESSITY</option>
                <option value="want">WANT</option>
                <option value="savings">SAVINGS</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Interval</label>
              <select className="blueprint-input w-full font-mono text-[10px] font-black" value={form.freq} onChange={e => setForm({ ...form, freq: e.target.value as any })}>
                <option value="monthly">MONTHLY</option>
                <option value="yearly">YEARLY</option>
                <option value="one-time">ONE-TIME</option>
              </select>
            </div>
          </div>

          {(form.freq === 'one-time' || form.freq === 'yearly') && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Occurrence_Month</label>
              <input required type="month" className="blueprint-input w-full font-mono" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
            </div>
          )}

          <button className="blueprint-btn-primary w-full py-3 text-[10px]">+ COMMIT_TO_DRAIN</button>
        </form>
        
        <div className="p-4 bg-white rounded-sm border border-slate-200">
          <p className="text-[9px] text-slate-400 font-mono leading-relaxed uppercase">
            Rule_50_30_20: Be honest with classifications. Necessities are non-negotiable. Wants are targets for optimization.
          </p>
        </div>
      </div>
    </div>
  );
};
