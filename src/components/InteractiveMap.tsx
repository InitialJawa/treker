import React, { useState, useEffect } from 'react';
import { Plus, Navigation, Star } from 'lucide-react';
import { Place } from '../types/travel';
import { useTripContext } from '../context/TripContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icon for selected/unselected
const createCustomIcon = (isSelected: boolean) => {
  return new L.DivIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${isSelected ? 'var(--color-primary-pink)' : '#FFFFFF'};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid ${isSelected ? '#FFFFFF' : 'var(--color-primary-pink)'};
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        transform: translate(-50%, -50%);
      "></div>
      ${isSelected ? `
        <div style="
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 4px 8px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: bold;
          white-space: nowrap;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">Selected</div>
      ` : ''}
    `,
    iconSize: [24, 24],
    iconAnchor: [0, 0] // Centered via transform in html
  });
};

interface InteractiveMapProps {
  places: Place[];
  onPlaceSelect?: (place: Place) => void;
}

// Component to recenter map when selected place changes
const MapRecenter: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ places, onPlaceSelect }) => {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(places[0] || null);
  const { activeTripId, itineraryDays, addPlaceToTripItinerary } = useTripContext();
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAddTopTrip = (place: Place, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeTripId && itineraryDays.length > 0) {
      const firstDay = itineraryDays.find(d => d.tripId === activeTripId) || itineraryDays[0];
      addPlaceToTripItinerary(place, activeTripId, firstDay.id);
      setToastMsg(`${place.name} telah ditambahkan ke Itinerary ${firstDay.title}!`);
      setTimeout(() => setToastMsg(null), 3500);
    } else {
      setToastMsg('Silakan pilih atau buat trip terlebih dahulu!');
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const defaultCenter: [number, number] = selectedPlace ? [selectedPlace.latitude, selectedPlace.longitude] : [-2.5489, 118.0149];

  return (
    <div className="bg-card-pink rounded-2xl border border-card-pink overflow-hidden flex flex-col h-full shadow-xs relative">
      {toastMsg && (
        <div className="absolute top-14 right-4 bg-primary-pink text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg z-50 animate-fade-in flex items-center gap-1.5">
          <span>{toastMsg}</span>
        </div>
      )}
      
      {/* Map Header Controls */}
      <div className="p-4 border-b border-card-pink flex items-center justify-between bg-card-pink z-10">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary-pink" />
          <h3 className="font-bold text-sm text-dark">Interactive Trip Map</h3>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div className="relative flex-1 bg-surface-muted min-h-[280px] overflow-hidden flex flex-col">
        <MapContainer 
          center={defaultCenter} 
          zoom={4} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {selectedPlace && <MapRecenter center={[selectedPlace.latitude, selectedPlace.longitude]} zoom={8} />}
          
          {places.map((p) => {
            const isSelected = selectedPlace?.id === p.id;
            return (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={createCustomIcon(isSelected)}
                eventHandlers={{
                  click: () => {
                    setSelectedPlace(p);
                    if (onPlaceSelect) onPlaceSelect(p);
                  },
                }}
              />
            );
          })}
        </MapContainer>

        {/* Selected Place Popup Overlay */}
        {selectedPlace && (
          <div className="absolute bottom-3 left-3 right-3 bg-card-pink/95 backdrop-blur-md rounded-xl p-3 border border-card-pink shadow-lg flex items-center justify-between gap-3 z-30">
            <div className="flex items-center gap-3">
              <img
                src={selectedPlace.photos?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'}
                alt={selectedPlace.name}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div>
                <h4 className="font-bold text-sm text-dark">{selectedPlace.name}</h4>
                <p className="text-xs text-gray-custom flex items-center gap-1">
                  <span>{selectedPlace.location}</span>
                  <span>•</span>
                  <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {selectedPlace.rating}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={(e) => handleAddTopTrip(selectedPlace, e)}
              className="bg-primary-pink hover:bg-opacity-90 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Trip</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
