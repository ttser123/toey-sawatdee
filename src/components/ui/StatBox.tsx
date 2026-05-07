import { formatCurrency } from "@/lib/utils";
import type { CurrencyCode } from "@/lib/finance-store";

export const StatBox = ({ 
  label, 
  value, 
  currency, 
  isNegative = false, 
  mono = true 
}: { 
  label: string, 
  value: number, 
  currency: CurrencyCode, 
  isNegative?: boolean, 
  mono?: boolean 
}) => (
  <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-sm overflow-hidden">
    <p className="text-[10px] md:text-[11px] text-slate-500 uppercase font-bold tracking-wider">{label}</p>
    <p className={`text-lg md:text-xl font-bold truncate ${mono ? 'font-mono' : ''} ${isNegative ? 'text-rose-600' : 'text-slate-900'}`} title={formatCurrency(value, currency)}>
      {formatCurrency(value, currency)}
    </p>
  </div>
);
