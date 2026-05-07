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
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
  }).format(num);
};

export const getCurrentMonth = () => {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
};

export const formatMonth = (monthStr: string) => {
  if (!monthStr) return '';
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const [year, month] = monthStr.split('-');
  const monthIndex = parseInt(month) - 1;
  return `${months[monthIndex]} ${year}`;
};

