import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Activity, MapPin, Cloud, DollarSign } from 'lucide-react';
import Header from '../../common/components/Header';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is a guest (has guest token)
  const isGuest = user?.email?.includes('guest') || user?.name?.includes('Guest');

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
      restrictedForGuests: true, // Hide for guests
    },
  ];

  // Filter categories based on user type
  const availableCategories = categories.filter(category => 
    !category.restrictedForGuests || !isGuest
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Life Tracker"
        icon={Activity}
        iconColor="gray"
        showUserInfo={true}
        showLogout={true}
      />

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
          {isGuest && (
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                🎭 You're logged in as a guest. Some features are limited. Contact admin for full access.
              </p>
            </div>
          )}
        </div>

        {/* Category Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${isGuest ? '3' : '4'} gap-6`}>
          {availableCategories.map((category) => {
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