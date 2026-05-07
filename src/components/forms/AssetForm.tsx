import { useState } from 'react';
import { useFinanceStore } from '@/lib/finance-store';
import { formatCurrency } from '@/lib/utils';

export const AssetForm = () => {
  const store = useFinanceStore();
  const [form, setForm] = useState({ label: '', amount: '' });
  const [editDraft, setEditDraft] = useState<{ id: string | null, label: string, amount: string }>({
    id: null,
    label: '',
    amount: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.amount) return;
    store.addAsset({ label: form.label, amount: parseFloat(form.amount) });
    setForm({ label: '', amount: '' });
  };

  const handleSaveEdit = () => {
    if (!editDraft.id) return;

    // Gate 1: The Ghost Trap (Empty Label)
    const cleanLabel = editDraft.label.trim();
    if (!cleanLabel) {
      alert("Error: Asset label cannot be empty.");
      return;
    }

    // Gate 2 & 3: The NaN & Negative Asset Traps
    const parsedAmount = parseFloat(editDraft.amount);
    if (isNaN(parsedAmount)) {
      alert("Error: Invalid amount entered.");
      return;
    }

    if (parsedAmount < 0) {
      alert("Error: Asset balance cannot be negative. For debts, use the Expense ledger.");
      return;
    }

    store.updateAsset(editDraft.id, {
      label: cleanLabel,
      amount: parsedAmount
    });
    setEditDraft({ id: null, label: '', amount: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* 70% LEDGER */}
      <div className="w-full lg:w-[70%] card-blueprint p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-sm font-mono">
            <span className="material-symbols-outlined bg-slate-100 p-1.5 text-slate-600 rounded-sm text-lg">database</span>
            Asset_Ledger // Current_Inventory
          </h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Total_Entries: {store.assets.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead>
              <tr className="text-slate-400 uppercase border-b border-slate-100">
                <th className="pb-3 pl-2">Asset_Label</th>
                <th className="pb-3 text-right">Value_Amount</th>
                <th className="pb-3 text-right pr-2 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {store.assets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400 uppercase italic">Ledger_Empty // Waiting_for_Data</td>
                </tr>
              ) : (
                store.assets.map(a => (
                  <tr key={a.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pl-2">
                      {editDraft.id === a.id ? (
                        <input 
                          type="text" 
                          className="blueprint-input py-1 px-2 w-full text-[11px] font-bold" 
                          value={editDraft.label} 
                          onChange={e => setEditDraft({ ...editDraft, label: e.target.value })} 
                        />
                      ) : (
                        <span className="font-bold text-slate-700">{a.label}</span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {editDraft.id === a.id ? (
                        <input 
                          type="number" 
                          step="0.01"
                          className="blueprint-input py-1 px-2 w-32 text-[11px] font-black text-right" 
                          value={editDraft.amount} 
                          onChange={e => setEditDraft({ ...editDraft, amount: e.target.value })} 
                        />
                      ) : (
                        <span className="font-black text-indigo-600">{formatCurrency(a.amount, store.displayCurrency)}</span>
                      )}
                    </td>
                    <td className="py-3 text-right pr-2">
                      <div className="flex justify-end gap-2">
                        {editDraft.id === a.id ? (
                          <>
                            <button 
                              onClick={handleSaveEdit}
                              className="text-emerald-600 hover:text-emerald-700 transition-all"
                              title="Save Changes"
                            >
                              <span className="material-symbols-outlined text-sm font-black">check</span>
                            </button>
                            <button 
                              onClick={() => setEditDraft({ id: null, label: '', amount: '' })}
                              className="text-slate-400 hover:text-slate-600 transition-all"
                              title="Cancel Edit"
                            >
                              <span className="material-symbols-outlined text-sm font-black">close</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => setEditDraft({ id: a.id, label: a.label, amount: a.amount.toString() })}
                              className="text-slate-300 hover:text-indigo-600 transition-all"
                              title="Edit Asset"
                            >
                              <span className="material-symbols-outlined text-sm">edit_note</span>
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete asset "${a.label}"? This will affect any linked goals.`)) {
                                  store.removeAsset(a.id);
                                }
                              }} 
                              className="text-slate-300 hover:text-rose-600 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">delete_forever</span>
                            </button>
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
          Initialize_New_Asset
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Asset_Name</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Main Bank Account" 
              className="blueprint-input w-full" 
              value={form.label} 
              onChange={e => setForm({ ...form, label: e.target.value })} 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Initial_Balance</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              placeholder="0.00" 
              className="blueprint-input w-full font-mono" 
              value={form.amount} 
              onChange={e => setForm({ ...form, amount: e.target.value })} 
            />
          </div>
          <button className="blueprint-btn-primary w-full py-3 text-[10px] tracking-widest">+ COMMIT_TO_LEDGER</button>
        </form>
        
        <div className="p-4 bg-white rounded-sm border border-slate-200">
          <p className="text-[9px] text-slate-400 font-mono leading-relaxed uppercase">
            Notice: Assets represent liquid or semi-liquid funds that can be allocated to goals or used for survival runway.
          </p>
        </div>
      </div>
    </div>
  );
};
