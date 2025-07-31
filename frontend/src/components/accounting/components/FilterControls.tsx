import React from 'react';
import { User, Calendar, BarChart3, CreditCard, CalendarDays } from 'lucide-react';
import { LedgerEntry, DataSource, FilterValue, UserFilterValue } from '../types';

interface FilterControlsProps {
  selectedUsers: UserFilterValue;
  setSelectedUsers: (users: UserFilterValue) => void;
  selectedCreditCard: FilterValue;
  setSelectedCreditCard: (card: FilterValue) => void;
  selectedYear: FilterValue;
  setSelectedYear: (year: FilterValue) => void;
  selectedMonth: FilterValue;
  setSelectedMonth: (month: FilterValue) => void;
  uniqueUsers: string[];
  uniqueCreditCards: string[];
  uniqueYears: number[];
  uniqueMonths: number[];
  filteredData: LedgerEntry[];
  creditCards: Array<{id: number, name: string, owner: string}>;
}

const FilterControls: React.FC<FilterControlsProps> = ({
  selectedUsers,
  setSelectedUsers,
  selectedCreditCard,
  setSelectedCreditCard,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  uniqueUsers,
  uniqueCreditCards,
  uniqueYears,
  uniqueMonths,
  filteredData,
  creditCards
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Helper function to check if a user is selected
  const isUserSelected = (userName: string) => {
    return selectedUsers.includes(userName);
  };

  // Helper function to toggle user selection
  const toggleUser = (userName: string) => {
    if (selectedUsers.includes(userName)) {
      // Remove user from selection
      const newSelection = selectedUsers.filter(u => u !== userName);
      if (newSelection.length === 0) {
        // If no users selected, select all users
        setSelectedUsers(uniqueUsers);
      } else {
        setSelectedUsers(newSelection);
      }
    } else {
      // Add user to selection
      setSelectedUsers([...selectedUsers, userName]);
    }
  };



  // Filter credit cards based on selected users
  const availableCreditCards = React.useMemo(() => {
    // Show credit cards for selected users
    return creditCards
      .filter(card => selectedUsers.includes(card.owner))
      .map(card => card.name)
      .sort();
  }, [selectedUsers, creditCards]);

  // Reset credit card selection when users change and current selection is not available
  React.useEffect(() => {
    if (selectedUsers.length > 0 && selectedCreditCard !== 'all') {
      const userCards = creditCards
        .filter(card => selectedUsers.includes(card.owner))
        .map(card => card.name);
      
      if (!userCards.includes(selectedCreditCard as string)) {
        setSelectedCreditCard('all');
      }
    }
  }, [selectedUsers, selectedCreditCard, creditCards, setSelectedCreditCard]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-wrap gap-4 items-center">
              {/* User Filter */}
        <div className="min-w-[400px]">
          <div className="flex items-center mb-2">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3 text-accounting-600" />
              <p className="text-xs font-medium text-gray-600">Users</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {uniqueUsers.map(user => (
              <button
                key={user}
                onClick={() => toggleUser(user)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  isUserSelected(user)
                    ? 'bg-accounting-600 text-white border-accounting-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {user}
              </button>
            ))}
          </div>
        </div>
      
              {/* Credit Card Filter */}
        <div className="min-w-[200px]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <CreditCard className="w-3 h-3 text-accounting-600" />
              <p className="text-xs font-medium text-gray-600">Credit Card</p>
            </div>
            <p className="text-xs font-medium text-gray-900">
              {selectedCreditCard === 'all' 
                ? `${new Set(filteredData.map(entry => entry.credit_card)).size} cards`
                : '1 card'}
            </p>
          </div>
          <select
            value={selectedCreditCard}
            onChange={(e) => setSelectedCreditCard(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
            disabled={availableCreditCards.length === 0}
          >
                          <option value="all">
                All cards
              </option>
            {availableCreditCards.map(card => (
              <option key={card} value={card}>{card}</option>
            ))}
          </select>
          {availableCreditCards.length === 0 && selectedUsers.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">No credit cards for this user</p>
          )}
        </div>
      
              {/* Year Filter */}
        <div className="min-w-[150px]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-accounting-600" />
              <p className="text-xs font-medium text-gray-600">Year</p>
            </div>
            <p className="text-xs font-medium text-gray-900">
              {selectedYear === 'all' 
                ? `${uniqueYears.length} years`
                : selectedYear}
            </p>
          </div>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
          >
            <option value="all">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      
              {/* Month Filter */}
        <div className="min-w-[150px]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <CalendarDays className="w-3 h-3 text-accounting-600" />
              <p className="text-xs font-medium text-gray-600">Month</p>
            </div>
            <p className="text-xs font-medium text-gray-900">
              {selectedMonth === 'all' 
                ? `${uniqueMonths.length} months`
                : monthNames[Number(selectedMonth) - 1]}
            </p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
          >
            <option value="all">All Months</option>
            {uniqueMonths.map(month => (
              <option key={month} value={month}>{monthNames[month - 1]}</option>
            ))}
          </select>
        </div>
      

      

      </div>
    </div>
  );
};

export default FilterControls; 