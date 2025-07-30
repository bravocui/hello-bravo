import { useState, useMemo } from 'react';
import { LedgerEntry, TimeRange, DataSource, SelectedView, FilterValue } from '../types';

export const useAccountingFilters = (ledgerData: LedgerEntry[]) => {
  const [selectedUser, setSelectedUser] = useState<FilterValue>('all');
  const [selectedCreditCard, setSelectedCreditCard] = useState<FilterValue>('all');
  const [selectedYear, setSelectedYear] = useState<FilterValue>('all');
  const [selectedMonth, setSelectedMonth] = useState<FilterValue>('all');
  const [dataSource, setDataSource] = useState<DataSource>('database');
  const [selectedView, setSelectedView] = useState<SelectedView>('detailed-data');

  // Get unique users for the selector
  const uniqueUsers = useMemo(() => {
    const users = new Set(ledgerData.map(entry => entry.user_name));
    return Array.from(users).sort();
  }, [ledgerData]);

  // Get unique credit cards for the selector
  const uniqueCreditCards = useMemo(() => {
    const cards = new Set(ledgerData.map(entry => entry.credit_card));
    return Array.from(cards).sort();
  }, [ledgerData]);

  // Get unique years for the selector
  const uniqueYears = useMemo(() => {
    const years = new Set(ledgerData.map(entry => entry.year));
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [ledgerData]);

  // Get unique months for the selector
  const uniqueMonths = useMemo(() => {
    const months = new Set(ledgerData.map(entry => entry.month));
    return Array.from(months).sort((a, b) => a - b); // Sort ascending (January to December)
  }, [ledgerData]);

  return {
    selectedUser,
    setSelectedUser,
    selectedCreditCard,
    setSelectedCreditCard,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    dataSource,
    setDataSource,
    selectedView,
    setSelectedView,
    uniqueUsers,
    uniqueCreditCards,
    uniqueYears,
    uniqueMonths
  };
}; 