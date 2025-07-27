import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, ArrowLeft, Plus, PieChart as PieChartIcon, CreditCard, User, Calendar, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, PieChart, Pie } from 'recharts';
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
  const [timeRange, setTimeRange] = useState<string>('all-time');
  const [selectedOwner, setSelectedOwner] = useState<string>('all-owners');
  const [sortBy, setSortBy] = useState<'category' | 'amount' | 'percentage'>('amount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedView, setSelectedView] = useState<'monthly-trend' | 'category-details' | 'credit-card-details'>('monthly-trend');

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

  const getCategoryColor = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('dining')) return '#10b981'; // teal
    if (categoryLower.includes('transport')) return '#3b82f6'; // blue
    if (categoryLower.includes('entertainment')) return '#f59e0b'; // orange
    if (categoryLower.includes('shopping')) return '#ec4899'; // pink
    if (categoryLower.includes('bills')) return '#8b5cf6'; // purple
    return '#6b7280'; // gray
  };

  // Get unique owners for the selector
  const uniqueOwners = useMemo(() => {
    const owners = new Set(ledgerData.map(entry => entry.owner));
    return Array.from(owners).sort();
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

      // Filter by owner
      const ownerFilter = selectedOwner === 'all-owners' || entry.owner === selectedOwner;

      return timeFilter && ownerFilter;
    });
  }, [ledgerData, timeRange, selectedOwner]);

  // Calculate expense summaries based on filtered data
  const totalExpenses = filteredData.reduce((sum, entry) => sum + entry.amount, 0);

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

  const monthlyTotals = filteredData.reduce((acc, entry) => {
    const key = `${entry.year}-${entry.month}`;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += entry.amount;
    return acc;
  }, {} as Record<string, number>);

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
    
    return Object.entries(monthlyData)
      .map(([key, amount]) => {
        const [year, month] = key.split('-').map(Number);
        return {
          month: `${year}/${month.toString().padStart(2, '0')}`,
          amount,
          percentage: (amount / categoryTotals[category]) * 100
        };
      })
      .sort((a, b) => {
        const [yearA, monthA] = a.month.split('/');
        const [yearB, monthB] = b.month.split('/');
        return new Date(`${monthA}/1/${yearA}`).getTime() - new Date(`${monthB}/1/${yearB}`).getTime();
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
        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-accounting-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-accounting-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600">Owner</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOwner === 'all-owners' 
                      ? `${new Set(filteredData.map(entry => entry.owner)).size} owners`
                      : '1 owner'}
                  </p>
                </div>
                <select
                  value={selectedOwner}
                  onChange={(e) => setSelectedOwner(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accounting-500 focus:border-transparent bg-white"
                >
                  <option value="all-owners">All Owners</option>
                  {uniqueOwners.map(owner => (
                    <option key={owner} value={owner}>{owner}</option>
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
                const { value, index } = payload;
                
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
      </main>
    </div>
  );
};

export default AccountingPage; 