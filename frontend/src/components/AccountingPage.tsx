import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { DollarSign, PieChart as PieChartIcon, CreditCard, User, Calendar, BarChart3, Edit, Save, X, Plus, Trash2, RotateCcw, Bot, ArrowUpDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, PieChart, Pie } from 'recharts';
import api from '../config/api';
import Header from './Header';
import AIAssistant from './AIAssistant';
import AddExpenseModal from './AddExpenseModal';

interface LedgerEntry {
  id: number;
  year: number;
  month: number;
  category: string;
  amount: number;
  credit_card: string;
  user_name: string;
  notes?: string;
}



const AccountingPage: React.FC = () => {
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('year-to-date');
  const [selectedUser, setSelectedUser] = useState<string>('all-users');
  const [sortBy, setSortBy] = useState<'category' | 'amount' | 'percentage'>('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedView, setSelectedView] = useState<'monthly-trend' | 'category-details' | 'credit-card-details' | 'detailed-data'>('detailed-data');
  const [tableSortField, setTableSortField] = useState<'year' | 'month' | 'user_name' | 'credit_card' | 'category' | 'amount'>('year');
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dataSource, setDataSource] = useState<'database' | 'mock'>('database');
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<LedgerEntry>>({});
  const [editLoading, setEditLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [users, setUsers] = useState<Array<{id: number, name: string, email: string}>>([]);
  const [creditCards, setCreditCards] = useState<Array<{id: number, name: string, owner: string}>>([]);
  const [spendingCategories, setSpendingCategories] = useState<Array<{id: number, category_name: string}>>([]);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const fetchLedgerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = dataSource === 'database' ? '/ledger/entries' : '/ledger/mock-entries';
      const response = await api.get(endpoint);
      setLedgerData(response.data);
    } catch (error) {
      console.error('Failed to fetch ledger data:', error);
      setError(`Error loading data from server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatMonthYear = (year: number, month: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('dining')) return '🍽️';
    if (categoryLower.includes('transport')) return '🚗';
    if (categoryLower.includes('entertainment')) return '🎬';
    if (categoryLower.includes('shopping')) return '🛍️';
    if (categoryLower.includes('bills')) return '📄';
    return '💳';
  };

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('dining')) return '#10b981'; // teal
    if (categoryLower.includes('transport')) return '#3b82f6'; // blue
    if (categoryLower.includes('entertainment')) return '#f59e0b'; // orange
    if (categoryLower.includes('shopping')) return '#ec4899'; // pink
    if (categoryLower.includes('bills')) return '#8b5cf6'; // purple
    return '#6b7280'; // gray
  };

  const getUserCardColor = (userCardKey: string) => {
    const colors = [
      '#3B82F6', // blue
      '#EF4444', // red
      '#10B981', // green
      '#F59E0B', // yellow
      '#8B5CF6', // purple
      '#F97316', // orange
      '#06B6D4', // cyan
      '#84CC16', // lime
      '#EC4899', // pink
      '#6366F1', // indigo
    ];
    
    // Simple hash function to get consistent color for user+card combination
    let hash = 0;
    for (let i = 0; i < userCardKey.length; i++) {
      hash = ((hash << 5) - hash) + userCardKey.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Helper function to get credit cards for a specific user
  const getCreditCardsForUser = (userName: string) => {
    return creditCards.filter(card => card.owner === userName);
  };

  // Helper function to get all category names
  const getCategoryNames = () => {
    return spendingCategories.map(category => category.category_name);
  };

  const handleTableSort = (field: 'year' | 'month' | 'user_name' | 'credit_card' | 'category' | 'amount') => {
    if (tableSortField === field) {
      setTableSortOrder(tableSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTableSortField(field);
      setTableSortOrder('asc');
    }
  };

  const resetTableSort = () => {
    setTableSortField('year');
    setTableSortOrder('desc');
  };

  const startEditing = (entry: LedgerEntry) => {
    if (dataSource === 'mock') {
      return; // Disable editing for mock data
    }
    setEditingEntry(entry.id);
    setEditForm({
      year: entry.year,
      month: entry.month,
      category: entry.category,
      amount: entry.amount,
      credit_card: entry.credit_card,
      user_name: entry.user_name,
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
        user_name: editForm.user_name || originalEntry.user_name,
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
    if (dataSource === 'mock') {
      return; // Disable adding for mock data
    }
    setShowAddExpenseModal(true);
  };



  const handleDeleteEntry = async (entryId: number) => {
    if (dataSource === 'mock') {
      return; // Disable deleting for mock data
    }
    
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

  const handleAIAssistantEntries = async (entries: any[], selectedUser?: string, selectedCreditCard?: string) => {
    // Use selected user and credit card, or fall back to defaults
    const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    const defaultUserName = selectedUser || currentUser?.name || (Array.isArray(users) && users.length > 0 ? users[0].name : '');
    const userCreditCards = getCreditCardsForUser(defaultUserName);
    const defaultCreditCard = selectedCreditCard || (userCreditCards.length > 0 ? userCreditCards[0].name : '');
    
    // Get current date for default year/month
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Convert AI entries to ledger entries
    const ledgerEntries = entries.map(entry => ({
      year: entry.year || currentYear,
      month: entry.month || currentMonth,
      user_name: defaultUserName,
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
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(`Duplicate entries detected: ${err.response.data.detail}. Please edit the existing entries instead.`);
      } else {
        setError(err.response?.data?.detail || 'Failed to add manual entries');
      }
    } finally {
      setAddLoading(false);
    }
  };

  // Get unique users for the selector
  const uniqueUsers = useMemo(() => {
    const users = new Set(ledgerData.map(entry => entry.user_name));
    return Array.from(users).sort();
  }, [ledgerData]);

  // Get unique years for the selector
  const uniqueYears = useMemo(() => {
    const years = new Set(ledgerData.map(entry => entry.year));
    return Array.from(years).sort((a, b) => b - a); // Sort descending (newest first)
  }, [ledgerData]);

  // Filter data based on time range and owner
  const filteredData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    return ledgerData.filter(entry => {
      // Filter by time range
      let timeFilter = true;
      switch (timeRange) {
        case 'all-time':
          timeFilter = true;
          break;
        case 'year-to-date':
          timeFilter = entry.year === currentYear;
          break;
        default:
          // Check if it's a specific year
          if (timeRange.match(/^\d{4}$/)) {
            timeFilter = entry.year === parseInt(timeRange);
          } else {
            timeFilter = true;
          }
      }

      // Filter by user
      const userFilter = selectedUser === 'all-users' || entry.user_name === selectedUser;

      return timeFilter && userFilter;
    });
      }, [ledgerData, timeRange, selectedUser]);

  // Calculate expense summaries based on filtered data
  const totalExpenses = filteredData.reduce((sum, entry) => sum + entry.amount, 0);

  // Sort table data
  const sortedTableData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      // If a specific sort field is selected, use that
      if (tableSortField !== 'year' || tableSortOrder !== 'desc') {
        let aValue: any = a[tableSortField];
        let bValue: any = b[tableSortField];
        
        // Handle numeric fields
        if (tableSortField === 'year' || tableSortField === 'month' || tableSortField === 'amount') {
          aValue = Number(aValue);
          bValue = Number(bValue);
        }
        
        // Handle string fields
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (tableSortOrder === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      }
      
      // Default sort: year (desc) → month (desc) → user_name (asc) → credit_card (asc) → category (asc)
      if (a.year !== b.year) {
        return b.year - a.year; // Reverse order: newest year first
      }
      if (a.month !== b.month) {
        return b.month - a.month; // Reverse order: December to January
      }
      if (a.user_name !== b.user_name) {
        return a.user_name.toLowerCase().localeCompare(b.user_name.toLowerCase());
      }
      if (a.credit_card !== b.credit_card) {
        return a.credit_card.toLowerCase().localeCompare(b.credit_card.toLowerCase());
      }
      return a.category.toLowerCase().localeCompare(b.category.toLowerCase());
    });
    
    return sorted;
  }, [filteredData, tableSortField, tableSortOrder]);

  const categoryTotals = filteredData.reduce((acc, entry) => {
    const category = entry.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const creditCardTotals = filteredData.reduce((acc, entry) => {
    const card = entry.credit_card;
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card] += entry.amount;
    return acc;
  }, {} as Record<string, number>);

  // Group by user+card combination
  const userCardTotals = filteredData.reduce((acc, entry) => {
    const key = `${entry.user_name}+${entry.credit_card}`;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += entry.amount;
    return acc;
  }, {} as Record<string, number>);



  // Helper function to get all months in the selected time range
  const getAllMonthsInRange = () => {
    const months: Array<{year: number, month: number}> = [];
    const currentYear = new Date().getFullYear();
    
    switch (timeRange) {
      case 'all-time':
        // For all-time, get all years and months from the data
        const allYears = new Set(filteredData.map(entry => entry.year));
        allYears.forEach(year => {
          for (let month = 1; month <= 12; month++) {
            months.push({ year, month });
          }
        });
        break;
      case 'year-to-date':
        // For YTD, get all months from current year up to current month
        const currentMonth = new Date().getMonth() + 1;
        for (let month = 1; month <= currentMonth; month++) {
          months.push({ year: currentYear, month });
        }
        break;
      default:
        // For specific year
        if (timeRange.match(/^\d{4}$/)) {
          const year = parseInt(timeRange);
          for (let month = 1; month <= 12; month++) {
            months.push({ year, month });
          }
        }
        break;
    }
    
    return months.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  };

  // Create histogram data for categories
  const createHistogramData = (category: string) => {
    const categoryEntries = filteredData.filter(entry => entry.category === category);
    const monthlyData = categoryEntries.reduce((acc, entry) => {
      const key = `${entry.year}-${entry.month}`;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += entry.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const allMonths = getAllMonthsInRange();
    
    return allMonths.map(({ year, month }) => {
      const key = `${year}-${month}`;
      const amount = monthlyData[key] || 0;
      return {
        month: `${year}/${month.toString().padStart(2, '0')}`,
        amount,
        percentage: categoryTotals[category] > 0 ? (amount / categoryTotals[category]) * 100 : 0
      };
    });
  };

  // Create histogram data for user+card combinations
  const createUserCardHistogramData = (userCardKey: string) => {
    const [userName, cardName] = userCardKey.split('+');
    const userCardEntries = filteredData.filter(entry => 
      entry.user_name === userName && entry.credit_card === cardName
    );
    const monthlyData = userCardEntries.reduce((acc, entry) => {
      const key = `${entry.year}-${entry.month}`;
      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += entry.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const allMonths = getAllMonthsInRange();
    
    return allMonths.map(({ year, month }) => {
      const key = `${year}-${month}`;
      const amount = monthlyData[key] || 0;
      return {
        month: `${year}/${month.toString().padStart(2, '0')}`,
        amount,
        percentage: userCardTotals[userCardKey] > 0 ? (amount / userCardTotals[userCardKey]) * 100 : 0
      };
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accounting-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading accounting data...</p>
        </div>
      </div>
    );
  }

  // Only show full-screen error for loading errors, not form errors
  if (error && loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchLedgerData();
            }}
            className="bg-accounting-600 hover:bg-accounting-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Expense Tracker"
        icon={DollarSign}
        iconColor="accounting"
        showBackButton={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Error Display */}
        {error && !loading && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-red-500 text-lg">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accounting-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-accounting-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">User</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedUser === 'all-users' 
                      ? `${new Set(filteredData.map(entry => entry.user_name)).size} users`
                      : '1 user'}
                  </p>
                </div>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
                >
                  <option value="all-users">All Users</option>
                  {uniqueUsers.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accounting-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accounting-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Time Range</p>
                  <p className="text-sm font-medium text-gray-900">
                    {timeRange === 'all-time' ? 'All Time' : 
                     timeRange === 'year-to-date' ? 'YTD' : 
                     timeRange}
                  </p>
                </div>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
                >
                  <option value="all-time">All Time</option>
                  <option value="year-to-date">Year to Date</option>
                  {uniqueYears.map(year => (
                    <option key={year} value={year.toString()}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accounting-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-accounting-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Data Source</p>
                  <p className="text-sm font-medium text-gray-900">
                    {dataSource === 'database' ? 'Database' : 'Mock Data'}
                  </p>
                </div>
                <select
                  value={dataSource}
                  onChange={(e) => setDataSource(e.target.value as 'database' | 'mock')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
                >
                  <option value="database">Database</option>
                  <option value="mock">Mock Data</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Total Expenses Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-3/5">
              <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-500 uppercase border-b">
                  <tr>
                    <th scope="col" className="py-3 pr-3 cursor-pointer" onClick={() => {
                      if (sortBy === 'category') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('category');
                        setSortOrder('asc');
                      }
                    }}>
                      <div className="flex items-center">
                        Category
                        <span className="text-gray-400 ml-1">
                          {sortBy === 'category' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="py-3 px-3 text-right cursor-pointer" onClick={() => {
                      if (sortBy === 'amount') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('amount');
                        setSortOrder('desc');
                      }
                    }}>
                      <div className="flex items-center justify-end">
                        Amount spent
                        <span className="text-gray-400 ml-1">
                          {sortBy === 'amount' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="py-3 pl-3 text-right">
                      Percent of total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const sortedCategories = Object.entries(categoryTotals)
                      .map(([category, amount]) => {
                        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                        return { category, amount, percentage };
                      })
                      .sort((a, b) => {
                        let comparison = 0;
                        switch (sortBy) {
                          case 'category':
                            comparison = a.category.localeCompare(b.category);
                            break;
                          case 'amount':
                            comparison = a.amount - b.amount;
                            break;
                          case 'percentage':
                            comparison = a.percentage - b.percentage;
                            break;
                          default:
                            comparison = b.amount - a.amount; // Default sort by amount descending
                        }
                        return sortOrder === 'asc' ? comparison : -comparison;
                      });
                    
                    return sortedCategories.map(({ category, amount, percentage }) => (
                      <tr key={category} className="border-b">
                        <td className="py-3 pr-3 font-medium text-gray-800 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="h-2.5 w-2.5 rounded-full mr-3" style={{ backgroundColor: getCategoryColor(category) }}></span>
                            {category}
                            <span className="text-blue-600 font-semibold ml-1">{'>'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-gray-800">
                          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 pl-3 text-right">
                          {percentage.toFixed(percentage > 0 && percentage < 0.1 ? 1 : 0)}%
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
            <div className="w-full md:w-2/5 flex items-center justify-center">
              <div className="w-56 h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={(() => {
                        return Object.entries(categoryTotals).map(([category, amount]) => ({
                          name: category,
                          amount: amount,
                          percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
                        }));
                      })()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      innerRadius="75%"
                      outerRadius="100%"
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {Object.entries(categoryTotals).map(([category, amount], index) => (
                        <Cell key={`cell-${index}`} fill={getCategoryColor(category)} stroke={getCategoryColor(category)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg z-50">
                              <p className="font-medium text-gray-900">{data.name}</p>
                              <p className="text-accounting-600 font-semibold">
                                ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {data.percentage.toFixed(data.percentage > 0 && data.percentage < 0.1 ? 1 : 0)}% of total
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                      cursor={false}
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-gray-500 text-sm">Total</span>
                  <span className="text-gray-900 text-xl font-bold">
                    ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* View Selection Buttons */}
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => setSelectedView('monthly-trend')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                selectedView === 'monthly-trend' 
                  ? 'bg-accounting-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Monthly Trend
            </button>
            <button
              onClick={() => setSelectedView('category-details')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                selectedView === 'category-details' 
                  ? 'bg-accounting-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Category Details
            </button>
            <button
              onClick={() => setSelectedView('credit-card-details')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                selectedView === 'credit-card-details' 
                  ? 'bg-accounting-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Credit Card Details
            </button>
            <button
              onClick={() => setSelectedView('detailed-data')}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                selectedView === 'detailed-data' 
                  ? 'bg-accounting-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Show Detailed Data
            </button>
          </div>
        </div>

        {/* Monthly Bar Chart */}
        {selectedView === 'monthly-trend' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Expenses Trend</h2>
            <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-accounting-600" />
            </div>
          </div>
          
          <div className="h-64">
            {(() => {
              // Group expenses by month for the selected date range
              const monthlyData = filteredData.reduce((acc, entry) => {
                const key = `${entry.year}-${entry.month.toString().padStart(2, '0')}`;
                if (!acc[key]) {
                  acc[key] = { year: entry.year, month: entry.month, total: 0 };
                }
                acc[key].total += entry.amount;
                return acc;
              }, {} as Record<string, { year: number; month: number; total: number }>);

              // Convert to array and sort by date
              const sortedMonths = Object.values(monthlyData).sort((a, b) => {
                if (a.year !== b.year) return a.year - b.year;
                return a.month - b.month;
              });

              if (sortedMonths.length === 0) {
                return (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No data available for the selected time range
                  </div>
                );
              }

              // Transform data for Recharts
              const chartData = sortedMonths.map(monthData => ({
                name: monthData.month.toString(),
                spending: monthData.total,
                year: monthData.year,
                month: monthData.month
              }));

              const average = chartData.reduce((sum, item) => sum + item.spending, 0) / chartData.length;
              const CURRENT_MOCK_MONTH = new Date().getMonth() + 1;
              const CURRENT_MOCK_YEAR = new Date().getFullYear();

              const CustomXAxisTick = (props: any) => {
                const { x, y, payload } = props;
                const { index } = payload;
                
                const entry = chartData[index];
                if (!entry) return null;

                const { year, month } = entry;
                const previousEntry = index > 0 ? chartData[index-1] : null;
                const showYear = index === 0 || (previousEntry && previousEntry.year !== year);

                // Convert month number to 3-char month name
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthName = monthNames[month - 1];

                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={40} textAnchor="middle" fill="#6B7280" fontSize={12}>
                      <tspan x="0" dy="10">{monthName}</tspan>
                      {showYear && <tspan x="0" dy="20">{year}</tspan>}
                    </text>
                  </g>
                );
              };

              const CustomTooltip = ({ active, payload, label }: any) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium">{formatMonthYear(data.year, data.month)}</p>
                      <p className="text-accounting-600">{formatCurrency(data.spending)}</p>
                    </div>
                  );
                }
                return null;
              };

              return (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={<CustomXAxisTick />}
                      axisLine={false} 
                      tickLine={false}
                      interval={0}
                      height={40}
                    />
                    <YAxis 
                      tickFormatter={(value: number) => `${value / 1000}k`} 
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                      axisLine={false} 
                      tickLine={false}
                      domain={[0, Math.max(...chartData.map(d => d.spending)) * 1.1]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                    <ReferenceLine y={average} stroke="#a0aec0" strokeDasharray="3 3" />
                    <Bar dataKey="spending" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.month === CURRENT_MOCK_MONTH && entry.year === CURRENT_MOCK_YEAR ? '#1e40af' : '#3b82f6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              );
            })()}
          </div>
        </div>
        )}

        {/* Category Breakdown */}
        {selectedView === 'category-details' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Expenses by Category</h2>
            <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-4 h-4 text-accounting-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(categoryTotals).map(([category, total]) => {
              const histogramData = createHistogramData(category);
              return (
                <div key={category} className="grid grid-cols-1 lg:grid-cols-5 gap-4 border border-gray-200 rounded-lg p-4">
                  {/* Left Block - Total */}
                  <div className="lg:col-span-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCategoryIcon(category)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{category}</h3>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Block - Chart Visualization */}
                  <div className="lg:col-span-3">
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            axisLine={false} 
                            tickLine={false}
                            height={30}
                          />
                          <YAxis 
                            tickFormatter={(value: number) => `${value / 1000}k`} 
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            axisLine={false} 
                            tickLine={false}
                            width={30}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-2 border border-gray-200 rounded shadow text-xs">
                                    <p className="font-medium">{data.month}</p>
                                    <p className="text-accounting-600">
                                      ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                            cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}
                          />
                          <Bar dataKey="amount" radius={[2, 2, 0, 0]} fill={getCategoryColor(category)} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Credit Card Breakdown */}
        {selectedView === 'credit-card-details' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Expenses by User + Credit Card</h2>
            <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-accounting-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(userCardTotals).map(([userCardKey, total]) => {
              const [userName, cardName] = userCardKey.split('+');
              const histogramData = createUserCardHistogramData(userCardKey);
              return (
                <div key={userCardKey} className="grid grid-cols-1 lg:grid-cols-5 gap-4 border border-gray-200 rounded-lg p-4">
                  {/* Left Block - Total */}
                  <div className="lg:col-span-2 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{userName}</h3>
                        <p className="text-sm text-gray-600">{cardName}</p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(total)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Block - Chart Visualization */}
                  <div className="lg:col-span-3">
                    <div className="h-32">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histogramData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            axisLine={false} 
                            tickLine={false}
                            height={30}
                          />
                          <YAxis 
                            tickFormatter={(value: number) => `${value / 1000}k`} 
                            tick={{ fontSize: 10, fill: '#6B7280' }}
                            axisLine={false} 
                            tickLine={false}
                            width={30}
                          />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-white p-2 border border-gray-200 rounded shadow text-xs">
                                    <p className="font-medium">{data.month}</p>
                                    <p className="text-accounting-600">
                                      ${data.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                            cursor={{fill: 'rgba(239, 246, 255, 0.5)'}}
                          />
                          <Bar dataKey="amount" radius={[2, 2, 0, 0]} fill={getUserCardColor(userCardKey)} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}

        {/* Detailed Data Table */}
        {selectedView === 'detailed-data' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Detailed Expense Data</h2>
              <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-accounting-600" />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={resetTableSort}
                className="group relative flex items-center bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowUpDown className="w-4 h-4" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Reset Sort
                </span>
              </button>
              <button
                onClick={() => setShowAIAssistant(true)}
                disabled={dataSource === 'mock'}
                className={`group relative flex items-center px-4 py-2 rounded-lg transition-colors ${
                  dataSource === 'mock' 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Bot className="w-4 h-4" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  AI Assistant
                </span>
              </button>
              <button
                onClick={startAdding}
                disabled={dataSource === 'mock'}
                className={`group relative flex items-center px-4 py-2 rounded-lg transition-colors ${
                  dataSource === 'mock' 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-accounting-600 text-white hover:bg-accounting-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  Add Expense
                </span>
              </button>
            </div>
          </div>
            

            
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTableSort('year')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Year</span>
                      <span className="text-gray-400">
                        {tableSortField === 'year' ? (tableSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTableSort('month')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Month</span>
                      <span className="text-gray-400">
                        {tableSortField === 'month' ? (tableSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTableSort('user_name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>User</span>
                      <span className="text-gray-400">
                        {tableSortField === 'user_name' ? (tableSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTableSort('credit_card')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Credit Card</span>
                      <span className="text-gray-400">
                        {tableSortField === 'credit_card' ? (tableSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTableSort('category')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Category</span>
                      <span className="text-gray-400">
                        {tableSortField === 'category' ? (tableSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleTableSort('amount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      <span className="text-gray-400">
                        {tableSortField === 'amount' ? (tableSortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTableData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-0">
                      {editingEntry === entry.id ? (
                        <input
                          type="number"
                          value={editForm.year || ''}
                          onChange={(e) => setEditForm({...editForm, year: parseInt(e.target.value)})}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                        />
                      ) : (
                        <span className="block w-16">{entry.year}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-0">
                      {editingEntry === entry.id ? (
                        <select
                          value={editForm.month || ''}
                          onChange={(e) => setEditForm({...editForm, month: parseInt(e.target.value)})}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                        >
                          {[
                            { value: 1, label: 'January' },
                            { value: 2, label: 'February' },
                            { value: 3, label: 'March' },
                            { value: 4, label: 'April' },
                            { value: 5, label: 'May' },
                            { value: 6, label: 'June' },
                            { value: 7, label: 'July' },
                            { value: 8, label: 'August' },
                            { value: 9, label: 'September' },
                            { value: 10, label: 'October' },
                            { value: 11, label: 'November' },
                            { value: 12, label: 'December' }
                          ].map(month => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="block w-24">{new Date(entry.year, entry.month - 1).toLocaleDateString('en-US', { month: 'long' })}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-0">
                      {editingEntry === entry.id ? (
                        <select
                          value={editForm.user_name || ''}
                          onChange={(e) => setEditForm({...editForm, user_name: e.target.value, credit_card: ''})}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                        >
                          <option value="">Select User</option>
                          {Array.isArray(users) && users.map(user => (
                            <option key={user.id} value={user.name}>{user.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="block w-20 truncate">{entry.user_name}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-0">
                      {editingEntry === entry.id ? (
                        <select
                          value={editForm.credit_card || ''}
                          onChange={(e) => setEditForm({...editForm, credit_card: e.target.value})}
                          className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                        >
                          <option value="">Select Credit Card</option>
                          {editForm.user_name ? (
                            getCreditCardsForUser(editForm.user_name).length > 0 ? (
                              getCreditCardsForUser(editForm.user_name).map(card => (
                                <option key={card.id} value={card.name}>{card.name}</option>
                              ))
                            ) : (
                              <option value="" disabled>No credit cards for this user</option>
                            )
                          ) : (
                            <option value="" disabled>Select a user first</option>
                          )}
                        </select>
                      ) : (
                        <span className="block w-28 truncate">{entry.credit_card}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 min-w-0">
                      {editingEntry === entry.id ? (
                        <select
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                        >
                          <option value="">Select Category</option>
                          {getCategoryNames().map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center space-x-2 w-24">
                          <span>{getCategoryIcon(entry.category)}</span>
                          <span className="truncate">{entry.category}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 min-w-0">
                      {editingEntry === entry.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.amount || ''}
                          onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                        />
                      ) : (
                        <span className="block w-20">{formatCurrency(entry.amount)}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingEntry === entry.id ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUpdateEntry(entry.id)}
                            disabled={editLoading || dataSource === 'mock'}
                            className={`flex items-center px-2 py-1 rounded text-xs ${
                              dataSource === 'mock'
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : editLoading
                                ? 'bg-green-600 text-white opacity-50'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                            title={dataSource === 'mock' ? 'Save disabled for mock data' : 'Save'}
                          >
                            <Save className="w-3 h-3" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="flex items-center px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => startEditing(entry)}
                            disabled={dataSource === 'mock'}
                            className={`flex items-center px-2 py-1 rounded text-xs ${
                              dataSource === 'mock'
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            title={dataSource === 'mock' ? 'Edit disabled for mock data' : 'Edit'}
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            disabled={deleteLoading === entry.id || dataSource === 'mock'}
                            className={`flex items-center px-2 py-1 rounded text-xs ${
                              dataSource === 'mock'
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : deleteLoading === entry.id
                                ? 'bg-red-600 text-white opacity-50'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title={dataSource === 'mock' ? 'Delete disabled for mock data' : 'Delete'}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {sortedTableData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data available for the selected filters
            </div>
          )}
        </div>
        )}





        {/* Empty State */}
        {ledgerData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-accounting-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-accounting-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your expenses by adding your first entry.</p>
            <button className="bg-accounting-600 hover:bg-accounting-700 text-white px-6 py-3 rounded-lg transition-colors">
              Add Your First Expense
            </button>
          </div>
        )}

        {/* AI Assistant Modal */}
        {showAIAssistant && (
          <AIAssistant
            onConfirmEntries={handleAIAssistantEntries}
            onClose={() => setShowAIAssistant(false)}
            currentUser={(() => {
              const currentUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
              return currentUser?.name || (Array.isArray(users) && users.length > 0 ? users[0].name : '');
            })()}
            users={users}
            creditCards={creditCards}
          />
        )}

        {/* Add Expense Modal */}
        {showAddExpenseModal && (
          <AddExpenseModal
            onConfirmEntries={handleManualAddEntries}
            onClose={() => setShowAddExpenseModal(false)}
            users={users}
            creditCards={creditCards}
            spendingCategories={spendingCategories}
          />
        )}
      </main>
    </div>
  );
};

export default AccountingPage; 