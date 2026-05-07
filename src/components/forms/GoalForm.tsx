import { useState } from 'react';
import { useFinanceStore } from '@/lib/finance-store';
import { formatCurrency, formatMonth } from '@/lib/utils';

export const GoalForm = () => {
  const store = useFinanceStore();
  const [form, setForm] = useState({ label: '', target: '', deadline: store.viewMonth, assetId: '' });
  const [editDraft, setEditDraft] = useState<{ id: string | null, label: string, target: string, deadline: string, assetId: string }>({
    id: null,
    label: '',
    target: '',
    deadline: store.viewMonth,
    assetId: ''
  });

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

  const handleSaveEdit = () => {
    if (!editDraft.id) return;
    const cleanLabel = editDraft.label.trim();
    if (!cleanLabel) return alert("Error: Label cannot be empty.");
    const parsedAmount = parseFloat(editDraft.target);
    if (isNaN(parsedAmount)) return alert("Error: Invalid target amount.");

    store.updateGoal(editDraft.id, {
      label: cleanLabel,
      targetAmount: parsedAmount,
      deadline: editDraft.deadline,
      linkedAssetId: editDraft.assetId
    });
    setEditDraft({ id: null, label: '', target: '', deadline: store.viewMonth, assetId: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
      {/* 70% LEDGER */}
      <div className="w-full lg:w-[70%] card-blueprint p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs sm:text-sm font-mono">
            <span className="material-symbols-outlined bg-slate-100 p-1.5 text-slate-600 rounded-sm text-lg">flag</span>
            Mission_Ledger // Long_Term_Targets
          </h3>
          <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase font-mono">Total_Missions: {store.goals.length}</span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-left font-mono text-[10px] sm:text-[11px] min-w-[550px]">
            <thead>
              <tr className="text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-3 pl-2">Mission_Label</th>
                <th className="pb-3 text-center">Deadline</th>
                <th className="pb-3 text-center">Source_Asset</th>
                <th className="pb-3 text-right">Target_Amount</th>
                <th className="pb-3 text-right pr-2 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {store.goals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 uppercase italic text-[9px] sm:text-[11px]">Ledger_Empty // Mission_Status_Idle</td>
                </tr>
              ) : (
                store.goals.map(goal => {
                  const asset = store.assets.find(a => a.id === goal.linkedAssetId);

                  return (
                    <tr key={goal.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pl-2 font-bold text-slate-700">
                        {editDraft.id === goal.id ? (
                          <input type="text" className="blueprint-input py-1 px-2 w-full text-[10px] sm:text-[11px] font-bold" value={editDraft.label} onChange={e => setEditDraft({ ...editDraft, label: e.target.value })} />
                        ) : goal.label}
                      </td>
                      <td className="py-3 text-center">
                        {editDraft.id === goal.id ? (
                          <div className="flex items-center bg-white border border-slate-200 rounded-sm overflow-hidden h-7">
                            <button type="button" onClick={() => {
                              const [year, month] = editDraft.deadline.split('-').map(Number);
                              const date = new Date(year, month - 2, 1);
                              setEditDraft({ ...editDraft, deadline: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
                            }} className="px-1 hover:bg-slate-50 text-slate-400 h-full flex items-center justify-center border-r border-slate-100">
                              <span className="material-symbols-outlined text-[12px] font-black">chevron_left</span>
                            </button>
                            <span className="text-[9px] font-black font-mono text-slate-700 uppercase px-1">{formatMonth(editDraft.deadline)}</span>
                            <button type="button" onClick={() => {
                              const [year, month] = editDraft.deadline.split('-').map(Number);
                              const date = new Date(year, month, 1);
                              setEditDraft({ ...editDraft, deadline: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
                            }} className="px-1 hover:bg-slate-50 text-slate-400 h-full flex items-center justify-center border-l border-slate-100">
                              <span className="material-symbols-outlined text-[12px] font-black">chevron_right</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-bold uppercase">{formatMonth(goal.deadline)}</span>
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {editDraft.id === goal.id ? (
                          <select className="blueprint-input py-1 px-2 w-24 text-[9px] font-black" value={editDraft.assetId} onChange={e => setEditDraft({ ...editDraft, assetId: e.target.value })}>
                            <option value="" disabled>Select account...</option>
                            {store.assets.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                          </select>
                        ) : (
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase">
                            {asset?.label || 'UNKNOWN_SOURCE'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-black text-indigo-600">
                        {editDraft.id === goal.id ? (
                          <input type="number" step="0.01" className="blueprint-input py-1 px-2 w-24 text-[10px] sm:text-[11px] font-black text-right" value={editDraft.target} onChange={e => setEditDraft({ ...editDraft, target: e.target.value })} />
                        ) : formatCurrency(goal.targetAmount, store.displayCurrency)}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <div className="flex justify-end gap-2 sm:gap-3">
                          {editDraft.id === goal.id ? (
                            <>
                              <button onClick={handleSaveEdit} className="text-emerald-600 hover:text-emerald-700 transition-all"><span className="material-symbols-outlined text-sm font-black">check</span></button>
                              <button onClick={() => setEditDraft({ id: null, label: '', target: '', deadline: store.viewMonth, assetId: '' })} className="text-slate-400 hover:text-slate-600 transition-all"><span className="material-symbols-outlined text-sm font-black">close</span></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => setEditDraft({ id: goal.id, label: goal.label, target: goal.targetAmount.toString(), deadline: goal.deadline, assetId: goal.linkedAssetId })} className="text-slate-300 hover:text-indigo-600 transition-all"><span className="material-symbols-outlined text-sm sm:text-base">edit_note</span></button>
                              <button onClick={() => { if (window.confirm(`Are you sure you want to delete mission "${goal.label}"?`)) store.removeGoal(goal.id); }} className="text-slate-300 hover:text-rose-600 transition-all"><span className="material-symbols-outlined text-sm sm:text-base">delete_forever</span></button>
                            </>
                          )}
                        </div>
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
      <div className="w-full lg:w-[30%] card-blueprint p-4 sm:p-6 space-y-6 bg-slate-50/50 border-dashed">
        <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-[10px] sm:text-xs font-mono">
          <span className="material-symbols-outlined text-sm">add_box</span>
          Define_New_Mission
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Mission_Label</label>
            <input required type="text" placeholder="e.g. Melbourne Trip, New PC" className="blueprint-input w-full text-xs" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Target_Value</label>
            <input required type="number" step="0.01" placeholder="0.00" className="blueprint-input w-full font-mono text-xs text-center" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Mission_Deadline</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-sm overflow-hidden h-9 sm:h-[42px]">
              <button type="button" onClick={() => {
                const [year, month] = form.deadline.split('-').map(Number);
                const date = new Date(year, month - 2, 1);
                setForm({ ...form, deadline: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
              }} className="px-2 sm:px-3 hover:bg-slate-50 text-slate-400 transition-colors h-full flex items-center justify-center border-r border-slate-100">
                <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
              </button>
              <div className="flex-1 text-center">
                <span className="text-[10px] sm:text-[11px] font-black font-mono text-slate-700 uppercase">{formatMonth(form.deadline)}</span>
              </div>
              <button type="button" onClick={() => {
                const [year, month] = form.deadline.split('-').map(Number);
                const date = new Date(year, month, 1);
                setForm({ ...form, deadline: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` });
              }} className="px-2 sm:px-3 hover:bg-slate-50 text-slate-400 transition-colors h-full flex items-center justify-center border-l border-slate-100">
                <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase ml-1">Linked_Asset_Source</label>
            <select required className="blueprint-input w-full font-mono text-[9px] sm:text-[10px]" value={form.assetId} onChange={e => setForm({ ...form, assetId: e.target.value })}>
              <option value="" disabled>Select account...</option>
              {store.assets.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <button className="blueprint-btn-primary w-full py-3 text-[9px] sm:text-[10px] tracking-widest">+ EXECUTE_MISSION</button>
        </form>
        <div className="p-3 sm:p-4 bg-white rounded-sm border border-slate-200">
          <p className="text-[8px] sm:text-[9px] text-slate-400 font-mono leading-relaxed uppercase">
            Guideline: Every mission must be linked to a physical asset. This ensures you are not "planning" with money that doesn't exist.
          </p>
        </div>
      </div>
    </div>
  );
};
