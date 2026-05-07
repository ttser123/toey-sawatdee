// src/lib/finance-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Category = 'necessity' | 'want' | 'savings';
export type Frequency = 'monthly' | 'one-time' | 'yearly';
export type CurrencyCode = 'THB' | 'AUD' | 'USD' | 'EUR'; // เพิ่ม Type นี้

export interface FinanceItem {
  id: string;
  label: string;
  amount: number;
  date: string;
  targetMonth?: string; // เพิ่มฟิลด์นี้เพื่อให้คำนวณแยกรายเดือนได้
}

export interface ExpenseItem extends FinanceItem {
  category: Category;
  frequency: Frequency;
}

export interface IncomeItem extends FinanceItem {
  frequency: Frequency;
}

// เพิ่ม Interface สำหรับเป้าหมายเงินออม
export interface GoalItem {
  id: string;
  label: string;
  targetAmount: number;
  savedAmount: number;
  deadline: string;
  linkedAssetId: string;
  createdAt: string;
}

interface FinanceState {
  version: number;
  assets: FinanceItem[];
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  goals: GoalItem[]; // เพิ่มตัวนี้
  displayCurrency: CurrencyCode;
  viewMonth: string;

  addAsset: (item: { label: string; amount: number }) => void;
  removeAsset: (id: string) => void;
  addIncome: (item: { label: string; amount: number; frequency: Frequency; targetMonth?: string }) => void;
  removeIncome: (id: string) => void;
  addExpense: (item: { label: string; amount: number; category: Category; frequency: Frequency; targetMonth?: string }) => void;
  removeExpense: (id: string) => void;

  addGoal: (goal: Omit<GoalItem, 'id' | 'createdAt' | 'savedAmount'>) => void;
  removeGoal: (id: string) => void;
  allocateToGoal: (id: string, amount: number) => void;
  withdrawFromGoal: (id: string, amount: number) => void;
  setDisplayCurrency: (currency: CurrencyCode) => void;
  setViewMonth: (month: string) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      version: 1,
      assets: [],
      incomes: [],
      expenses: [],
      goals: [],
      displayCurrency: 'THB',
      viewMonth: new Date().toISOString().slice(0, 7),

      addAsset: (item) => set((state) => ({
        assets: [...state.assets, { ...item, id: crypto.randomUUID(), date: new Date().toISOString() }]
      })),
      removeAsset: (id) => set((state) => ({
        assets: state.assets.filter((i) => i.id !== id)
      })),
      addIncome: (item) => set((state) => ({
        incomes: [...state.incomes, { ...item, id: crypto.randomUUID(), date: new Date().toISOString() }]
      })),
      removeIncome: (id) => set((state) => ({
        incomes: state.incomes.filter((i) => i.id !== id)
      })),
      addExpense: (item) => set((state) => ({
        expenses: [...state.expenses, { ...item, id: crypto.randomUUID(), date: new Date().toISOString() }]
      })),
      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((i) => i.id !== id)
      })),
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: crypto.randomUUID(), savedAmount: 0, createdAt: new Date().toISOString() }]
      })),
      removeGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
      })),
      allocateToGoal: (id, amount) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g)
      })),
      withdrawFromGoal: (id, amount) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, savedAmount: g.savedAmount - amount } : g)
      })),
      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
      setViewMonth: (month) => set({ viewMonth: month }),
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
