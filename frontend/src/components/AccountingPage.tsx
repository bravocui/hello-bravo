import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowLeft, Plus, PieChart, CreditCard, User } from 'lucide-react';
import axios from 'axios';

interface LedgerEntry {
  id: number;
  year: number;
  month: number;
  category: string;
  amount: number;
  credit_card: string;
  owner: string;
  notes?: string;
}

const AccountingPage: React.FC = () => {
  const navigate = useNavigate();
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const fetchLedgerData = async () => {
    try {
      const response = await axios.get('/ledger/entries');
      setLedgerData(response.data);
    } catch (error) {
      console.error('Failed to fetch ledger data:', error);
      setError(`Error loading data from server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

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

  // Calculate expense summaries
  const totalExpenses = ledgerData.reduce((sum, entry) => sum + entry.amount, 0);

  const categoryTotals = ledgerData.reduce((acc, entry) => {
    const category = entry.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const creditCardTotals = ledgerData.reduce((acc, entry) => {
    const card = entry.credit_card;
    if (!acc[card]) {
      acc[card] = 0;
    }
    acc[card] += entry.amount;
    return acc;
  }, {} as Record<string, number>);

  const monthlyTotals = ledgerData.reduce((acc, entry) => {
    const key = `${entry.year}-${entry.month}`;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += entry.amount;
    return acc;
  }, {} as Record<string, number>);

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

  if (error) {
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
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:block">Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-accounting-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Expense Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accounting-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-accounting-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Credit Cards Used</p>
                <p className="text-2xl font-bold text-gray-900">{Object.keys(creditCardTotals).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accounting-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-accounting-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Owner</p>
                <p className="text-2xl font-bold text-gray-900">Bravo C</p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Expenses by Category</h2>
            <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-accounting-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryTotals).map(([category, total]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(category)}</span>
                  <h3 className="font-medium text-gray-900">{category}</h3>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(total)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Credit Card Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Expenses by Credit Card</h2>
            <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-accounting-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(creditCardTotals).map(([card, total]) => (
              <div key={card} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{card}</h3>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(total)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Expenses by Month</h2>
            <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-4 h-4 text-accounting-600" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(monthlyTotals).map(([key, total]) => {
              const [year, month] = key.split('-').map(Number);
              return (
                <div key={key} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{formatMonthYear(year, month)}</h3>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(total)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Raw Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Raw Expense Data</h2>
              <button className="flex items-center space-x-2 bg-accounting-600 hover:bg-accounting-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Expense</span>
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Year
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Card
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ledgerData.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{getCategoryIcon(entry.category)}</span>
                        <span>{entry.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.credit_card}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.owner}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
      </main>
    </div>
  );
};

export default AccountingPage; 