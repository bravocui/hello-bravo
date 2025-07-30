import React from 'react';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { LedgerEntry } from '../types';
import { formatCurrency, formatMonthYear } from '../utils/formatters';

interface MonthlyTrendChartProps {
  filteredData: LedgerEntry[];
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ filteredData }) => {
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Expenses Trend</h2>
          <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-accounting-600" />
          </div>
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500">
          No data available for the selected time range
        </div>
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Monthly Expenses Trend</h2>
        <div className="w-8 h-8 bg-accounting-100 rounded-lg flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-accounting-600" />
        </div>
      </div>
      
      <div className="h-64">
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
      </div>
    </div>
  );
};

export default MonthlyTrendChart; 