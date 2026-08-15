import React, { useState } from 'react';
import { Plus, Search, Calendar, MapPin, Users, Heart, Trash2, ArrowRight, Copy, AlertTriangle, Check } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { formatDateRange, formatCurrency } from '../utils/formatters';
import { Trip } from '../types/travel';

interface MyTripsViewProps {
  onSelectTrip: (tripId: string) => void;
  openCreateTripModal: () => void;
  filterPastOnly?: boolean;
}

export const MyTripsView: React.FC<MyTripsViewProps> = ({
  onSelectTrip,
  openCreateTripModal,
  filterPastOnly = false,
}) => {
  const { trips, deleteTrip, duplicateTrip, toggleTripFavorite } = useTripContext();
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'current' | 'past'>(
    filterPastOnly ? 'past' : 'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleDuplicateClick = async (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    try {
      const newId = await duplicateTrip(trip.id);
      setToastMsg(`✓ Trip "${trip.name}" berhasil diduplikat!`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmDelete = () => {
    if (tripToDelete) {
      deleteTrip(tripToDelete.id);
      setToastMsg(`✓ Trip "${tripToDelete.name}" telah dihapus.`);
      setTripToDelete(null);
      setTimeout(() => setToastMsg(null), 3500);
    }
  };

  const filteredTrips = trips.filter((t) => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="fixed top-6 right-6 bg-primary-pink text-white px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 font-bold text-xs animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header & Primary Action */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">{filterPastOnly ? 'History' : 'My Trips'}</h1>
        <p className="text-gray-custom mt-1 text-sm">{filterPastOnly ? 'Your past adventures' : 'Manage your upcoming trips'}</p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-[#EAEFF5] shadow-xs w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['all', 'current', 'upcoming', 'past'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                filter === st
                  ? 'bg-primary-pink text-white shadow-xs'
                  : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAEFF5] p-12 text-center shadow-xs">
          <p className="text-sm font-semibold text-gray-400">Tidak ada rencana perjalanan ditemukan.</p>
          <button
            onClick={openCreateTripModal}
            className="mt-4 bg-primary-pink text-white px-5 py-2.5 rounded-2xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-pink-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Trip Baru</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => onSelectTrip(trip.id)}
              className="bg-white rounded-3xl border border-[#EAEFF5] hover:border-pink-300 shadow-xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              <div>
                {/* Cover Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={trip.coverImage}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTripFavorite(trip.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-xs rounded-full shadow-md text-red-500 hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-4 h-4 ${trip.isFavorite ? 'fill-red-500' : ''}`} />
                  </button>

                  <span className="absolute bottom-3 left-3 bg-primary-pink text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {trip.status}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-lg text-dark group-hover:text-primary-pink transition-colors truncate">
                      {trip.name}
                    </h3>
                    <p className="text-xs font-semibold text-gray-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-pink" />
                      {trip.destination}
                    </p>
                  </div>

                  <div className="text-xs text-gray-custom space-y-1.5 bg-soft-pink p-3 rounded-2xl border border-gray-100 font-medium">
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-primary-pink" />
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-primary-pink" />
                      {trip.travelersCount} Travelers
                    </p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 flex items-center justify-between border-t border-gray-100 mt-2 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Budget</span>
                  <span className="text-sm font-extrabold text-dark">
                    {formatCurrency(trip.budget, trip.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleDuplicateClick(e, trip)}
                    title="Duplikat Trip"
                    className="p-2 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTripToDelete(trip);
                    }}
                    title="Hapus Trip"
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button className="bg-soft-pink text-primary-pink group-hover:bg-primary-pink group-hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {tripToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-base text-dark">Hapus Trip "{tripToDelete.name}"?</h3>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus trip ini? Seluruh data itinerary, budget, booking, dan catatan akan dihapus secara permanen.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setTripToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20"
              >
                Ya, Hapus Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
