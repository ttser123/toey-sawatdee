import { useState } from 'react';
import { useFinanceStore } from '@/lib/finance-store';
import { formatCurrency } from '@/lib/utils';

export const GoalForm = () => {
  const store = useFinanceStore();
  const [form, setForm] = useState({ label: '', target: '', deadline: store.viewMonth, assetId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.target || !form.assetId) return;
    store.addGoal({ 
      label: form.label, 
      targetAmount: parseFloat(form.target), 
      deadline: form.deadline, 
      linkedAssetId: form.assetId 
    });
    setForm({ label: '', target: '', deadline: store.viewMonth, assetId: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 70% LEDGER */}
      <div className="w-full lg:w-[70%] card-blueprint p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm font-mono">
            <span className="material-symbols-outlined bg-slate-100 p-1.5 text-slate-600 rounded-sm text-lg">flag</span>
            Mission_Ledger // Long_Term_Targets
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total_Missions: {store.goals.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-3 pl-2">Mission_Label</th>
                <th className="pb-3 text-center">Deadline</th>
                <th className="pb-3 text-center">Source_Asset</th>
                <th className="pb-3 text-right">Target_Amount</th>
                <th className="pb-3 text-right pr-2 w-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {store.goals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 uppercase italic">Ledger_Empty // Mission_Status_Idle</td>
                </tr>
              ) : (
                store.goals.map(goal => {
                  const asset = store.assets.find(a => a.id === goal.linkedAssetId);
                  return (
                    <tr key={goal.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-700">{goal.label}</td>
                      <td className="py-3 text-center text-slate-500 font-bold uppercase">{goal.deadline}</td>
                      <td className="py-3 text-center">
                        <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase">
                          {asset?.label || 'UNKNOWN_SOURCE'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-black text-indigo-600">{formatCurrency(goal.targetAmount, store.displayCurrency)}</td>
                      <td className="py-3 text-right pr-2">
                        <button onClick={() => store.removeGoal(goal.id)} className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
                          <span className="material-symbols-outlined text-sm">delete_forever</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 30% ADD FORM */}
      <div className="w-full lg:w-[30%] card-blueprint p-6 space-y-6 bg-slate-50/50 border-dashed">
        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs font-mono">
          <span className="material-symbols-outlined text-sm">add_box</span>
          Define_New_Mission
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mission_Label</label>
            <input required type="text" placeholder="e.g. Melbourne Trip, New PC" className="blueprint-input w-full" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Target_Value</label>
            <input required type="number" step="0.01" placeholder="0.00" className="blueprint-input w-full font-mono text-center" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Mission_Deadline</label>
            <input required type="month" className="blueprint-input w-full font-mono" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Linked_Asset_Source</label>
            <select required className="blueprint-input w-full font-mono text-[10px] font-black" value={form.assetId} onChange={e => setForm({ ...form, assetId: e.target.value })}>
              <option value="" disabled>SELECT_ACCOUNT...</option>
              {store.assets.map(a => <option key={a.id} value={a.id}>{a.label.toUpperCase()}</option>)}
            </select>
          </div>

          <button className="blueprint-btn-primary w-full py-3 text-[10px] tracking-widest">+ EXECUTE_MISSION</button>
        </form>
        
        <div className="p-4 bg-white rounded-sm border border-slate-200">
          <p className="text-[9px] text-slate-400 font-mono leading-relaxed uppercase">
            Guideline: Every mission must be linked to a physical asset. This ensures you are not "planning" with money that doesn't exist.
          </p>
        </div>
      </div>
    </div>
  );
};
