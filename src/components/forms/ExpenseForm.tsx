import { useState } from 'react';
import { useFinanceStore, type Category, type Frequency } from '@/lib/finance-store';
import { formatCurrency, formatMonth } from '@/lib/utils';

export const ExpenseForm = () => {
  const store = useFinanceStore();
  const [form, setForm] = useState({ label: '', amount: '', cat: 'necessity' as Category, freq: 'monthly' as Frequency, target: store.viewMonth });
  const [editDraft, setEditDraft] = useState<{ id: string | null, label: string, amount: string, cat: Category, freq: Frequency, target: string }>({
    id: null,
    label: '',
    amount: '',
    cat: 'necessity',
    freq: 'monthly',
    target: store.viewMonth
  });

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

  const handleSaveEdit = () => {
    if (!editDraft.id) return;
    const cleanLabel = editDraft.label.trim();
    if (!cleanLabel) return alert("Error: Label cannot be empty.");
    const parsedAmount = parseFloat(editDraft.amount);
    if (isNaN(parsedAmount)) return alert("Error: Invalid amount.");

    store.updateExpense(editDraft.id, {
      label: cleanLabel,
      amount: parsedAmount,
      category: editDraft.cat,
      frequency: editDraft.freq,
      targetMonth: (editDraft.freq === 'one-time' || editDraft.freq === 'yearly') ? editDraft.target : undefined
    });
    setEditDraft({ id: null, label: '', amount: '', cat: 'necessity', freq: 'monthly', target: store.viewMonth });
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
                <th className="pb-3 text-right pr-2 w-24">Actions</th>
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
                    <td className="py-3 pl-2 font-bold text-slate-700">
                      {editDraft.id === exp.id ? (
                        <input type="text" className="blueprint-input py-1 px-2 w-full text-[11px] font-bold" value={editDraft.label} onChange={e => setEditDraft({ ...editDraft, label: e.target.value })} />
                      ) : exp.label}
                    </td>
                    <td className="py-3 text-center">
                      {editDraft.id === exp.id ? (
                        <select className="blueprint-input py-1 px-2 w-24 text-[9px] font-black" value={editDraft.cat} onChange={e => setEditDraft({ ...editDraft, cat: e.target.value as Category })}>
                          <option value="necessity">Necessity</option>
                          <option value="want">Want</option>
                          <option value="savings">Savings</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase ${
                          exp.category === 'necessity' ? 'bg-slate-100 text-slate-600' : 
                          exp.category === 'want' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                          {exp.category}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      {editDraft.id === exp.id ? (
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
                        <span className="text-[9px] text-slate-500 font-bold uppercase">
                          {exp.frequency} {exp.targetMonth ? `[${formatMonth(exp.targetMonth)}]` : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right font-black text-slate-900">
                      {editDraft.id === exp.id ? (
                        <input type="number" step="0.01" className="blueprint-input py-1 px-2 w-24 text-[11px] font-black text-right" value={editDraft.amount} onChange={e => setEditDraft({ ...editDraft, amount: e.target.value })} />
                      ) : formatCurrency(exp.amount, store.displayCurrency)}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex justify-end gap-2">
                        {editDraft.id === exp.id ? (
                          <>
                            <button onClick={handleSaveEdit} className="text-emerald-600 hover:text-emerald-700 transition-all"><span className="material-symbols-outlined text-sm font-black">check</span></button>
                            <button onClick={() => setEditDraft({ id: null, label: '', amount: '', cat: 'necessity', freq: 'monthly', target: store.viewMonth })} className="text-slate-400 hover:text-slate-600 transition-all"><span className="material-symbols-outlined text-sm font-black">close</span></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setEditDraft({ id: exp.id, label: exp.label, amount: exp.amount.toString(), cat: exp.category, freq: exp.frequency, target: exp.targetMonth || store.viewMonth })} className="text-slate-300 hover:text-indigo-600 transition-all"><span className="material-symbols-outlined text-sm">edit_note</span></button>
                            <button onClick={() => { if (window.confirm(`Are you sure you want to delete expense "${exp.label}"?`)) store.removeExpense(exp.id); }} className="text-slate-300 hover:text-rose-600 transition-all"><span className="material-symbols-outlined text-sm">delete_forever</span></button>
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
              <select className="blueprint-input w-full font-mono text-[10px]" value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value as Category })}>
                <option value="necessity">Necessity</option>
                <option value="want">Want</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Interval</label>
              <select className="blueprint-input w-full font-mono text-[10px]" value={form.freq} onChange={e => setForm({ ...form, freq: e.target.value as Frequency })}>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="one-time">One-time</option>
              </select>
            </div>
          </div>

          {(form.freq === 'one-time' || form.freq === 'yearly') && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-300">
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Occurrence_Month</label>
              <div className="flex items-center bg-white border border-slate-200 rounded-sm overflow-hidden h-[42px]">
                <button type="button" onClick={() => {
                  const [year, month] = form.target.split('-').map(Number);
                  const date = new Date(year, month - 2, 1);
                  setForm({ ...form, target: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
                }} className="px-3 hover:bg-slate-50 text-slate-400 transition-colors h-full flex items-center justify-center border-r border-slate-100">
                  <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
                </button>
                <div className="flex-1 text-center">
                  <span className="text-[11px] font-black font-mono text-slate-700 uppercase">{formatMonth(form.target)}</span>
                </div>
                <button type="button" onClick={() => {
                  const [year, month] = form.target.split('-').map(Number);
                  const date = new Date(year, month, 1);
                  setForm({ ...form, target: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
                }} className="px-3 hover:bg-slate-50 text-slate-400 transition-colors h-full flex items-center justify-center border-l border-slate-100">
                  <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
                </button>
              </div>
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
