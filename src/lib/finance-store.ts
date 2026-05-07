// src/lib/finance-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Category = 'necessity' | 'want' | 'savings';
export type Frequency = 'monthly' | 'one-time' | 'yearly';
export type CurrencyCode = 'THB' | 'AUD' | 'USD' | 'EUR';

export interface FinanceItem {
  id: string;
  label: string;
  amount: number;
  date: string;
  targetMonth?: string;
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

export interface FinanceState {
  version: number;
  assets: FinanceItem[];
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  goals: GoalItem[]; // เพิ่มตัวนี้
  displayCurrency: CurrencyCode;
  viewMonth: string;

  addAsset: (item: { label: string; amount: number }) => void;
  updateAsset: (id: string, updates: { label?: string; amount?: number }) => void;
  removeAsset: (id: string) => void;
  addIncome: (item: { label: string; amount: number; frequency: Frequency; targetMonth?: string }) => void;
  updateIncome: (id: string, updates: Partial<IncomeItem>) => void;
  removeIncome: (id: string) => void;
  addExpense: (item: { label: string; amount: number; category: Category; frequency: Frequency; targetMonth?: string }) => void;
  updateExpense: (id: string, updates: Partial<ExpenseItem>) => void;
  removeExpense: (id: string) => void;

  addGoal: (goal: Omit<GoalItem, 'id' | 'createdAt' | 'savedAmount'>) => void;
  updateGoal: (id: string, updates: Partial<GoalItem>) => void;
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
      updateAsset: (id, updates) => set((state) => ({
        assets: state.assets.map((a) => a.id === id ? { ...a, ...updates, date: new Date().toISOString() } : a)
      })),
      removeAsset: (id) => set((state) => ({
        assets: state.assets.filter((i) => i.id !== id)
      })),
      addIncome: (item) => set((state) => ({
        incomes: [...state.incomes, { ...item, id: crypto.randomUUID(), date: new Date().toISOString() }]
      })),
      updateIncome: (id, updates) => set((state) => ({
        incomes: state.incomes.map((i) => i.id === id ? { ...i, ...updates } : i)
      })),
      removeIncome: (id) => set((state) => ({
        incomes: state.incomes.filter((i) => i.id !== id)
      })),
      addExpense: (item) => set((state) => ({
        expenses: [...state.expenses, { ...item, id: crypto.randomUUID(), date: new Date().toISOString() }]
      })),
      updateExpense: (id, updates) => set((state) => ({
        expenses: state.expenses.map((e) => e.id === id ? { ...e, ...updates } : e)
      })),
      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter((i) => i.id !== id)
      })),
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, { ...goal, id: crypto.randomUUID(), savedAmount: 0, createdAt: new Date().toISOString() }]
      })),
      updateGoal: (id, updates) => set((state) => ({
        goals: state.goals.map((g) => g.id === id ? { ...g, ...updates } : g)
      })),
      removeGoal: (id) => set((state) => ({
        goals: state.goals.filter((g) => g.id !== id)
      })),
      allocateToGoal: (id, amount) => set((state) => {
        const goal = state.goals.find(g => g.id === id);
        if (!goal) return state;

        const assetIndex = state.assets.findIndex(a => a.id === goal.linkedAssetId);
        if (assetIndex === -1) return state;

        const asset = state.assets[assetIndex];
        if (asset.amount < amount) {
          console.warn('Insufficient funds in linked asset');
          return state;
        }

        const newAssets = [...state.assets];
        newAssets[assetIndex] = { ...asset, amount: asset.amount - amount };

        return {
          assets: newAssets,
          goals: state.goals.map((g) => g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g)
        };
      }),
      withdrawFromGoal: (id, amount) => set((state) => {
        const goal = state.goals.find(g => g.id === id);
        if (!goal) return state;

        if (goal.savedAmount < amount) {
          console.warn('Insufficient funds in goal');
          return state;
        }

        const assetIndex = state.assets.findIndex(a => a.id === goal.linkedAssetId);
        if (assetIndex === -1) return state;

        const asset = state.assets[assetIndex];
        const newAssets = [...state.assets];
        newAssets[assetIndex] = { ...asset, amount: asset.amount + amount };

        return {
          assets: newAssets,
          goals: state.goals.map((g) => g.id === id ? { ...g, savedAmount: g.savedAmount - amount } : g)
        };
      }),
      setDisplayCurrency: (currency) => set({ displayCurrency: currency }),
      setViewMonth: (month) => set({ viewMonth: month }),
    }),
    {
      name: 'finance-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
