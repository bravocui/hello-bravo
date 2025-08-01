import { useState, useEffect, useCallback } from 'react';
import api from '../../../config/api';
import { LedgerEntry, User, CreditCard, SpendingCategory } from '../types';

export const useAccountingData = () => {
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [spendingCategories, setSpendingCategories] = useState<SpendingCategory[]>([]);

  const fetchLedgerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/ledger/entries');
      setLedgerData(response.data || []);
    } catch (error) {
      console.error('Failed to fetch ledger data:', error);
      setError(`Error loading data from server: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLedgerData([]); // Ensure ledgerData is always an array
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users/list-names');
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]); // Set empty array on error
    }
  }, []);

  const fetchCreditCards = useCallback(async () => {
    try {
      const response = await api.get('/credit-cards/');
      setCreditCards(response.data || []);
    } catch (error) {
      console.error('Failed to fetch credit cards:', error);
      setCreditCards([]); // Set empty array on error
    }
  }, []);

  const fetchSpendingCategories = useCallback(async () => {
    try {
      const response = await api.get('/spending-categories/');
      setSpendingCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch spending categories:', error);
      setSpendingCategories([]); // Set empty array on error
    }
  }, []);

  useEffect(() => {
    fetchLedgerData();
    fetchUsers();
    fetchCreditCards();
    fetchSpendingCategories();
  }, [fetchLedgerData, fetchUsers, fetchCreditCards, fetchSpendingCategories]);

  return {
    ledgerData,
    setLedgerData,
    loading,
    error,
    setError,
    fetchLedgerData,
    users,
    creditCards,
    spendingCategories
  };
}; 