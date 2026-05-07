import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CurrencyCode } from "@/lib/finance-store"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number, currency: CurrencyCode) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'THB',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (err) {
    console.error('Currency formatting error:', err);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(amount);
  }
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: 1,
  }).format(num);
};

export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
};
