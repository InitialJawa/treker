import React, { useState } from 'react';
import { Header } from './Header';
import { QuickCreateTripCard } from './QuickCreateTripCard';
import { InteractiveMap } from './InteractiveMap';
import { useTripContext } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { formatDateRange } from '../utils/formatters';
import { Star, Heart, Check, X } from 'lucide-react';
import { Place } from '../types/travel';
import { loadBanyuwangiTemplateToFirestore } from '../scripts/loadTemplate';

interface DashboardViewProps {
  onSelectTrip: (tripId: string) => void;
  openCreateTripModal: () => void;
  onNavigateView: (view: string, query?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTrip,
  openCreateTripModal,
  onNavigateView,
}) => {
  const { trips, places, togglePlaceFavorite, addPlaceToTripItinerary, resetToDefaults } = useTripContext();
  const { user } = useAuth();

  // State for Add to Trip Modal
  const [selectedPlaceForAdd, setSelectedPlaceForAdd] = useState<Place | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false);

  const handleLoadTemplate = async () => {
    if (!user?.uid) return;
    setIsLoadingTemplate(true);
    try {
      await loadBanyuwangiTemplateToFirestore(user.uid);
      setToastMessage('✓ Template Banyuwangi berhasil dimuat ke database!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (e) {
      console.error(e);
      alert('Gagal memuat template');
    } finally {
      setIsLoadingTemplate(false);
    }
  };

  const userTrips = trips.filter(t => t.userId === user?.uid || (user?.email && t.collaborators?.includes(user.email)));
  const currentTrips = userTrips.length > 0 ? userTrips : [
    {
      id: 'trip-italy',
      name: 'Food & Wine of Italy',
      destination: 'Rome & Amalfi, Italy',
      startDate: '2026-02-01',
      endDate: '2026-02-20',
      travelersCount: 2,
      currency: 'USD' as const,
      budget: 3500,
      actualSpent: 1200,
      coverImage: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
      status: 'current' as const,
      isFavorite: true,
      description: 'Italian holiday',
      createdAt: '2026-01-01',
    },
    {
      id: 'trip-bali',
      name: 'Bali',
      destination: 'Bali, Indonesia',
      startDate: '2026-07-03',
      endDate: '2026-07-23',
      travelersCount: 2,
      currency: 'USD' as const,
      budget: 2200,
      actualSpent: 400,
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
      status: 'current' as const,
      isFavorite: false,
      description: 'Bali vacation',
      createdAt: '2026-01-02',
    },
    {
      id: 'trip-norway',
      name: 'Norway & Sweden',
      destination: 'Oslo & Stockholm',
      startDate: '2026-09-10',
      endDate: '2026-09-30',
      travelersCount: 2,
      currency: 'USD' as const,
      budget: 4100,
      actualSpent: 1500,
      coverImage: 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=800&q=80',
      status: 'current' as const,
      isFavorite: false,
      description: 'Nordic roadtrip',
      createdAt: '2026-01-03',
    },
  ];

  const popularPlacesList: Place[] = [
    {
      id: 'p-colosseum',
      name: 'Colosseum',
      location: 'Rome, Italy',
      latitude: 41.8902,
      longitude: 12.4922,
      category: 'Culture',
      rating: 4,
      description: 'The Colosseum is an oval amphitheatre in the centre of the city of Rome, Italy...',
      photos: ['https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80'],
      estimatedCost: 25,
      status: 'wishlist',
      isFavorite: true,
    },
    {
      id: 'p-icehotel',
      name: 'IceHotel',
      location: 'Jukkasjärvi, Sweden',
      latitude: 67.8502,
      longitude: 20.6012,
      category: 'Nature',
      rating: 5,
      description: 'The Icehotel is a bucket list staple for every adventure traveller seeking unique sub-zero experiences...',
      photos: ['https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=400&q=80'],
      estimatedCost: 180,
      status: 'wishlist',
      isFavorite: false,
    },
    {
      id: 'p-oslo',
      name: 'Oslo',
      location: 'Oslo, Norway',
      latitude: 59.9139,
      longitude: 10.7522,
      category: 'Culture',
      rating: 3,
      description: 'Oslo is the capital and most populous city of Norway, surrounded by scenic fjords and green hills...',
      photos: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=400&q=80'],
      estimatedCost: 0,
      status: 'wishlist',
      isFavorite: false,
    },
  ];

  const handleOpenAddModal = (place: Place) => {
    setSelectedPlaceForAdd(place);
    setSelectedTripId(trips[0]?.id || currentTrips[0]?.id || '');
  };

  const handleConfirmAddPlace = () => {
    if (!selectedPlaceForAdd) return;
    const targetTrip = trips.find(t => t.id === selectedTripId) || currentTrips[0];
    
    addPlaceToTripItinerary(selectedPlaceForAdd, targetTrip.id, `day-${targetTrip.id}-1`);
    
    setToastMessage(`✓ ${selectedPlaceForAdd.name} successfully added to "${targetTrip.name}"!`);
    setSelectedPlaceForAdd(null);

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-primary-pink text-white px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 font-bold text-xs animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <Header onSearch={(q) => onNavigateView('Explore', q)} />

      {/* Main TREKER Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 8 Cols Area */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. CURRENT TRIPS SECTION */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-dark">Current Trips</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLoadTemplate}
                  disabled={isLoadingTemplate}
                  className="bg-offwhite border border-card-pink text-dark px-3 py-1.5 rounded-full text-xs font-bold hover:bg-soft-pink transition-colors disabled:opacity-50"
                >
                  {isLoadingTemplate ? 'Loading...' : 'Load Template Banyuwangi'}
                </button>
                <button
                  onClick={() => onNavigateView('MyTrips')}
                  className="text-xs font-bold text-primary-pink hover:underline"
                >
                  See All
                </button>
              </div>
            </div>

            {/* 3 Trip Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {currentTrips.slice(0, 3).map((trip) => (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  className="bg-card-pink rounded-3xl border border-card-pink overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative h-44 overflow-hidden bg-soft-pink m-2 rounded-2xl">
                    <img
                      src={trip.coverImage}
                      alt={trip.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 pt-2 space-y-1 text-center">
                    <h3 className="font-black text-base text-dark truncate group-hover:text-primary-pink transition-colors">
                      {trip.name}
                    </h3>
                    <p className="text-xs text-gray-custom font-semibold">
                      {formatDateRange(trip.startDate, trip.endDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. POPULAR PLACES & MAP ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* POPULAR PLACES CARD */}
            <div className="bg-white rounded-3xl p-5 border border-card-pink shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-lg text-dark">Popular Places</h3>
                  <button
                    onClick={() => onNavigateView('Explore')}
                    className="text-xs font-bold text-primary-pink hover:underline"
                  >
                    See All
                  </button>
                </div>

                {/* Popular Places Item List */}
                <div className="space-y-4">
                  {popularPlacesList.map((place) => (
                    <div key={place.id} className="flex items-center gap-3 bg-offwhite p-2.5 rounded-3xl border border-card-pink shadow-sm">
                      {/* Photo + Heart */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-soft-pink border-2 border-white shadow-sm">
                        <img
                          src={place.photos[0]}
                          alt={place.name}
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlaceFavorite(place.id);
                          }}
                          className="absolute bottom-0 right-0 p-1 bg-icon-pink rounded-full text-primary-pink hover:scale-110 transition-transform"
                        >
                          <Heart className={`w-3 h-3 ${place.isFavorite ? 'fill-primary-pink' : ''}`} />
                        </button>
                      </div>

                      {/* Info & Description */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="font-extrabold text-sm text-dark leading-snug truncate">
                              {place.name}
                            </h4>
                            <p className="text-[11px] font-semibold text-gray-custom truncate">
                              {place.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                           {/* Pink Star Ratings */}
                           <div className="flex items-center gap-0.5 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-primary-pink text-primary-pink" />
                            <span className="text-[11px] font-bold text-dark ml-0.5">{place.rating}</span>
                          </div>

                          <button
                            onClick={() => handleOpenAddModal(place)}
                            className="bg-white hover:bg-soft-pink text-primary-pink px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shadow-sm border border-card-pink"
                          >
                            Add to Trip
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* INTERACTIVE MAP WIDGET */}
            <div className="bg-white rounded-3xl p-2 border border-card-pink shadow-sm overflow-hidden flex flex-col h-full min-h-[380px]">
              <div className="h-full rounded-2xl overflow-hidden relative border-2 border-white">
                <InteractiveMap places={places} />
              </div>
            </div>

          </div>

        </div>

        {/* Right 4 Cols Area: Create New Trip Card */}
        <div className="lg:col-span-4">
          <QuickCreateTripCard onTripCreated={onSelectTrip} />
        </div>

      </div>

      {/* Modal Selection for Adding Place to Trip */}
      {selectedPlaceForAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-sm text-dark">
                Tambahkan "{selectedPlaceForAdd.name}"
              </h3>
              <button
                onClick={() => setSelectedPlaceForAdd(null)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 block">Pilih Trip Tujuan:</label>
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-bold text-dark bg-soft-pink focus:outline-none focus:border-primary-pink"
              >
                {(trips.length > 0 ? trips : currentTrips).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.destination})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedPlaceForAdd(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAddPlace}
                className="flex-1 py-2.5 rounded-xl bg-primary-pink hover:bg-[#DB2777] text-white text-xs font-bold shadow-md shadow-pink-500/20"
              >
                Tambahkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
