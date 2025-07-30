export interface LedgerEntry {
  id: number;
  year: number;
  month: number;
  category: string;
  amount: number;
  credit_card: string;
  user_name: string;
  notes?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface CreditCard {
  id: number;
  name: string;
  owner: string;
}

export interface SpendingCategory {
  id: number;
  category_name: string;
}

export type TimeRange = 'all-time' | 'year-to-date' | string;
export type DataSource = 'database' | 'mock';
export type SelectedView = 'monthly-trend' | 'category-details' | 'credit-card-details' | 'detailed-data';
export type SortBy = 'category' | 'amount' | 'percentage';
export type SortOrder = 'asc' | 'desc';
export type TableSortField = 'year' | 'month' | 'user_name' | 'credit_card' | 'category' | 'amount';
export type FilterValue = 'all' | string | number; 