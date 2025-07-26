import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cloud, ArrowLeft, Thermometer, Droplets, Wind, MapPin } from 'lucide-react';
import axios from 'axios';

interface WeatherData {
  location: string;
  temperature: number;
  description: string;
  humidity: number;
  wind_speed: number;
  icon: string;
}

const WeatherPage: React.FC = () => {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await axios.get('/weather/switzerland');
      setWeatherData(response.data);
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      // Fallback to mock data
      setWeatherData([
        {
          location: 'Zurich',
          temperature: 12.5,
          description: 'Partly cloudy',
          humidity: 65,
          wind_speed: 8.2,
          icon: 'cloudy'
        },
        {
          location: 'Geneva',
          temperature: 14.2,
          description: 'Sunny',
          humidity: 58,
          wind_speed: 5.1,
          icon: 'sunny'
        },
        {
          location: 'Bern',
          temperature: 11.8,
          description: 'Light rain',
          humidity: 72,
          wind_speed: 6.8,
          icon: 'rainy'
        },
        {
          location: 'Basel',
          temperature: 13.1,
          description: 'Overcast',
          humidity: 68,
          wind_speed: 7.3,
          icon: 'cloudy'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (icon: string) => {
    switch (icon) {
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      case 'snowy':
        return '❄️';
      case 'stormy':
        return '⛈️';
      default:
        return '🌤️';
    }
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 20) return 'text-red-600';
    if (temp >= 15) return 'text-orange-600';
    if (temp >= 10) return 'text-yellow-600';
    if (temp >= 5) return 'text-blue-600';
    return 'text-indigo-600';
  };

  const getHumidityColor = (humidity: number) => {
    if (humidity >= 80) return 'text-blue-600';
    if (humidity >= 60) return 'text-green-600';
    if (humidity >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-weather-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading weather data...</p>
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
              <div className="w-8 h-8 bg-weather-100 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-weather-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Switzerland Weather</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-weather-100 rounded-lg flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-weather-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Temperature</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(weatherData.reduce((sum, city) => sum + city.temperature, 0) / weatherData.length).toFixed(1)}°C
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-weather-100 rounded-lg flex items-center justify-center">
                <Droplets className="w-5 h-5 text-weather-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Humidity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.round(weatherData.reduce((sum, city) => sum + city.humidity, 0) / weatherData.length)}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-weather-100 rounded-lg flex items-center justify-center">
                <Wind className="w-5 h-5 text-weather-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Wind Speed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(weatherData.reduce((sum, city) => sum + city.wind_speed, 0) / weatherData.length).toFixed(1)} km/h
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-weather-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-weather-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Cities Monitored</p>
                <p className="text-2xl font-bold text-gray-900">{weatherData.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weather Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {weatherData.map((city) => (
            <div
              key={city.location}
              onClick={() => setSelectedCity(selectedCity === city.location ? null : city.location)}
              className={`
                bg-white rounded-xl shadow-sm border border-gray-200 p-6 
                cursor-pointer card-hover
                ${selectedCity === city.location ? 'ring-2 ring-weather-500' : ''}
                transition-all duration-200
              `}
            >
              {/* City Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{city.location}</h3>
                <div className="text-3xl">
                  {getWeatherIcon(city.icon)}
                </div>
              </div>

              {/* Temperature */}
              <div className="mb-4">
                <div className={`text-3xl font-bold ${getTemperatureColor(city.temperature)}`}>
                  {city.temperature}°C
                </div>
                <p className="text-gray-600 capitalize">{city.description}</p>
              </div>

              {/* Weather Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Humidity</span>
                  </div>
                  <span className={`text-sm font-medium ${getHumidityColor(city.humidity)}`}>
                    {city.humidity}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Wind</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {city.wind_speed} km/h
                  </span>
                </div>
              </div>

              {/* Expandable Details */}
              {selectedCity === city.location && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Feels like</span>
                      <span className="font-medium">{(city.temperature - 2).toFixed(1)}°C</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pressure</span>
                      <span className="font-medium">1013 hPa</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Visibility</span>
                      <span className="font-medium">10 km</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Weather Map Placeholder */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Switzerland Weather Map</h2>
          <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-2" />
              <p className="text-gray-600">Interactive weather map coming soon</p>
            </div>
          </div>
        </div>

        {/* Weather Alerts */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-600 text-sm font-bold">!</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Weather Alert</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Light rain expected in Bern and surrounding areas this afternoon. 
                Temperatures will remain cool throughout the day.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WeatherPage; 