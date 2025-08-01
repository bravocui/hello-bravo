import React, { useState, useEffect } from 'react';
import { Activity, Plus, Calendar, Clock, Flame } from 'lucide-react';
import api from '../../config/api';
import Header from '../../common/components/Header';

interface FitnessEntry {
  id: number;
  date: string;
  activity: string;
  duration: number;
  calories?: number;
  notes?: string;
}

const FitnessPage: React.FC = () => {

  const [fitnessData, setFitnessData] = useState<FitnessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFitnessData();
  }, []);

  const fetchFitnessData = async () => {
    try {
      const response = await api.get('/fitness/entries');
      setFitnessData(response.data);
    } catch (error) {
      console.error('Failed to fetch fitness data:', error);
      setError(`Error loading data from server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getActivityIcon = (activity: string) => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('run')) return '🏃‍♂️';
    if (activityLower.includes('cycle') || activityLower.includes('bike')) return '🚴‍♂️';
    if (activityLower.includes('swim')) return '🏊‍♂️';
    if (activityLower.includes('weight') || activityLower.includes('gym')) return '💪';
    if (activityLower.includes('yoga')) return '🧘‍♀️';
    return '🏃‍♂️';
  };

  const totalCalories = fitnessData.reduce((sum, entry) => sum + (entry.calories || 0), 0);
  const totalDuration = fitnessData.reduce((sum, entry) => sum + entry.duration, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fitness data...</p>
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
              fetchFitnessData();
            }}
            className="bg-fitness-600 hover:bg-fitness-700 text-white px-6 py-3 rounded-lg transition-colors"
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
        title="Fitness Tracker"
        icon={Activity}
        iconColor="fitness"
        showBackButton={true}
        showUserInfo={true}
        showLogout={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-fitness-100 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-fitness-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold text-gray-900">{fitnessData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-fitness-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-fitness-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">{totalDuration}m</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-fitness-100 rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-fitness-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Calories Burned</p>
                <p className="text-2xl font-bold text-gray-900">{totalCalories}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activities List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
              <button className="flex items-center space-x-2 bg-fitness-600 hover:bg-fitness-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                <span>Add Activity</span>
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {fitnessData.map((entry) => (
              <div key={entry.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getActivityIcon(entry.activity)}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{entry.activity}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(entry.date)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{entry.duration} min</span>
                        </div>
                        {entry.calories && (
                          <div className="flex items-center space-x-1">
                            <Flame className="w-4 h-4" />
                            <span>{entry.calories} cal</span>
                          </div>
                        )}
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium text-fitness-600">
                      {entry.duration} min
                    </div>
                    {entry.calories && (
                      <div className="text-xs text-gray-500">
                        {entry.calories} cal
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {fitnessData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-fitness-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-fitness-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activities yet</h3>
            <p className="text-gray-600 mb-6">Start tracking your fitness journey by adding your first activity.</p>
            <button className="bg-fitness-600 hover:bg-fitness-700 text-white px-6 py-3 rounded-lg transition-colors">
              Add Your First Activity
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default FitnessPage; 