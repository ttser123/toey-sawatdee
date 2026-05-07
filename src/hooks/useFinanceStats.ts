import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/finance-store';

export const useFinanceStats = () => {
  const store = useFinanceStore();
  const viewMonth = store.viewMonth;

  const stats = useMemo(() => {
    const totalAssets = store.assets.reduce((acc, curr) => acc + curr.amount, 0);

    const getItemAmount = (item: { frequency: string, amount: number, targetMonth?: string }) => {
      if (item.frequency === 'monthly') return item.amount;
      if (!item.targetMonth) return 0;
      
      // One-time: Exact match (Year and Month)
      if (item.frequency === 'one-time') {
        return item.targetMonth === viewMonth ? item.amount : 0;
      }
      
      // Yearly: Month-only match (String manipulation to compare MM)
      if (item.frequency === 'yearly') {
        return item.targetMonth.slice(-2) === viewMonth.slice(-2) ? item.amount : 0;
      }
      
      return 0;
    };

    const monthlyIncome = store.incomes.reduce((acc, curr) => acc + getItemAmount(curr), 0);

    const breakdown = { necessity: 0, want: 0, savings: 0 };
    store.expenses.forEach(e => {
      breakdown[e.category] += getItemAmount(e);
    });

    const totalReserved = store.goals.reduce((acc, goal) => acc + (goal.savedAmount || 0), 0);
    const availableAssets = totalAssets - totalReserved;
    const monthlyExpenses = breakdown.necessity + breakdown.want + breakdown.savings;
    const runway = breakdown.necessity > 0 ? totalAssets / breakdown.necessity : 0;

    const goalProgress = store.goals.map(goal => {
      const asset = store.assets.find(a => a.id === goal.linkedAssetId);
      const current = goal.savedAmount || 0;
      return {
        ...goal,
        current,
        assetLabel: asset?.label || 'Unknown',
        percentage: goal.targetAmount > 0 ? (current / goal.targetAmount) * 100 : 0
      };
    });

    return { 
      totalAssets, 
      availableAssets, 
      totalReserved, 
      monthlyIncome, 
      monthlyExpenses, 
      breakdown, 
      runway, 
      goalProgress 
    };
  }, [store.assets, store.incomes, store.expenses, store.goals, viewMonth]);

  return { stats, viewMonth, displayCurrency: store.displayCurrency };
};
