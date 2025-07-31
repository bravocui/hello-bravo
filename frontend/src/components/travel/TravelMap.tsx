import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, ZoomControl, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { TravelEntry, mapConfig, formatDateRange, FlightTrackData, parseFlightTrackData } from './travelData';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface TravelMapProps {
  travelData: TravelEntry[];
  onMarkerClick?: (trip: TravelEntry) => void;
}

const TravelMap: React.FC<TravelMapProps> = ({ travelData, onMarkerClick }) => {
  const [flightTrackData, setFlightTrackData] = useState<FlightTrackData | null>(null);
  
  // Filter trips that have coordinates
  const tripsWithCoordinates = travelData.filter(trip => trip.coordinates);

  useEffect(() => {
    // Load flight track data
    const loadFlightTrackData = async () => {
      try {
        const response = await fetch('/flight_track.json');
        const data = await response.json();
        const parsedData = parseFlightTrackData(data);
        setFlightTrackData(parsedData);
      } catch (error) {
        console.error('Failed to load flight track data:', error);
      }
    };

    loadFlightTrackData();
  }, []);

  // Convert flight positions to polyline coordinates
  const flightPathCoordinates = flightTrackData?.positions.map(pos => [pos.latitude, pos.longitude] as [number, number]) || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Been there.</h3>
        {flightTrackData && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900">
                  ✈️ Flight LX188
                </p>
                <p className="text-xs text-blue-700">
                  {flightTrackData.actual_distance}km journey • {flightTrackData.positions.length} tracking points
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-600">
                  {new Date(flightTrackData.positions[0]?.timestamp).toLocaleDateString()}
                </p>
                <p className="text-xs text-blue-600">
                  {new Date(flightTrackData.positions[0]?.timestamp).toLocaleTimeString()} - {new Date(flightTrackData.positions[flightTrackData.positions.length - 1]?.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="h-[500px] w-full">
        <MapContainer
          center={[mapConfig.defaultCenter.lat, mapConfig.defaultCenter.lng]}
          zoom={mapConfig.defaultZoom}
          minZoom={mapConfig.minZoom}
          maxZoom={mapConfig.maxZoom}
          zoomDelta={mapConfig.zoomDelta}
          wheelPxPerZoomLevel={mapConfig.wheelPxPerZoomLevel}
          style={{ height: '100%', width: '100%' }}
          className="rounded-b-xl"
        >
          <TileLayer
            url={mapConfig.tileLayer}
            attribution={mapConfig.attribution}
          />
          <ZoomControl position="topright" zoomInTitle="Zoom in" zoomOutTitle="Zoom out" />
          
          {/* Flight Path */}
          {flightPathCoordinates.length > 0 && (
            <>
              <Polyline
                positions={flightPathCoordinates}
                color="#3B82F6"
                weight={3}
                opacity={0.8}
              >
                <Tooltip permanent={false} direction="top">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 text-sm">
                      Flight LX188
                    </div>
                    <div className="text-xs text-gray-600">
                      {flightTrackData?.actual_distance}km journey
                    </div>
                  </div>
                </Tooltip>
              </Polyline>
              
              {/* Start and End Markers */}
              {flightPathCoordinates.length > 0 && (
                <>
                  <Marker
                    position={flightPathCoordinates[0]}
                    icon={new Icon({
                      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzEwQjY4MSIvPgo8L3N2Zz4K',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                  >
                    <Tooltip permanent={false} direction="top">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 text-sm">
                          Flight Start
                        </div>
                        <div className="text-xs text-gray-600">
                          Zurich Airport
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                  
                  <Marker
                    position={flightPathCoordinates[flightPathCoordinates.length - 1]}
                    icon={new Icon({
                      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iI0Y1OTM3MyIvPgo8L3N2Zz4K',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12],
                    })}
                  >
                    <Tooltip permanent={false} direction="top">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 text-sm">
                          Flight End
                        </div>
                        <div className="text-xs text-gray-600">
                          Destination Airport
                        </div>
                      </div>
                    </Tooltip>
                  </Marker>
                </>
              )}
            </>
          )}
          
          {tripsWithCoordinates.map((trip) => (
            <Marker
              key={trip.id}
              position={[trip.coordinates!.lat, trip.coordinates!.lng]}
              eventHandlers={{
                click: () => onMarkerClick?.(trip),
              }}
            >
              <Tooltip permanent={false} direction="top" offset={[0, -10]}>
                <div className="text-center">
                  <div className="font-semibold text-gray-900 text-sm">
                    {trip.destination}
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDateRange(trip.start_date, trip.end_date)}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TravelMap; 