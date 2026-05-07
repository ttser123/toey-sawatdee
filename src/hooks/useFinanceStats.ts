import { useMemo } from 'react';
import { useFinanceStore } from '@/lib/finance-store';

export const useFinanceStats = () => {
  const store = useFinanceStore();
  const viewMonth = store.viewMonth;

  const stats = useMemo(() => {
    const totalAssets = store.assets.reduce((acc, curr) => acc + curr.amount, 0);
    const monthlyIncome = store.incomes.reduce((acc, curr) => {
      if (curr.frequency === 'monthly') return acc + curr.amount;
      if (curr.frequency === 'yearly') return acc + (curr.amount / 12);
      if (curr.frequency === 'one-time' && curr.targetMonth === viewMonth) return acc + curr.amount;
      return acc;
    }, 0);

    const breakdown = { necessity: 0, want: 0, savings: 0 };
    store.expenses.forEach(e => {
      let amount = 0;
      if (e.frequency === 'monthly') amount = e.amount;
      else if (e.frequency === 'yearly') amount = e.amount / 12;
      else if (e.frequency === 'one-time' && e.targetMonth === viewMonth) amount = e.amount;
      breakdown[e.category] += amount;
    });

    const totalReserved = store.goals.reduce((acc, goal) => acc + (goal.savedAmount || 0), 0);
    const availableAssets = totalAssets - totalReserved;
    const monthlyExpenses = breakdown.necessity + breakdown.want + breakdown.savings;
    const runway = breakdown.necessity > 0 ? totalAssets / breakdown.necessity : (totalAssets > 0 ? Infinity : 0);

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
