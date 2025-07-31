import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Calendar, Star, Image } from 'lucide-react';
import api from '../config/api';
import Header from './Header';
import { 
  TravelMap,
  TravelEntry, 
  sampleTravelData, 
  formatDate, 
  formatDateRange, 
  calculateTripStats 
} from './travel';

const TravelPage: React.FC = () => {
  const [travelData, setTravelData] = useState<TravelEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TravelEntry | null>(null);
  const [showEntries, setShowEntries] = useState(false);

  useEffect(() => {
    fetchTravelData();
  }, []);

  const fetchTravelData = async () => {
    try {
      const response = await api.get('/travel/entries');
      // Merge with sample data for demo purposes
      const serverData = response.data || [];
      const mergedData = [...serverData, ...sampleTravelData];
      setTravelData(mergedData);
    } catch (error) {
      console.error('Failed to fetch travel data:', error);
      // Use sample data as fallback
      setTravelData(sampleTravelData);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const handleMarkerClick = (trip: TravelEntry) => {
    setSelectedTrip(trip);
    setShowEntries(true);
    // Scroll to the trip entry
    const element = document.getElementById(`trip-${trip.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
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

  const { totalTrips, totalDays, avgRating } = calculateTripStats(travelData);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Travel Log"
        icon={MapPin}
        iconColor="travel"
        showBackButton={true}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


        {/* Travel Map */}
        <div className="mb-8">
          <TravelMap 
            travelData={travelData} 
            onMarkerClick={handleMarkerClick}
          />
        </div>

        {/* Travel Entries */}
        {showEntries && selectedTrip && (
          <div className="space-y-6">
            <div 
              key={selectedTrip.id} 
              id={`trip-${selectedTrip.id}`}
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${
                selectedTrip?.id === selectedTrip.id ? 'ring-2 ring-travel-500 ring-opacity-50' : ''
              }`}
            >
              {/* Trip Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{selectedTrip.destination}</h3>
                      {selectedTrip.rating && (
                        <div className="flex items-center space-x-1">
                          {renderStars(selectedTrip.rating)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateRange(selectedTrip.start_date, selectedTrip.end_date)}</span>
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
                <p className="text-gray-700 leading-relaxed">{selectedTrip.description}</p>
              </div>

              {/* Photo Gallery */}
              {selectedTrip.photos.length > 0 && (
                <div className="px-6 pb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Photos ({selectedTrip.photos.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedTrip.photos.map((photo: string, index: number) => (
                      <div key={index} className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={photo}
                          alt={`${selectedTrip.destination} ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

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