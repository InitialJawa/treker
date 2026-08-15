import React from 'react';
import { Heart, Star, MapPin, ArrowRight, Calendar, Users, Plus } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { formatDateRange, formatCurrency } from '../utils/formatters';

interface FavoritesViewProps {
  onSelectTrip: (tripId: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectTrip }) => {
  const { trips, places, toggleTripFavorite, togglePlaceFavorite, currency } = useTripContext();

  const favoriteTrips = trips.filter((t) => t.isFavorite);
  const favoritePlaces = places.filter((p) => p.isFavorite);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-primary-pink p-8 md:p-10 rounded-[40px] text-white space-y-4 shadow-lg relative overflow-hidden mb-6">
        <div className="relative z-10 space-y-2">
          <span className="text-xs font-black tracking-widest uppercase bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-soft-pink inline-block">
            ✦ SAVED ITEMS
          </span>
          <h1 className="text-2xl md:text-4xl font-black flex items-center gap-3">
            <span>My Favourites</span>
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-white fill-white" />
          </h1>
          <p className="text-xs md:text-sm text-soft-pink max-w-2xl font-medium">
            Daftar trip tersimpan dan destinasi favorit impianmu
          </p>
        </div>
      </div>

      {/* Favorite Trips Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-dark">Favorite Trips ({favoriteTrips.length})</h2>

        {favoriteTrips.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8EBEF] p-8 text-center text-gray-400">
            <p className="text-xs font-semibold">Belum ada trip favorit tersimpan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoriteTrips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip.id)}
                className="bg-white rounded-2xl border border-[#E8EBEF] hover:border-primary-pink shadow-xs hover:shadow-lg transition-all cursor-pointer overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={trip.coverImage}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTripFavorite(trip.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-xs rounded-full shadow-md text-red-500"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-base text-dark group-hover:text-[var(--color-primary-pink)] transition-colors truncate">
                      {trip.name}
                    </h3>
                    <p className="text-xs text-[#6F7787] flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-primary-pink)]" />
                      {trip.destination}
                    </p>
                    <p className="text-xs text-[#6F7787] font-medium">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-gray-100 flex items-center justify-between mt-2 pt-3">
                  <span className="text-xs font-extrabold text-dark">
                    {formatCurrency(trip.budget, trip.currency)}
                  </span>
                  <span className="text-xs font-bold text-[var(--color-primary-pink)] flex items-center gap-1">
                    Workspace <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Favorite Places Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-extrabold text-dark">Favorite Places ({favoritePlaces.length})</h2>

        {favoritePlaces.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E8EBEF] p-8 text-center text-gray-400">
            <p className="text-xs font-semibold">Belum ada tempat favorit tersimpan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoritePlaces.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-2xl border border-[#E8EBEF] hover:border-primary-pink shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-44 overflow-hidden bg-gray-100">
                    <img
                      src={place.photos[0]}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      onClick={() => togglePlaceFavorite(place.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-xs rounded-full shadow-md text-red-500"
                    >
                      <Heart className="w-4 h-4 fill-red-500" />
                    </button>
                    <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
                      {place.category}
                    </span>
                  </div>

                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-base text-dark">{place.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{place.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6F7787] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-primary-pink)]" />
                      {place.location}
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-2">{place.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-gray-100 mt-2 pt-3 flex justify-between items-center">
                  <span className="text-xs font-extrabold text-dark">
                    {formatCurrency(place.estimatedCost, currency)}
                  </span>
                  <span className="text-[11px] font-bold text-[var(--color-primary-pink)] bg-soft-pink px-2.5 py-1 rounded-lg">
                    Saved in Wishlist
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
