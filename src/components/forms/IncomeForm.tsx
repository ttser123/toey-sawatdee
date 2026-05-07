import { useState } from 'react';
import { useFinanceStore, type Frequency } from '@/lib/finance-store';
import { formatCurrency, formatMonth } from '@/lib/utils';

export const IncomeForm = () => {
  const store = useFinanceStore();
  const [form, setForm] = useState({ label: '', amount: '', freq: 'monthly' as Frequency, target: store.viewMonth });
  const [editDraft, setEditDraft] = useState<{ id: string | null, label: string, amount: string, freq: Frequency, target: string }>({
    id: null,
    label: '',
    amount: '',
    freq: 'monthly',
    target: store.viewMonth
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.amount) return;
    store.addIncome({ 
      label: form.label, 
      amount: parseFloat(form.amount), 
      frequency: form.freq, 
      targetMonth: (form.freq === 'one-time' || form.freq === 'yearly') ? form.target : undefined 
    });
    setForm({ ...form, label: '', amount: '' });
  };

  const handleSaveEdit = () => {
    if (!editDraft.id) return;
    const cleanLabel = editDraft.label.trim();
    if (!cleanLabel) return alert("Error: Label cannot be empty.");
    const parsedAmount = parseFloat(editDraft.amount);
    if (isNaN(parsedAmount)) return alert("Error: Invalid amount.");

    store.updateIncome(editDraft.id, {
      label: cleanLabel,
      amount: parsedAmount,
      frequency: editDraft.freq,
      targetMonth: (editDraft.freq === 'one-time' || editDraft.freq === 'yearly') ? editDraft.target : undefined
    });
    setEditDraft({ id: null, label: '', amount: '', freq: 'monthly', target: store.viewMonth });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
      {/* 70% LEDGER */}
      <div className="w-full lg:w-[70%] card-blueprint p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs sm:text-sm font-mono">
            <span className="material-symbols-outlined bg-slate-100 p-1.5 text-slate-600 rounded-sm text-lg">payments</span>
            Income_Ledger // Revenue_Streams
          </h3>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase font-mono">Active_Streams: {store.incomes.length}</span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left font-mono text-[10px] sm:text-[11px] min-w-[500px]">
            <thead>
              <tr className="text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-3 pl-2">Source_Label</th>
                <th className="pb-3 text-center">Frequency</th>
                <th className="pb-3 text-right">Value_Amount</th>
                <th className="pb-3 text-right pr-2 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {store.incomes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 uppercase italic text-[9px] sm:text-[11px]">Ledger_Empty // Waiting_for_Data</td>
                </tr>
              ) : (
                store.incomes.map(i => (
                  <tr key={i.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2 font-bold text-slate-700">
                      {editDraft.id === i.id ? (
                        <input type="text" className="blueprint-input py-1 px-2 w-full text-[10px] sm:text-[11px] font-bold" value={editDraft.label} onChange={e => setEditDraft({ ...editDraft, label: e.target.value })} />
                      ) : i.label}
                    </td>
                    <td className="py-3 text-center">
                      {editDraft.id === i.id ? (
                        <div className="flex flex-col gap-1 items-center">
                          <select className="blueprint-input py-1 px-2 w-24 text-[9px] font-black" value={editDraft.freq} onChange={e => setEditDraft({ ...editDraft, freq: e.target.value as Frequency })}>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="one-time">One-time</option>
                          </select>
                          {(editDraft.freq === 'one-time' || editDraft.freq === 'yearly') && (
                            <div className="flex items-center bg-white border border-slate-200 rounded-sm overflow-hidden h-7">
                              <button type="button" onClick={() => {
                                const [year, month] = editDraft.target.split('-').map(Number);
                                const date = new Date(year, month - 2, 1);
                                setEditDraft({ ...editDraft, target: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
                              }} className="px-1 hover:bg-slate-50 text-slate-400 h-full flex items-center justify-center border-r border-slate-100">
                                <span className="material-symbols-outlined text-[12px] font-black">chevron_left</span>
                              </button>
                              <span className="text-[9px] font-black font-mono text-slate-700 uppercase px-1">{formatMonth(editDraft.target)}</span>
                              <button type="button" onClick={() => {
                                const [year, month] = editDraft.target.split('-').map(Number);
                                const date = new Date(year, month, 1);
                                setEditDraft({ ...editDraft, target: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
                              }} className="px-1 hover:bg-slate-50 text-slate-400 h-full flex items-center justify-center border-l border-slate-100">
                                <span className="material-symbols-outlined text-[12px] font-black">chevron_right</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase ${
                          i.frequency === 'monthly' ? 'bg-indigo-50 text-indigo-600' : 
                          i.frequency === 'yearly' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {i.frequency} {i.targetMonth ? `[${formatMonth(i.targetMonth)}]` : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-black text-indigo-600">
                      {editDraft.id === i.id ? (
                        <input type="number" step="0.01" className="blueprint-input py-1 px-2 w-24 text-[10px] sm:text-[11px] font-black text-right" value={editDraft.amount} onChange={e => setEditDraft({ ...editDraft, amount: e.target.value })} />
                      ) : formatCurrency(i.amount, store.displayCurrency)}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex justify-end gap-2 sm:gap-3">
                        {editDraft.id === i.id ? (
                          <>
                            <button onClick={handleSaveEdit} className="text-emerald-600 hover:text-emerald-700 transition-all"><span className="material-symbols-outlined text-sm font-black">check</span></button>
                            <button onClick={() => setEditDraft({ id: null, label: '', amount: '', freq: 'monthly', target: store.viewMonth })} className="text-slate-400 hover:text-slate-600 transition-all"><span className="material-symbols-outlined text-sm font-black">close</span></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditDraft({ id: i.id, label: i.label, amount: i.amount.toString(), freq: i.frequency, target: i.targetMonth || store.viewMonth })} className="text-slate-300 hover:text-indigo-600 transition-all"><span className="material-symbols-outlined text-sm sm:text-base">edit_note</span></button>
                            <button onClick={() => { if (window.confirm(`Are you sure you want to delete income source "${i.label}"?`)) store.removeIncome(i.id); }} className="text-slate-300 hover:text-rose-600 transition-all"><span className="material-symbols-outlined text-sm sm:text-base">delete_forever</span></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30% ADD FORM */}
      <div className="w-full lg:w-[30%] card-blueprint p-4 sm:p-6 space-y-6 bg-slate-50/50 border-dashed">
        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] sm:text-xs font-mono">
          <span className="material-symbols-outlined text-sm">add_box</span>
          Map_New_Revenue
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Income_Source</label>
            <input required type="text" placeholder="e.g. Salary, Freelance" className="blueprint-input w-full text-xs" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Amount</label>
              <input required type="number" step="0.01" placeholder="0.00" className="blueprint-input w-full font-mono text-xs text-center" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Frequency</label>
              <select className="blueprint-input w-full font-mono text-[9px] sm:text-[10px]" value={form.freq} onChange={e => setForm({ ...form, freq: e.target.value as Frequency })}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          {(form.freq === 'one-time' || form.freq === 'yearly') && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
              <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Target_Month</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-sm overflow-hidden h-9 sm:h-[42px]">
                <button type="button" onClick={() => {
                  const [year, month] = form.target.split('-').map(Number);
                  const date = new Date(year, month - 2, 1);
                  setForm({ ...form, target: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
                }} className="px-2 sm:px-3 hover:bg-slate-50 text-slate-400 transition-colors h-full flex items-center justify-center border-r border-slate-100">
                  <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
                </button>
                <div className="flex-1 text-center">
                  <span className="text-[10px] sm:text-[11px] font-black font-mono text-slate-700 uppercase">{formatMonth(form.target)}</span>
                </div>
                <button type="button" onClick={() => {
                  const [year, month] = form.target.split('-').map(Number);
                  const date = new Date(year, month, 1);
                  setForm({ ...form, target: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
                }} className="px-2 sm:px-3 hover:bg-slate-50 text-slate-400 transition-colors h-full flex items-center justify-center border-l border-slate-100">
                  <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
                </button>
              </div>
            </div>
          )}

          <button className="blueprint-btn-primary w-full py-3 text-[9px] sm:text-[10px] tracking-widest">+ COMMIT STREAM</button>
        </form>
        <div className="p-3 sm:p-4 bg-white rounded-sm border border-slate-200">
          <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono leading-relaxed uppercase">
            Advice: Set up recurring monthly income for a stable reality check. Use "One-time" for expected bonuses or tax refunds.
          </p>
        </div>
      </div>
    </div>
  );
};
