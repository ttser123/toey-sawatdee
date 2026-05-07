import { useState } from 'react';
import { useFinanceStore } from '@/lib/finance-store';
import { formatCurrency } from '@/lib/utils';

export const AssetForm = () => {
  const store = useFinanceStore();
  const [form, setForm] = useState({ label: '', amount: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label || !form.amount) return;
    store.addAsset({ label: form.label, amount: parseFloat(form.amount) });
    setForm({ label: '', amount: '' });
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
                <th className="pb-3 text-right pr-2 w-10">Actions</th>
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
                    <td className="py-3 pl-2 font-bold text-slate-700">{a.label}</td>
                    <td className="py-3 text-right font-black text-indigo-600">{formatCurrency(a.amount, store.displayCurrency)}</td>
                    <td className="py-3 text-right pr-2">
                      <button onClick={() => store.removeAsset(a.id)} className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
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
          Initialize_New_Asset
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Asset_Name</label>
            <input required type="text" placeholder="e.g. Main Bank Account" className="blueprint-input w-full" value={form.label} onChange={e => setForm({ ...form, label: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Initial_Balance</label>
            <input required type="number" step="0.01" placeholder="0.00" className="blueprint-input w-full font-mono" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <button className="blueprint-btn-primary w-full py-3 text-[10px]">+ COMMIT_TO_LEDGER</button>
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
