import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Activity, MapPin, Cloud, LogOut, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const categories = [
    {
      id: 'fitness',
      title: 'Fitness',
      description: 'Track your workouts and activities',
      icon: Activity,
      color: 'fitness',
      path: '/fitness',
      stats: '12 activities this month'
    },
    {
      id: 'travel',
      title: 'Travel Log',
      description: 'Record your adventures and trips',
      icon: MapPin,
      color: 'travel',
      path: '/travel',
      stats: '3 trips recorded'
    },
    {
      id: 'weather',
      title: 'Switzerland Weather',
      description: 'Check weather across Swiss cities',
      icon: Cloud,
      color: 'weather',
      path: '/weather',
      stats: '4 cities monitored'
    },
    {
      id: 'accounting',
      title: 'Accounting',
      description: 'Track your expenses',
      icon: DollarSign,
      color: 'accounting',
      path: '/accounting',
      stats: 'Expense tracking',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Life Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Choose a category to start tracking your life
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => navigate(category.path)}
                className={`
                  bg-white rounded-xl shadow-sm border border-gray-200 p-6 
                  cursor-pointer card-hover
                  hover:border-${category.color}-200 hover:shadow-lg
                  transition-all duration-200
                `}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    bg-${category.color}-100
                  `}>
                    <IconComponent className={`w-6 h-6 text-${category.color}-600`} />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.stats}
                  </span>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    bg-${category.color}-50
                  `}>
                    <IconComponent className={`w-4 h-4 text-${category.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-fitness-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-fitness-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-travel-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-travel-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Countries Visited</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-weather-100 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-weather-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cities Monitored</p>
                <p className="text-2xl font-bold text-gray-900">4</p>
              </div>
            </div>
          </div>
          

        </div>
      </main>
    </div>
  );
};

export default Dashboard; 