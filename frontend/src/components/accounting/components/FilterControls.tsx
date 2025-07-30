import React from 'react';
import { User, Calendar, BarChart3, CreditCard, CalendarDays } from 'lucide-react';
import { LedgerEntry, DataSource, FilterValue } from '../types';

interface FilterControlsProps {
  selectedUser: FilterValue;
  setSelectedUser: (user: FilterValue) => void;
  selectedCreditCard: FilterValue;
  setSelectedCreditCard: (card: FilterValue) => void;
  selectedYear: FilterValue;
  setSelectedYear: (year: FilterValue) => void;
  selectedMonth: FilterValue;
  setSelectedMonth: (month: FilterValue) => void;
  dataSource: DataSource;
  setDataSource: (source: DataSource) => void;
  uniqueUsers: string[];
  uniqueCreditCards: string[];
  uniqueYears: number[];
  uniqueMonths: number[];
  filteredData: LedgerEntry[];
  creditCards: Array<{id: number, name: string, owner: string}>;
}

const FilterControls: React.FC<FilterControlsProps> = ({
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

  // Filter credit cards based on selected user
  const availableCreditCards = React.useMemo(() => {
    if (selectedUser === 'all') {
      // If "All Users" is selected, show all credit cards
      return uniqueCreditCards;
    } else {
      // If a specific user is selected, only show their credit cards
      return creditCards
        .filter(card => card.owner === selectedUser)
        .map(card => card.name)
        .sort();
    }
  }, [selectedUser, uniqueCreditCards, creditCards]);

  // Reset credit card selection when user changes and current selection is not available
  React.useEffect(() => {
    if (selectedUser !== 'all' && selectedCreditCard !== 'all') {
      const userCards = creditCards
        .filter(card => card.owner === selectedUser)
        .map(card => card.name);
      
      if (!userCards.includes(selectedCreditCard as string)) {
        setSelectedCreditCard('all');
      }
    }
  }, [selectedUser, selectedCreditCard, creditCards, setSelectedCreditCard]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-wrap gap-4 items-center">
              {/* User Filter */}
        <div className="min-w-[200px]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3 text-accounting-600" />
              <p className="text-xs font-medium text-gray-600">User</p>
            </div>
            <p className="text-xs font-medium text-gray-900">
              {selectedUser === 'all' 
                ? `${new Set(filteredData.map(entry => entry.user_name)).size} users`
                : '1 user'}
            </p>
          </div>
          <select
            value={selectedUser}
            onChange={(e) => {
              setSelectedUser(e.target.value);
              // Reset credit card selection when user changes
              if (e.target.value !== selectedUser) {
                setSelectedCreditCard('all');
              }
            }}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
          >
            <option value="all">All Users</option>
            {uniqueUsers.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
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
                {selectedUser === 'all' ? 'All cards' : 'All cards'}
              </option>
            {availableCreditCards.map(card => (
              <option key={card} value={card}>{card}</option>
            ))}
          </select>
          {availableCreditCards.length === 0 && selectedUser !== 'all' && (
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
      

      
        {/* Data Source Filter */}
        <div className="min-w-[150px]">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <BarChart3 className="w-3 h-3 text-accounting-600" />
              <p className="text-xs font-medium text-gray-600">Data Source</p>
            </div>
            <p className="text-xs font-medium text-gray-900">
              {dataSource === 'database' ? 'Database' : 'Mock Data'}
            </p>
          </div>
          <select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value as DataSource)}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
          >
            <option value="database">Database</option>
            <option value="mock">Mock Data</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterControls; 