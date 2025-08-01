import React from 'react';
import { CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LedgerEntry } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getUserCardColor } from '../utils/categoryUtils';

interface CreditCardDetailsProps {
  filteredData: LedgerEntry[];
}

const CreditCardDetails: React.FC<CreditCardDetailsProps> = ({ filteredData }) => {
  // Group by user+card combination
  const userCardTotals = filteredData.reduce((acc, entry) => {
    const key = `${entry.user?.name}+${entry.credit_card}`;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += entry.amount;
    return acc;
  }, {} as Record<string, number>);

  // Helper function to get all months in the selected time range
  const getAllMonthsInRange = () => {
    const months: Array<{year: number, month: number}> = [];
    
    // For simplicity, we'll use all months from the data
    const allYears = new Set(filteredData.map(entry => entry.year));
    allYears.forEach(year => {
      for (let month = 1; month <= 12; month++) {
        months.push({ year, month });
      }
    });
    
    return months.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
  };

  // Create histogram data for user+card combinations
  const createUserCardHistogramData = (userCardKey: string) => {
    const [userName, cardName] = userCardKey.split('+');
    const userCardEntries = filteredData.filter(entry => 
      entry.user?.name === userName && entry.credit_card === cardName
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

  return (
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
  );
};

export default CreditCardDetails; 