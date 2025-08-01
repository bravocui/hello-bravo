import React, { useState, useMemo } from 'react';
import { LedgerEntry, SelectedView, FilterValue, UserFilterValue } from '../types';

export const useLedgerFilters = (ledgerData: LedgerEntry[]) => {
  const [selectedUsers, setSelectedUsers] = useState<UserFilterValue>([]);
  const [selectedCreditCard, setSelectedCreditCard] = useState<FilterValue>('all');
  const [selectedYear, setSelectedYear] = useState<FilterValue>('all');
  const [selectedMonth, setSelectedMonth] = useState<FilterValue>('all');
  const [selectedView, setSelectedView] = useState<SelectedView>('detailed-data');

  // Get unique users for the selector
  const uniqueUsers = useMemo(() => {
    const users = new Set(ledgerData.map(entry => entry.user?.name).filter((name): name is string => Boolean(name)));
    return Array.from(users).sort();
  }, [ledgerData]);

  // Initialize selectedUsers with all users when uniqueUsers changes
  React.useEffect(() => {
    if (uniqueUsers.length > 0 && selectedUsers.length === 0) {
      setSelectedUsers(uniqueUsers);
    }
  }, [uniqueUsers, selectedUsers]);

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
    selectedUsers,
    setSelectedUsers,
    selectedCreditCard,
    setSelectedCreditCard,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedView,
    setSelectedView,
    uniqueUsers,
    uniqueCreditCards,
    uniqueYears,
    uniqueMonths
  };
}; 