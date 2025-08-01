import React, { useState, useMemo } from 'react';
import { BarChart3, ArrowUpDown, Bot, Plus, Edit, Save, X, Trash2 } from 'lucide-react';
import { LedgerEntry, User, CreditCard, SpendingCategory, TableSortField } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categoryUtils';

interface DetailedDataTableProps {
  filteredData: LedgerEntry[];
  editingEntry: number | null;
  editForm: Partial<LedgerEntry>;
  setEditForm: React.Dispatch<React.SetStateAction<Partial<LedgerEntry>>>;
  editLoading: boolean;
  deleteLoading: number | null;
  users: User[];
  creditCards: CreditCard[];
  spendingCategories: SpendingCategory[];
  onStartEditing: (entry: LedgerEntry) => void;
  onCancelEditing: () => void;
  onUpdateEntry: (entryId: number) => void;
  onDeleteEntry: (entryId: number) => void;
  onShowAIAssistant: () => void;
  onStartAdding: () => void;
}

const DetailedDataTable: React.FC<DetailedDataTableProps> = ({
  filteredData,
  editingEntry,
  editForm,
  setEditForm,
  editLoading,
  deleteLoading,
  users,
  creditCards,
  spendingCategories,
  onStartEditing,
  onCancelEditing,
  onUpdateEntry,
  onDeleteEntry,
  onShowAIAssistant,
  onStartAdding
}) => {
  const [tableSortField, setTableSortField] = useState<TableSortField>('year');
  const [tableSortOrder, setTableSortOrder] = useState<'asc' | 'desc'>('desc');

  // Helper function to get credit cards for a specific user
  const getCreditCardsForUser = (userName: string) => {
    return creditCards.filter(card => card.user?.name === userName);
  };

  // Helper function to get all category names
  const getCategoryNames = () => {
    return spendingCategories.map(category => category.category_name);
  };

  const handleTableSort = (field: TableSortField) => {
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

  return (
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
            onClick={onShowAIAssistant}
            className="group relative flex items-center px-4 py-2 rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700"
          >
            <Bot className="w-4 h-4" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              AI Assistant
            </span>
          </button>
          <button
            onClick={onStartAdding}
            className="group relative flex items-center px-4 py-2 rounded-lg transition-colors bg-accounting-600 text-white hover:bg-accounting-700"
          >
            <Plus className="w-4 h-4" />
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              Add Expense
            </span>
          </button>
        </div>
      </div>
        
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full divide-y divide-gray-200" style={{ tableLayout: 'auto' }}>
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
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingEntry === entry.id ? (
                    <input
                      type="number"
                      value={editForm.year || ''}
                      onChange={(e) => setEditForm({...editForm, year: parseInt(e.target.value)})}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                    />
                  ) : (
                    <span>{entry.year}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingEntry === entry.id ? (
                    <select
                      value={editForm.month || ''}
                      onChange={(e) => setEditForm({...editForm, month: parseInt(e.target.value)})}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
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
                    <span>{new Date(entry.year, entry.month - 1).toLocaleDateString('en-US', { month: 'long' })}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingEntry === entry.id ? (
                    <select
                      value={editForm.user_name || ''}
                      onChange={(e) => setEditForm({...editForm, user_name: e.target.value, credit_card: ''})}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                    >
                      <option value="">Select User</option>
                      {Array.isArray(users) && users.map(user => (
                        <option key={user.id} value={user.name}>{user.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="break-words">{entry.user_name}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingEntry === entry.id ? (
                    <select
                      value={editForm.credit_card || ''}
                      onChange={(e) => setEditForm({...editForm, credit_card: e.target.value})}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
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
                    <span className="break-words">{entry.credit_card}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {editingEntry === entry.id ? (
                    <select
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                      className="w-28 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                    >
                      <option value="">Select Category</option>
                      {getCategoryNames().map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>{getCategoryIcon(entry.category)}</span>
                      <span className="break-words">{entry.category}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-red-600">
                  {editingEntry === entry.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.amount || ''}
                      onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500"
                    />
                  ) : (
                    <span>{formatCurrency(entry.amount)}</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  {editingEntry === entry.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onUpdateEntry(entry.id)}
                        disabled={editLoading}
                        className={`flex items-center px-2 py-1 rounded text-xs ${
                          editLoading
                            ? 'bg-green-600 text-white opacity-50'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                        title="Save"
                      >
                        <Save className="w-3 h-3" />
                      </button>
                      <button
                        onClick={onCancelEditing}
                        className="flex items-center px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-xs"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onStartEditing(entry)}
                        className="flex items-center px-2 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700"
                        title="Edit"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        disabled={deleteLoading === entry.id}
                        className={`flex items-center px-2 py-1 rounded text-xs ${
                          deleteLoading === entry.id
                            ? 'bg-red-600 text-white opacity-50'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                        title="Delete"
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
  );
};

export default DetailedDataTable; 