import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Category, Budget, TransactionFilters } from '../types';
import { defaultCategories } from '../utils/defaultCategories';

interface DataState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  
  // Transaction actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getFilteredTransactions: (filters: TransactionFilters) => { transactions: Transaction[]; total: number };
  
  // Category actions
  addCategory: (category: Omit<Category, 'id'>) => void;
  deleteCategory: (id: string) => void;
  
  // Budget actions
  setBudget: (budget: Omit<Budget, 'id'>) => void;
  deleteBudget: (id: string) => void;
  getBudgetProgress: (categoryId: string) => { spent: number; limit: number; percentage: number };
  
  // Stats
  getStats: () => { totalIncome: number; totalExpense: number; balance: number; avgDaily: number; avgMonthly: number };
  getExpensesByCategory: () => Array<{ name: string; icon: string; amount: number; color: string }>;
  getBalanceOverTime: () => Array<{ date: string; balance: number }>;
  getTopCategories: (limit: number) => Array<{ name: string; icon: string; amount: number }>;
}

const CHART_COLORS = [
  '#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea',
  '#0891b2', '#e11d48', '#65a30d', '#ea580c', '#7c3aed',
  '#0d9488', '#be185d', '#4f46e5', '#b91c1c', '#059669',
];

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,
      budgets: [],
      
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [
            { ...transaction, id: crypto.randomUUID() },
            ...state.transactions,
          ],
        }));
      },
      
      updateTransaction: (id, data) => {
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t
          ),
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        }));
      },
      
      getFilteredTransactions: (filters) => {
        const state = get();
        let filtered = [...state.transactions];
        
        if (filters.type) {
          filtered = filtered.filter((t) => t.type === filters.type);
        }
        if (filters.categoryId) {
          filtered = filtered.filter((t) => t.categoryId === filters.categoryId);
        }
        if (filters.dateFrom) {
          filtered = filtered.filter((t) => new Date(t.date) >= new Date(filters.dateFrom!));
        }
        if (filters.dateTo) {
          filtered = filtered.filter((t) => new Date(t.date) <= new Date(filters.dateTo!));
        }
        
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const total = filtered.length;
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const start = (page - 1) * limit;
        
        return {
          transactions: filtered.slice(start, start + limit),
          total,
        };
      },
      
      addCategory: (category) => {
        set((state) => ({
          categories: [
            ...state.categories,
            { ...category, id: crypto.randomUUID() },
          ],
        }));
      },
      
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },
      
      setBudget: (budget) => {
        set((state) => {
          const existing = state.budgets.find(
            (b) => b.categoryId === budget.categoryId && b.userId === budget.userId
          );
          if (existing) {
            return {
              budgets: state.budgets.map((b) =>
                b.id === existing.id ? { ...b, limit: budget.limit } : b
              ),
            };
          }
          return {
            budgets: [...state.budgets, { ...budget, id: crypto.randomUUID() }],
          };
        });
      },
      
      deleteBudget: (id) => {
        set((state) => ({
          budgets: state.budgets.filter((b) => b.id !== id),
        }));
      },
      
      getBudgetProgress: (categoryId) => {
        const state = get();
        const budget = state.budgets.find((b) => b.categoryId === categoryId);
        if (!budget) return { spent: 0, limit: 0, percentage: 0 };
        
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const spent = state.transactions
          .filter(
            (t) =>
              t.categoryId === categoryId &&
              t.type === 'expense' &&
              new Date(t.date) >= monthStart
          )
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          spent,
          limit: budget.limit,
          percentage: budget.limit > 0 ? (spent / budget.limit) * 100 : 0,
        };
      },
      
      getStats: () => {
        const state = get();
        const transactions = state.transactions;
        
        const totalIncome = transactions
          .filter((t) => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const totalExpense = transactions
          .filter((t) => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const daysInMonth = now.getDate();
        
        const monthlyExpense = transactions
          .filter(
            (t) => t.type === 'expense' && new Date(t.date) >= monthStart
          )
          .reduce((sum, t) => sum + t.amount, 0);
        
        return {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
          avgDaily: daysInMonth > 0 ? monthlyExpense / daysInMonth : 0,
          avgMonthly: monthlyExpense,
        };
      },
      
      getExpensesByCategory: () => {
        const state = get();
        const expenses = state.transactions.filter((t) => t.type === 'expense');
        const categoryMap = new Map<string, number>();
        
        expenses.forEach((t) => {
          const current = categoryMap.get(t.categoryId) || 0;
          categoryMap.set(t.categoryId, current + t.amount);
        });
        
        return Array.from(categoryMap.entries())
          .map(([catId, amount]) => {
            const cat = state.categories.find((c) => c.id === catId);
            return {
              name: cat?.name || 'Неизвестно',
              icon: cat?.icon || '❓',
              amount,
              color: CHART_COLORS[Array.from(categoryMap.keys()).indexOf(catId) % CHART_COLORS.length],
            };
          })
          .sort((a, b) => b.amount - a.amount);
      },
      
      getBalanceOverTime: () => {
        const state = get();
        const sorted = [...state.transactions].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        
        const balanceMap = new Map<string, number>();
        let runningBalance = 0;
        
        sorted.forEach((t) => {
          const dateKey = new Date(t.date).toISOString().split('T')[0];
          if (t.type === 'income') runningBalance += t.amount;
          else runningBalance -= t.amount;
          balanceMap.set(dateKey, runningBalance);
        });
        
        return Array.from(balanceMap.entries()).map(([date, balance]) => ({
          date,
          balance,
        }));
      },
      
      getTopCategories: (limit) => {
        const expenses = get().getExpensesByCategory();
        return expenses.slice(0, limit);
      },
    }),
    {
      name: 'ft-data',
    }
  )
);
