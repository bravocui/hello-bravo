import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft, Plus, Calendar, Star, Image } from 'lucide-react';
import api from '../config/api';

interface TravelEntry {
  id: number;
  destination: string;
  start_date: string;
  end_date: string;
  description: string;
  photos: string[];
  rating?: number;
}

const TravelPage: React.FC = () => {
  const navigate = useNavigate();
  const [travelData, setTravelData] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTravelData();
  }, []);

  const fetchTravelData = async () => {
    try {
      const response = await api.get('/travel/entries');
      setTravelData(response.data);
    } catch (error) {
      console.error('Failed to fetch travel data:', error);
      setError(`Error loading data from server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return `${formatDate(startDate)} - ${formatDate(endDate)} (${days} days)`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-travel-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading travel data...</p>
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
              fetchTravelData();
            }}
            className="bg-travel-600 hover:bg-travel-700 text-white px-6 py-3 rounded-lg transition-colors"
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
              <div className="w-8 h-8 bg-travel-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-travel-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Travel Log</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-travel-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-travel-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{travelData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-travel-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-travel-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-bold text-gray-900">
                  {travelData.reduce((total, trip) => {
                    const start = new Date(trip.start_date);
                    const end = new Date(trip.end_date);
                    return total + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                  }, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-travel-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-travel-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(travelData.reduce((sum, trip) => sum + (trip.rating || 0), 0) / travelData.length).toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Entries */}
        <div className="space-y-6">
          {travelData.map((trip) => (
            <div key={trip.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Trip Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{trip.destination}</h3>
                      {trip.rating && (
                        <div className="flex items-center space-x-1">
                          {renderStars(trip.rating)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center space-x-2 bg-travel-600 hover:bg-travel-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Photos</span>
                  </button>
                </div>
              </div>

              {/* Trip Description */}
              <div className="px-6 py-4">
                <p className="text-gray-700 leading-relaxed">{trip.description}</p>
              </div>

              {/* Photo Gallery */}
              {trip.photos.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Photos ({trip.photos.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {trip.photos.map((photo, index) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`${trip.destination} ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {travelData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-travel-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-travel-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips recorded yet</h3>
            <p className="text-gray-600 mb-6">Start documenting your adventures by adding your first trip.</p>
            <button className="bg-travel-600 hover:bg-travel-700 text-white px-6 py-3 rounded-lg transition-colors">
              Add Your First Trip
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default TravelPage; 