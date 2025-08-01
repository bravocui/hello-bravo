export interface TravelEntry {
  id: number;
  destination: string;
  start_date: string;
  end_date: string;
  description: string;
  photos: string[];
  rating?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Sample travel data with coordinates for map markers
export const sampleTravelData: TravelEntry[] = [
  {
    id: 1,
    destination: "Paris, France",
    start_date: "2024-03-15",
    end_date: "2024-03-22",
    description: "Amazing week exploring the City of Light. Visited the Eiffel Tower, Louvre Museum, and enjoyed delicious French cuisine.",
    photos: [
      "https://images.unsplash.com/photo-1502602898534-47d3c0c0b8b9?w=400",
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=400"
    ],
    rating: 5,
    coordinates: { lat: 48.8566, lng: 2.3522 }
  },
  {
    id: 2,
    destination: "Tokyo, Japan",
    start_date: "2024-02-10",
    end_date: "2024-02-18",
    description: "Incredible journey through Japan's capital. Explored Shibuya crossing, visited temples, and experienced the unique culture.",
    photos: [
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
      "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=400"
    ],
    rating: 4,
    coordinates: { lat: 35.6762, lng: 139.6503 }
  },
  {
    id: 3,
    destination: "New York City, USA",
    start_date: "2024-01-05",
    end_date: "2024-01-12",
    description: "The city that never sleeps! Walked through Central Park, visited Times Square, and enjoyed Broadway shows.",
    photos: [
      "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400",
      "https://images.unsplash.com/photo-1522083165195-3424ed129620?w=400"
    ],
    rating: 4,
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 4,
    destination: "Sydney, Australia",
    start_date: "2023-12-20",
    end_date: "2024-01-02",
    description: "Summer in December! Visited the Opera House, Bondi Beach, and celebrated New Year with fireworks over the harbor.",
    photos: [
      "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
    ],
    rating: 5,
    coordinates: { lat: -33.8688, lng: 151.2093 }
  },
  {
    id: 5,
    destination: "Barcelona, Spain",
    start_date: "2023-11-10",
    end_date: "2023-11-17",
    description: "Architecture and art in Catalonia. Explored Gaudi's masterpieces, walked La Rambla, and enjoyed tapas.",
    photos: [
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400",
      "https://images.unsplash.com/photo-1558642084-fd07fae5282e?w=400"
    ],
    rating: 4,
    coordinates: { lat: 41.3851, lng: 2.1734 }
  }
];

// Map configuration
export const mapConfig = {
  defaultCenter: { lat: 20, lng: 0 },
  defaultZoom: 2,
  minZoom: 1,
  maxZoom: 18,
  zoomDelta: 0.5,
  wheelPxPerZoomLevel: 50,
  tileLayer: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
};

// Utility functions
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatDateRange = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return `${formatDate(startDate)} - ${formatDate(endDate)} (${days} days)`;
};

export const calculateTripStats = (travelData: TravelEntry[]) => {
  const totalTrips = travelData.length;
  const totalDays = travelData.reduce((total, trip) => {
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    return total + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }, 0);
  const avgRating = totalTrips > 0 
    ? (travelData.reduce((sum, trip) => sum + (trip.rating || 0), 0) / totalTrips).toFixed(1)
    : '0.0';

  return { totalTrips, totalDays, avgRating };
}; 

export interface FlightTrackData {
  actual_distance: number;
  positions: FlightPosition[];
}

export interface FlightPosition {
  fa_flight_id: string | null;
  altitude: number;
  altitude_change: string;
  groundspeed: number;
  heading: number;
  latitude: number;
  longitude: number;
  timestamp: string;
  update_type: string;
}

export const parseFlightTrackData = (flightTrackJson: any): FlightTrackData => {
  return {
    actual_distance: flightTrackJson.actual_distance,
    positions: flightTrackJson.positions.map((pos: any) => ({
      fa_flight_id: pos.fa_flight_id,
      altitude: pos.altitude,
      altitude_change: pos.altitude_change,
      groundspeed: pos.groundspeed,
      heading: pos.heading,
      latitude: pos.latitude,
      longitude: pos.longitude,
      timestamp: pos.timestamp,
      update_type: pos.update_type
    }))
  };
}; 