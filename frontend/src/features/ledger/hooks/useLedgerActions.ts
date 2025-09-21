import { useState } from 'react';
import api from '../../../config/api';
import { LedgerEntry } from '../types';

export const useLedgerActions = (
  ledgerData: LedgerEntry[],
  setLedgerData: React.Dispatch<React.SetStateAction<LedgerEntry[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  users: Array<{id: number, name: string, email: string}>
) => {
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<LedgerEntry>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const startEditing = (entry: LedgerEntry) => {
    setEditingEntry(entry.id);
    setEditForm({
      year: entry.year,
      month: entry.month,
      category: entry.category,
      amount: entry.amount,
      credit_card: entry.credit_card,
      user_id: entry.user_id,
      notes: entry.notes
    });
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setEditForm({});
  };

  const handleUpdateEntry = async (entryId: number) => {
    try {
      setEditLoading(true);
      
      // Find the original entry to get all required fields
      const originalEntry = ledgerData.find(entry => entry.id === entryId);
      if (!originalEntry) {
        throw new Error('Entry not found');
      }
      
      // Create complete entry object with updated fields
      const updatedEntry = {
        id: entryId,
        year: editForm.year || originalEntry.year,
        month: editForm.month || originalEntry.month,
        category: editForm.category || originalEntry.category,
        amount: editForm.amount || originalEntry.amount,
        credit_card: editForm.credit_card || originalEntry.credit_card,
        user_id: editForm.user_id || originalEntry.user_id,
        notes: editForm.notes || originalEntry.notes
      };
      
      const response = await api.put(`/ledger/entries/${entryId}`, updatedEntry);
      
      // Update the local state with the updated entry
      setLedgerData(prevData => 
        prevData.map(entry => 
          entry.id === entryId ? response.data : entry
        )
      );
      
      setEditingEntry(null);
      setEditForm({});
      setError(null);
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Handle duplicate entry error
        setError(`Duplicate entry detected: ${err.response.data.detail}. Please edit the existing entry instead.`);
      } else {
        setError(err.response?.data?.detail || 'Failed to update entry');
      }
    } finally {
      setEditLoading(false);
    }
  };

  const startAdding = () => {
    setShowAddExpenseModal(true);
  };

  const handleDeleteEntry = async (entryId: number) => {
    if (!window.confirm('Are you sure you want to delete this expense entry?')) {
      return;
    }
    
    try {
      setDeleteLoading(entryId);
      
      await api.delete(`/ledger/entries/${entryId}`);
      
      // Remove the entry from local state
      setLedgerData(prevData => prevData.filter(entry => entry.id !== entryId));
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete entry');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleAIAssistantEntries = async (entries: any[], selectedUser?: string, selectedCreditCard?: string, year?: number, month?: number) => {
    try {
      // Use selected user and credit card, or fall back to defaults
      const currentUser = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')!) : null;
      const defaultUserName = selectedUser || currentUser?.name || '';
      const userCreditCards = ledgerData.filter(entry => entry.user?.name === defaultUserName);
      const defaultCreditCard = selectedCreditCard || (userCreditCards.length > 0 ? userCreditCards[0].credit_card : '');
      
      // Find the user ID for the selected user
      const selectedUserData = users.find(user => user.name === defaultUserName);
      if (!selectedUserData) {
        throw new Error(`User "${defaultUserName}" not found`);
      }
      
      // Get current date for default year/month
      const now = new Date();
      const currentYear = year || now.getFullYear();
      const currentMonth = month || now.getMonth() + 1;
      
      // Convert AI entries to ledger entries
      const ledgerEntries = entries.map(entry => ({
        year: currentYear,
        month: currentMonth,
        user_id: selectedUserData.id,
        credit_card: defaultCreditCard,
        category: entry.category,
        amount: entry.amount,
        notes: entry.notes || ''
      }));
      
      // Add entries using batch endpoint
      const response = await api.post('/ledger/entries/batch', { entries: ledgerEntries });
      
      // Add the new entries to the beginning of the list
      const newEntries = response.data;
      setLedgerData(prevData => [...newEntries, ...prevData]);
      
      setError(null);
      
      // Return the number of successfully created entries
      return newEntries.length;
    } catch (err: any) {
      if (err.response?.status === 409) {
        const errorMessage = `Duplicate entries detected: ${err.response.data.detail}. Please edit the existing entries instead.`;
        setError(errorMessage);
        throw new Error(errorMessage);
      } else {
        const errorMessage = err.response?.data?.detail || 'Failed to add AI assistant entries';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    }
  };

  const handleManualAddEntries = async (entries: any[]) => {
    try {
      setAddLoading(true);
      
      // Add entries using batch endpoint
      const response = await api.post('/ledger/entries/batch', { entries: entries });
      
      // Add the new entries to the beginning of the list
      const newEntries = response.data;
      setLedgerData(prevData => [...newEntries, ...prevData]);
      
      setError(null);
      
      // Return the number of successfully created entries
      return newEntries.length;
    } catch (err: any) {
      if (err.response?.status === 409) {
        const errorMessage = `Duplicate entries detected: ${err.response.data.detail}. Please edit the existing entries instead.`;
        setError(errorMessage);
        throw new Error(errorMessage);
      } else {
        const errorMessage = err.response?.data?.detail || 'Failed to add manual entries';
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } finally {
      setAddLoading(false);
    }
  };



  return {
    editingEntry,
    setEditingEntry,
    editForm,
    setEditForm,
    editLoading,
    addLoading,
    deleteLoading,
    setDeleteLoading,
    showAIAssistant,
    setShowAIAssistant,
    showAddExpenseModal,
    setShowAddExpenseModal,
    handleUpdateEntry,
    handleDeleteEntry,
    handleAIAssistantEntries,
    handleManualAddEntries,
    startEditing,
    cancelEditing,
    startAdding
  };
}; 