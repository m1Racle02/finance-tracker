export type TransactionType = 'income' | 'expense';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  userId?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  currency: string;
  description?: string;
  date: string;
  type: TransactionType;
  category?: Category;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  limit: number;
  period: string;
  category?: Category;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export interface TransactionFilters {
  type?: TransactionType;
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  averageDailyExpense: number;
  averageMonthlyExpense: number;
}
