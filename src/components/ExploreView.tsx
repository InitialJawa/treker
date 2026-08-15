import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Heart, Plus, Check, X, Calendar, Globe, Copy, Users, ArrowRight } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { Place, Trip } from '../types/travel';
import { formatCurrency, formatDateRange } from '../utils/formatters';

interface ExploreViewProps {
  onSelectTrip?: (tripId: string) => void;
  initialSearchQuery?: string;
}

export const ExploreView: React.FC<ExploreViewProps> = ({ onSelectTrip, initialSearchQuery = '' }) => {
  const { 
    places, togglePlaceFavorite, trips, itineraryDays, addPlaceToTripItinerary, currency, importTemplateTrip, createNewTrip
  } = useTripContext();
  
  const [activeExploreTab, setActiveExploreTab] = useState<'Places' | 'Templates'>('Places');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Modal State for Add to Trip
  const [selectedPlaceForAdd, setSelectedPlaceForAdd] = useState<Place | null>(null);
  const [targetTripId, setTargetTripId] = useState<string>('');
  const [targetDayId, setTargetDayId] = useState<string>('');

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const categories = ['All', 'Nature', 'Volcano', 'Beach', 'Culinary', 'Culture', 'Shopping'];

  const fallbackTemplates: Trip[] = [
    {
      id: 'tmpl-banyuwangi',
      name: 'Banyuwangi Escape',
      destination: 'Banyuwangi, Indonesia',
      startDate: '2026-10-04',
      endDate: '2026-10-06',
      travelersCount: 2,
      currency: 'IDR',
      budget: 5000000,
      actualSpent: 0,
      description: 'Petualangan alam di Banyuwangi: Sunrise Kawah Ijen, Pantai Pulau Merah, dan Savana.',
      coverImage: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80',
      status: 'upcoming',
      isTemplate: true,
      isFavorite: false,
      createdAt: '2026-08-01',
      userId: 'system',
      collaborators: []
    },
    {
      id: 'tmpl-bali',
      name: 'Bali Cultural Retreat',
      destination: 'Bali, Indonesia',
      startDate: '2026-07-03',
      endDate: '2026-07-23',
      travelersCount: 2,
      currency: 'IDR',
      budget: 15000000,
      actualSpent: 0,
      description: 'Menjelajahi kebudayaan Ubud, pantai rahasia Uluwatu, dan pura bersejarah di Bali.',
      coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
      status: 'upcoming',
      isTemplate: true,
      isFavorite: false,
      createdAt: '2026-08-02',
      userId: 'system',
      collaborators: []
    },
    {
      id: 'tmpl-italy',
      name: 'Food & Wine of Italy',
      destination: 'Rome & Florence, Italy',
      startDate: '2026-02-01',
      endDate: '2026-02-20',
      travelersCount: 2,
      currency: 'IDR',
      budget: 50000000,
      actualSpent: 0,
      description: 'Culinary journey through Rome, Florence, Tuscany vineyards and Venice canals.',
      coverImage: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80',
      status: 'upcoming',
      isTemplate: true,
      isFavorite: false,
      createdAt: '2026-08-03',
      userId: 'system',
      collaborators: []
    }
  ];

  const dbTemplates = trips.filter(t => t.isTemplate);
  const templateTrips = dbTemplates.length > 0 ? dbTemplates : fallbackTemplates;

  const filteredPlaces = places.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenAddModal = (place: Place) => {
    if (trips.length === 0) {
      setAddedToast('Belum ada trip. Buat trip baru di Dashboard!');
      setTimeout(() => setAddedToast(null), 3000);
      return;
    }
    const defaultTrip = trips[0];
    const defaultTripDays = itineraryDays.filter(d => d.tripId === defaultTrip.id);
    setSelectedPlaceForAdd(place);
    setTargetTripId(defaultTrip.id);
    setTargetDayId(defaultTripDays[0]?.id || `day-${defaultTrip.id}-1`);
  };

  const handleConfirmAdd = () => {
    if (!selectedPlaceForAdd || !targetTripId) return;
    const chosenTrip = trips.find(t => t.id === targetTripId) || trips[0];
    const tripDays = itineraryDays.filter(d => d.tripId === chosenTrip.id);
    const dayIdToUse = targetDayId || tripDays[0]?.id || `day-${chosenTrip.id}-1`;

    addPlaceToTripItinerary(selectedPlaceForAdd, chosenTrip.id, dayIdToUse);
    setAddedToast(`✓ ${selectedPlaceForAdd.name} berhasil ditambahkan ke "${chosenTrip.name}"!`);
    setSelectedPlaceForAdd(null);
    setTimeout(() => setAddedToast(null), 3500);
  };

  // Modal State for Import Template
  const [templateForImport, setTemplateForImport] = useState<Trip | null>(null);
  const [importName, setImportName] = useState('');
  const [importStartDate, setImportStartDate] = useState('');
  const [importEndDate, setImportEndDate] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const openImportModal = (tmpl: Trip) => {
    setTemplateForImport(tmpl);
    setImportName(`${tmpl.name} (Salin)`);
    setImportStartDate(tmpl.startDate);
    setImportEndDate(tmpl.endDate);
  };

  const handleStartDateChange = (newStart: string) => {
    setImportStartDate(newStart);
    if (templateForImport && templateForImport.startDate && templateForImport.endDate) {
      const oldStart = new Date(templateForImport.startDate);
      const oldEnd = new Date(templateForImport.endDate);
      const diffMs = oldEnd.getTime() - oldStart.getTime();
      
      const newStartObj = new Date(newStart);
      const newEndObj = new Date(newStartObj.getTime() + diffMs);
      setImportEndDate(newEndObj.toISOString().split('T')[0]);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForImport) return;
    
    setIsImporting(true);
    try {
      let newTripId = '';
      if (trips.find(t => t.id === templateForImport.id)) {
        newTripId = await importTemplateTrip(templateForImport.id, importName, importStartDate, importEndDate);
      } else {
        const { id, actualSpent, status, isFavorite, createdAt, userId, collaborators, ...tripData } = templateForImport;
        // @ts-ignore
        newTripId = await createNewTrip({ ...tripData, name: importName, startDate: importStartDate, endDate: importEndDate, isTemplate: false }, false);
      }
      setAddedToast(`✓ Template "${templateForImport.name}" berhasil diimpor!`);
      setTimeout(() => setAddedToast(null), 3500);
      setTemplateForImport(null);
      if (onSelectTrip) {
        onSelectTrip(newTripId);
      }
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengimpor template: ' + (err?.message || 'Terjadi kesalahan'));
    } finally {
      setIsImporting(false);
    }
  };

  const handleTripChangeInModal = (tripId: string) => {
    setTargetTripId(tripId);
    const tripDays = itineraryDays.filter(d => d.tripId === tripId);
    if (tripDays.length > 0) {
      setTargetDayId(tripDays[0].id);
    } else {
      setTargetDayId(`day-${tripId}-1`);
    }
  };

  const selectedTripDays = itineraryDays.filter(d => d.tripId === targetTripId);

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Notification Banner */}
      {addedToast && (
        <div className="fixed top-6 right-6 bg-primary-pink text-white px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-2 font-bold text-xs animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Search Header Banner */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Eksplorasi Destinasi & Template Trip</h1>
        <p className="text-gray-custom mt-1 text-sm font-medium">
          Temukan destinasi wisata populer dan gunakan template perjalanan siap pakai.
        </p>
        <div className="mt-4 relative max-w-xl">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tempat wisata, Kawah Ijen, Bali, Kuliner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary-pink focus:ring-1 focus:ring-primary-pink transition-all shadow-sm"
          />
        </div>
      </div>

      {/* View Switcher: Destinasi vs Template Trip */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-card-pink shadow-sm">
          <button
            onClick={() => setActiveExploreTab('Places')}
            className={`px-6 py-3 rounded-full text-xs font-extrabold transition-all ${
              activeExploreTab === 'Places'
                ? 'bg-primary-pink text-white shadow-md'
                : 'text-gray-custom hover:text-dark hover:bg-soft-pink'
            }`}
          >
            Tempat & Destinasi Wisata
          </button>
          <button
            onClick={() => setActiveExploreTab('Templates')}
            className={`px-6 py-3 rounded-full text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              activeExploreTab === 'Templates'
                ? 'bg-primary-pink text-white shadow-md'
                : 'text-gray-custom hover:text-dark hover:bg-soft-pink'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Template Trip ({templateTrips.length})</span>
          </button>
        </div>

        {activeExploreTab === 'Places' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-soft-pink border-primary-pink text-primary-pink'
                    : 'bg-white border-card-pink text-gray-custom hover:bg-offwhite'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* TAB 1: PLACES GRID */}
      {activeExploreTab === 'Places' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place) => (
            <div
              key={place.id}
              className="bg-card-pink rounded-[32px] border border-card-pink hover:border-primary-pink shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo & Favorite */}
                <div className="relative h-48 overflow-hidden bg-soft-pink m-2 rounded-3xl">
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

                {/* Content */}
                <div className="p-5 space-y-2">
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

                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-full shrink-0 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-primary-pink text-primary-pink" />
                      <span className="text-xs font-bold text-dark">{place.rating}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-custom line-clamp-2 leading-relaxed font-medium">
                    {place.description}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 pt-0 mt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-gray-custom block">Estimasi Biaya</span>
                  <span className="text-xs font-extrabold text-dark">
                    {formatCurrency(place.estimatedCost, currency)}
                  </span>
                </div>

                <button
                  onClick={() => handleOpenAddModal(place)}
                  className="bg-primary-pink text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 border-2 border-white"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambahkan</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: TEMPLATES GRID */}
      {activeExploreTab === 'Templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templateTrips.length === 0 ? (
            <div className="col-span-full bg-offwhite p-10 rounded-[32px] text-center space-y-3 border border-card-pink">
              <Globe className="w-10 h-10 text-primary-pink mx-auto" />
              <h3 className="font-extrabold text-base text-dark">Belum Ada Template Publik</h3>
              <p className="text-xs text-gray-custom max-w-sm mx-auto">
                Buka salah satu trip milikmu di Workspace, lalu aktifkan toggle "Jadikan Template Publik" agar dapat dipakai pengguna lain!
              </p>
            </div>
          ) : (
            templateTrips.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-card-pink rounded-[32px] border border-card-pink hover:border-primary-pink shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden bg-soft-pink m-2 rounded-3xl">
                    <img
                      src={tmpl.coverImage}
                      alt={tmpl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 bg-white/90 text-primary-pink text-[10px] font-extrabold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Globe className="w-3 h-3" /> TEMPLATE
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-base text-dark group-hover:text-primary-pink transition-colors">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-gray-custom flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary-pink" />
                      {tmpl.destination} • {formatDateRange(tmpl.startDate, tmpl.endDate)}
                    </p>
                    <p className="text-xs text-gray-custom line-clamp-2 font-medium">
                      {tmpl.description || 'Template rencana perjalanan lengkap siap pakai.'}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-custom block font-semibold">Peserta</span>
                    <span className="text-xs font-bold text-dark">{tmpl.travelersCount} Orang</span>
                  </div>

                  <button
                    onClick={() => openImportModal(tmpl)}
                    className="bg-primary-pink text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 border-2 border-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Gunakan Template</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Import Template Modal */}
      {templateForImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-dark">
                Import Template
              </h3>
              <button 
                onClick={() => setTemplateForImport(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1">Nama Trip</label>
                <input
                  type="text"
                  required
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full bg-offwhite border border-card-pink rounded-xl px-4 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={importStartDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={importEndDate}
                    onChange={(e) => setImportEndDate(e.target.value)}
                    min={importStartDate}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isImporting}
                  className="w-full bg-primary-pink text-white rounded-xl py-3 text-sm font-extrabold shadow-md hover:shadow-lg active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isImporting ? 'Mengimpor...' : 'Mulai Perjalanan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Place To Trip Modal */}
      {selectedPlaceForAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
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

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-500 block mb-1">Pilih Trip Tujuan:</label>
                <select
                  value={targetTripId}
                  onChange={(e) => handleTripChangeInModal(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-bold text-dark bg-soft-pink focus:outline-none focus:border-primary-pink"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.destination})
                    </option>
                  ))}
                </select>
              </div>

              {selectedTripDays.length > 0 && (
                <div>
                  <label className="text-xs font-bold text-gray-500 block mb-1">Pilih Hari Itinerary:</label>
                  <select
                    value={targetDayId}
                    onChange={(e) => setTargetDayId(e.target.value)}
                    className="w-full p-3 rounded-2xl border border-gray-200 text-xs font-bold text-dark bg-soft-pink focus:outline-none focus:border-primary-pink"
                  >
                    {selectedTripDays.map((d) => (
                      <option key={d.id} value={d.id}>
                        Day {d.dayNumber}: {d.title} ({d.date})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setSelectedPlaceForAdd(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmAdd}
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
