import React, { useState } from 'react';
import { Plus, Star, MapPin, ExternalLink, Heart, Clock, DollarSign, Compass, CheckCircle } from 'lucide-react';
import { Trip, Place, PlaceStatus, ItineraryDay } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { formatCurrency } from '../../utils/formatters';

interface TabPlacesProps {
  trip: Trip;
  places: Place[];
  days: ItineraryDay[];
}

export const TabPlaces: React.FC<TabPlacesProps> = ({ trip, places, days }) => {
  const { addPlace, updatePlaceStatus, togglePlaceFavorite, addPlaceToTripItinerary } = useTripContext();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState(trip.destination);
  const [category, setCategory] = useState('Nature');
  const [rating, setRating] = useState(4.8);
  const [estimatedCost, setEstimatedCost] = useState(50000);
  const [description, setDescription] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 - 17:00');
  const [photoUrl, setPhotoUrl] = useState('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80');

  const tripPlaces = places.filter(p => p.tripId === trip.id || !p.tripId);
  const filteredPlaces = tripPlaces.filter(p => {
    if (filterStatus === 'all') return true;
    return p.status === filterStatus;
  });

  const handleAddPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addPlace({
      tripId: trip.id,
      name,
      location,
      latitude: -8.0583,
      longitude: 114.2424,
      category,
      rating,
      estimatedCost,
      description: description || `Destinasi menarik di ${location}`,
      openingHours,
      photos: [photoUrl],
      status: 'wishlist',
      isFavorite: true,
    });
    setIsModalOpen(false);
  };

  const [selectedPlaceForItinerary, setSelectedPlaceForItinerary] = useState<Place | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string>(days[0]?.id || '');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleOpenDayPicker = (place: Place) => {
    if (days.length === 0) {
      setToastMessage('Belum ada hari di itinerary.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setSelectedPlaceForItinerary(place);
    setSelectedDayId(days[0]?.id || '');
  };

  const handleConfirmAddToItinerary = () => {
    if (!selectedPlaceForItinerary) return;
    const targetDay = days.find(d => d.id === selectedDayId) || days[0];

    addPlaceToTripItinerary(selectedPlaceForItinerary, trip.id, targetDay.id);
    setToastMessage(`✓ ${selectedPlaceForItinerary.name} telah ditambahkan ke ${targetDay.title}!`);
    setSelectedPlaceForItinerary(null);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Filter */}
      <div className="bg-white p-5 rounded-[24px] border border-card-pink flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'wishlist', 'planned', 'visited'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-primary-pink text-white shadow-sm'
                  : 'bg-offwhite text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-pink hover:bg-opacity-90 text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-sm self-start sm:self-auto shrink-0 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Place</span>
        </button>
      </div>

      {/* Places Cards Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-card-pink p-12 text-center text-gray-custom shadow-sm">
          <Compass className="w-12 h-12 mx-auto mb-2 text-soft-pink" />
          <h3 className="font-bold text-base text-dark">Tidak ada tempat ditemukan</h3>
          <p className="text-xs text-gray-custom mt-1 mb-4">Simpan tempat menarik atau gunakan tempat favorit dari Explore.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-white rounded-3xl border border-card-pink overflow-hidden hover:border-primary-pink hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Heart Favorite Badge */}
                <div className="relative h-44 overflow-hidden bg-soft-pink m-2 rounded-[20px]">
                  <img
                    src={place.photos[0]}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button
                    onClick={() => togglePlaceFavorite(place.id)}
                    className="absolute top-3 right-3 p-2 bg-icon-pink rounded-full shadow-sm text-primary-pink hover:scale-110 transition-transform"
                  >
                    <Heart className={`w-4 h-4 ${place.isFavorite ? 'fill-primary-pink' : ''}`} />
                  </button>

                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md text-primary-pink text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {place.category}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-base text-dark group-hover:text-primary-pink transition-colors">
                        {place.name}
                      </h3>
                      <p className="text-xs text-gray-custom flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-pink shrink-0" />
                        {place.location}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-offwhite px-2 py-1 rounded-full shrink-0 border border-card-pink">
                      <Star className="w-3.5 h-3.5 fill-primary-pink text-primary-pink" />
                      <span className="text-xs font-bold text-dark">{place.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-custom line-clamp-2 leading-relaxed font-medium">
                    {place.description}
                  </p>

                  <div className="flex items-center justify-between text-xs font-semibold text-gray-custom pt-2 border-t border-card-pink">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-primary-pink" />
                      {place.openingHours || '24 Jam'}
                    </span>
                    <span className="font-extrabold text-dark">
                      {formatCurrency(place.estimatedCost, trip.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Select & Add to Itinerary Button */}
              <div className="p-4 pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <select
                    value={place.status}
                    onChange={(e) => updatePlaceStatus(place.id, e.target.value as PlaceStatus)}
                    className="flex-1 px-3 py-1.5 rounded-full border border-card-pink bg-offwhite text-xs font-bold text-dark focus:outline-none focus:border-primary-pink"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="planned">Planned</option>
                    <option value="visited">Visited</option>
                  </select>

                  <button
                    onClick={() => handleOpenDayPicker(place)}
                    className="bg-primary-pink hover:bg-opacity-90 text-white text-xs font-bold px-4 py-1.5 rounded-full transition-all shadow-sm flex items-center gap-1 shrink-0 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Itinerary</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-primary-pink text-white px-5 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 font-bold text-xs animate-bounce border-2 border-white">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Day Picker Modal */}
      {selectedPlaceForItinerary && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] p-6 max-w-sm w-full shadow-2xl border border-card-pink space-y-4 animate-scale-up">
            <h3 className="font-extrabold text-sm text-dark">
              Tambahkan "{selectedPlaceForItinerary.name}" ke Itinerary
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-custom block">Pilih Hari:</label>
              <select
                value={selectedDayId}
                onChange={(e) => setSelectedDayId(e.target.value)}
                className="w-full p-3 rounded-full border border-card-pink text-xs font-bold text-dark bg-offwhite focus:outline-none focus:border-primary-pink"
              >
                {days.map((d) => (
                  <option key={d.id} value={d.id}>
                    Day {d.dayNumber}: {d.title} ({d.date})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedPlaceForItinerary(null)}
                className="flex-1 py-3 rounded-full border border-card-pink text-xs font-bold text-gray-custom hover:bg-soft-pink"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAddToItinerary}
                className="flex-1 py-3 rounded-full bg-primary-pink hover:bg-opacity-90 text-white text-xs font-bold shadow-sm transition-all"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8EBEF]">
            <h3 className="font-bold text-base text-[#20263D] mb-4">Add Place to Wishlist</h3>

            <form onSubmit={handleAddPlace} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Place Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pantai Pulau Merah"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Cost ({trip.currency})</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90 transition-all"
                >
                  Save Place
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
