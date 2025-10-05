import React, { useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import Header from '../../common/components/Header';
import AIAssistant from '../../common/components/AIAssistant';
import AddExpenseModal from '../../common/components/AddExpenseModal';
import { useLedgerData } from './hooks/useLedgerData';
import { useLedgerFilters } from './hooks/useLedgerFilters';
import { useLedgerActions } from './hooks/useLedgerActions';
import FilterControls from './FilterControls';
import ExpenseSummary from './ExpenseSummary';
import MonthlyTrendChart from './MonthlyTrendChart';
import CategoryDetails from './CategoryDetails';
import CreditCardDetails from './CreditCardDetails';
import DetailedDataTable from './DetailedDataTable';
import { useAuth } from '../../contexts/AuthContext';

const LedgerPage: React.FC = () => {
  const { user } = useAuth();
  const {
    ledgerData,
    setLedgerData,
    loading,
    error,
    setError,
    fetchLedgerData,
    users,
    creditCards,
    spendingCategories
  } = useLedgerData();

  const {
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
  } = useLedgerFilters(ledgerData);

  const {
    editingEntry,
    editForm,
    setEditForm,
    editLoading,
    deleteLoading,
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
  } = useLedgerActions(ledgerData, setLedgerData, setError);

  // Filter data based on all filters
  const filteredData = useMemo(() => {
    return ledgerData.filter(entry => {
      // Filter by user
      const userFilter = selectedUsers.includes(entry.user?.name || '');

      // Filter by credit card
      const creditCardFilter = selectedCreditCard === 'all' || entry.credit_card === selectedCreditCard;

      // Filter by year
      const yearFilter = selectedYear === 'all' || entry.year === Number(selectedYear);

      // Filter by month
      const monthFilter = selectedMonth === 'all' || entry.month === Number(selectedMonth);

      return userFilter && creditCardFilter && yearFilter && monthFilter;
    });
  }, [ledgerData, selectedUsers, selectedCreditCard, selectedYear, selectedMonth]);

  // Calculate expense summaries based on filtered data
  const totalExpenses = filteredData.reduce((sum, entry) => sum + entry.amount, 0);

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
        title="Ledger"
        icon={DollarSign}
        iconColor="accounting"
        showBackButton={true}
        showUserInfo={true}
        showLogout={true}
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
                <span className="text-xl">×</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Filter Controls */}
        <FilterControls
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          selectedCreditCard={selectedCreditCard}
          setSelectedCreditCard={setSelectedCreditCard}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          uniqueUsers={uniqueUsers}
          uniqueCreditCards={uniqueCreditCards}
          uniqueYears={uniqueYears}
          uniqueMonths={uniqueMonths}
          filteredData={filteredData}
          creditCards={creditCards}
        />

        {/* Total Expenses Summary */}
        <ExpenseSummary
          totalExpenses={totalExpenses}
          filteredData={filteredData}
          selectedView={selectedView}
          setSelectedView={setSelectedView}
          onShowAIAssistant={() => setShowAIAssistant(true)}
        />

        {/* Monthly Bar Chart */}
        {selectedView === 'monthly-trend' && (
          <MonthlyTrendChart filteredData={filteredData} />
        )}

        {/* Category Breakdown */}
        {selectedView === 'category-details' && (
          <CategoryDetails filteredData={filteredData} />
        )}

        {/* Credit Card Breakdown */}
        {selectedView === 'credit-card-details' && (
          <CreditCardDetails filteredData={filteredData} />
        )}

        {/* Detailed Data Table */}
        {selectedView === 'detailed-data' && (
          <DetailedDataTable
            filteredData={filteredData}
            editingEntry={editingEntry}
            editForm={editForm}
            setEditForm={setEditForm}
            editLoading={editLoading}
            deleteLoading={deleteLoading}
            users={users}
            creditCards={creditCards}
            spendingCategories={spendingCategories}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onUpdateEntry={handleUpdateEntry}
            onDeleteEntry={handleDeleteEntry}
            onStartAdding={startAdding}
          />
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
            currentUser={user?.name || (Array.isArray(users) && users.length > 0 ? users[0].name : '')}
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

export default LedgerPage; 