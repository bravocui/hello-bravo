import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AddExpenseForm {
  year?: number;
  month?: number;
  user_id?: number;
  credit_card?: string;
  categoryAmounts?: { [category: string]: number };
  hiddenCategories?: Set<string>;
}

interface AddExpenseModalProps {
  onConfirmEntries: (entries: any[]) => Promise<number>;
  onClose: () => void;
  users: Array<{id: number, name: string, email: string}>;
  creditCards: Array<{id: number, name: string, user_id: number, user?: {name: string}}>;
  spendingCategories: Array<{id: number, category_name: string}>;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ 
  onConfirmEntries, 
  onClose, 
  users, 
  creditCards, 
  spendingCategories 
}) => {
  const { user } = useAuth();
  const [addForm, setAddForm] = useState<AddExpenseForm>(() => {
    const now = new Date();
    const defaultUser = user?.name ? users.find(u => u.name === user.name) : users[0];
    
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      user_id: defaultUser?.id,
      credit_card: '',
      categoryAmounts: {},
      hiddenCategories: new Set()
    };
  });

  // Update user_id when user changes
  useEffect(() => {
    if (user?.name) {
      const currentUser = users.find(u => u.name === user.name);
      if (currentUser && (!addForm.user_id || addForm.user_id !== currentUser.id)) {
        setAddForm(prev => ({
          ...prev,
          user_id: currentUser.id,
          credit_card: '' // Reset credit card when user changes
        }));
      }
    }
  }, [user?.name, addForm.user_id, users]);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdEntriesCount, setCreatedEntriesCount] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  const getCreditCardsForUser = (userName: string) => {
    return creditCards.filter(card => card.user?.name === userName);
  };

  const getCategoryNames = () => {
    return spendingCategories.map(category => category.category_name);
  };

  const handleConfirmEntries = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Validate required fields
      if (!addForm.year || !addForm.month || !addForm.user_id || !addForm.credit_card || !addForm.categoryAmounts) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Get total amount and check if any categories have amounts
      const totalAmount = Object.values(addForm.categoryAmounts).reduce((sum, amount) => sum + amount, 0);
      if (totalAmount === 0) {
        setError('Please enter amounts for at least one category (positive or negative values are allowed)');
        return;
      }
      
      // Create entries for each category with an amount (including negative values)
      const entries = Object.entries(addForm.categoryAmounts)
        .filter(([category, amount]) => amount !== 0)
        .map(([category, amount]) => ({
          year: addForm.year,
          month: addForm.month,
          user_id: addForm.user_id,
          credit_card: addForm.credit_card,
          category: category,
          amount: amount,
          notes: ''
        }));
      
      // Call the async function and wait for it to complete
      const createdCount = await onConfirmEntries(entries);
      setCreatedEntriesCount(createdCount);
      setShowSuccessPopup(true);
    } catch (err: any) {
      setError(err.message || 'Failed to add entries');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accounting-100 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-accounting-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
              <p className="text-sm text-gray-600">Manually add expense entries to your ledger (positive or negative amounts)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {error && (
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
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="space-y-6">
            {/* Header Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
                  <input
                    type="number"
                    value={addForm.year || ''}
                    onChange={(e) => setAddForm({...addForm, year: parseInt(e.target.value)})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Month</label>
                  <select
                    value={addForm.month || ''}
                    onChange={(e) => setAddForm({...addForm, month: parseInt(e.target.value)})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {[
                      { value: 1, label: 'Jan' },
                      { value: 2, label: 'Feb' },
                      { value: 3, label: 'Mar' },
                      { value: 4, label: 'Apr' },
                      { value: 5, label: 'May' },
                      { value: 6, label: 'Jun' },
                      { value: 7, label: 'Jul' },
                      { value: 8, label: 'Aug' },
                      { value: 9, label: 'Sep' },
                      { value: 10, label: 'Oct' },
                      { value: 11, label: 'Nov' },
                      { value: 12, label: 'Dec' }
                    ].map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">User</label>
                  <select
                    value={addForm.user_id || ''}
                    onChange={(e) => setAddForm({...addForm, user_id: parseInt(e.target.value), credit_card: ''})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select User</option>
                    {Array.isArray(users) && users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Credit Card</label>
                  <select
                    value={addForm.credit_card || ''}
                    onChange={(e) => setAddForm({...addForm, credit_card: e.target.value})}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Select Credit Card</option>
                    {addForm.user_id ? (
                      getCreditCardsForUser(users.find(u => u.id === addForm.user_id)?.name || '').length > 0 ? (
                        getCreditCardsForUser(users.find(u => u.id === addForm.user_id)?.name || '').map(card => (
                          <option key={card.id} value={card.name}>{card.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>No credit cards for this user</option>
                      )
                    ) : (
                      <option value="" disabled>Select a user first</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Category Amounts */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Category Amounts</h4>
              {getCategoryNames().length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  No spending categories available. Please add categories in the Admin Portal first.
                </div>
              ) : (
                <div className="space-y-2">
                  {getCategoryNames()
                    .filter(category => !addForm.hiddenCategories?.has(category))
                    .map((category) => (
                    <div key={category} className="flex items-center space-x-3 p-2 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-lg">{getCategoryIcon(category)}</span>
                        <span className="font-medium text-gray-900">{category}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={addForm.categoryAmounts?.[category] || ''}
                          onChange={(e) => {
                            const newAmounts = { ...addForm.categoryAmounts, [category]: parseFloat(e.target.value) || 0 };
                            setAddForm({...addForm, categoryAmounts: newAmounts});
                          }}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                          title="Enter positive or negative amount"
                        />
                        <button
                          onClick={() => {
                            const newHiddenCategories = new Set(addForm.hiddenCategories || []);
                            newHiddenCategories.add(category);
                            setAddForm({...addForm, hiddenCategories: newHiddenCategories});
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total Amount */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatCurrency(Object.values(addForm.categoryAmounts || {}).reduce((sum, amount) => sum + amount, 0))}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmEntries}
              disabled={isSubmitting}
              className="flex items-center space-x-2 bg-accounting-600 text-white px-6 py-2 rounded-lg hover:bg-accounting-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Add Expense</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Items Added Successfully
              </h3>
              <p className="text-gray-600 mb-6">
                {createdEntriesCount} expense {createdEntriesCount === 1 ? 'entry' : 'entries'} {createdEntriesCount === 1 ? 'has' : 'have'} been added to your ledger.
              </p>
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExpenseModal; 