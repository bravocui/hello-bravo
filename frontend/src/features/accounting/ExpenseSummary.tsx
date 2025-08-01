import React, { useState, useMemo } from 'react';
import { DollarSign } from 'lucide-react';
import { Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { LedgerEntry, SelectedView, SortBy, SortOrder } from './types';
import { formatCurrency } from './utils/formatters';
import { getCategoryColor } from './utils/categoryUtils';

interface ExpenseSummaryProps {
  totalExpenses: number;
  filteredData: LedgerEntry[];
  selectedView: SelectedView;
  setSelectedView: (view: SelectedView) => void;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  totalExpenses,
  filteredData,
  selectedView,
  setSelectedView
}) => {
  const [sortBy, setSortBy] = useState<SortBy>('amount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const categoryTotals = useMemo(() => {
    return filteredData.reduce((acc, entry) => {
      const category = entry.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += entry.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [filteredData]);

  return (
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
          <table className="w-full text-sm text-left text-gray-600" style={{ tableLayout: 'auto' }}>
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
                    <td className="py-3 pr-3 font-medium text-gray-800">
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
  );
};

export default ExpenseSummary; 