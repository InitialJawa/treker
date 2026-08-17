import React, { useState, useEffect } from 'react';
import { 
  Calendar, DollarSign, Users, Clock, MapPin, ArrowRight, 
  ShieldCheck, AlertCircle, Plus, Camera, Compass, Sun, 
  Utensils, Car, Hotel, ShoppingBag, X, ImageIcon, ChevronRight, Check,
  Luggage, Settings, ArrowUp, ArrowDown, Trash2, Upload, Layout, Star, RotateCcw, FolderPlus
} from 'lucide-react';
import { Trip, ItineraryDay, ItineraryItem, Booking, PackingItem, Expense, TransportLeg } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { formatCurrency, getCurrencySymbol, calculateTripDurationDays, calculateDaysToGo } from '../../utils/formatters';
import { calculateTripBudgetSummary } from '../../utils/budgetUtils';
import { resizeImage } from '../../utils/imageUtils';

export interface CustomHighlightPhoto {
  id: string;
  url: string;
  title: string;
  category: string;
  isCover?: boolean;
  sourceType?: 'place' | 'itinerary' | 'moodboard' | 'booking' | 'note' | 'custom' | 'cover';
}

interface TabOverviewProps {
  trip: Trip;
  days: ItineraryDay[];
  items: ItineraryItem[];
  bookings: Booking[];
  packing: PackingItem[];
  expenses: Expense[];
  transports: TransportLeg[];
  onNavigateTab: (tabName: string) => void;
}

export const TabOverview: React.FC<TabOverviewProps> = ({
  trip,
  days,
  items,
  bookings,
  packing,
  expenses,
  transports,
  onNavigateTab,
}) => {
  const { moodboardItems, places, notes } = useTripContext();
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [activeCustomizeTab, setActiveCustomizeTab] = useState<'select' | 'import' | 'add' | 'layout'>('select');
  const [importSourceFilter, setImportSourceFilter] = useState<'all' | 'place' | 'itinerary' | 'moodboard' | 'booking'>('all');

  // Track deleted photo IDs/URLs for this trip so deletion persists
  const [deletedHighlightIds, setDeletedHighlightIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`traveler_deleted_photos_${trip.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Custom Photo Upload Form State
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Spot Foto');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Layout preference state
  const [layoutStyle, setLayoutStyle] = useState<'hero-mosaic' | 'equal-grid' | 'banner'>(() => {
    const saved = localStorage.getItem(`traveler_layout_${trip.id}`);
    return (saved as any) || 'hero-mosaic';
  });

  // Custom added photos state
  const [customPhotos, setCustomPhotos] = useState<CustomHighlightPhoto[]>(() => {
    try {
      const saved = localStorage.getItem(`traveler_custom_photos_${trip.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Highlight list order and visibility selection state
  const [orderedHighlightPhotos, setOrderedHighlightPhotos] = useState<CustomHighlightPhoto[]>([]);

  const duration = calculateTripDurationDays(trip.startDate, trip.endDate);
  const daysToGo = calculateDaysToGo(trip.startDate);

  // Unified Budget Calculation
  const budgetSummary = calculateTripBudgetSummary(trip, expenses, items, bookings, transports);
  const calculatedActualSpent = budgetSummary.totalSpent;

  const totalTasks = 11;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'Confirmed').length;
  const packedCount = packing.filter(p => p.isPacked).length;
  const packingRatio = packing.length > 0 ? packedCount / packing.length : 0;
  
  // Calculate preparation completion percentage
  let completedTasks = 0;
  if (items.length > 0) completedTasks += 3;
  if (confirmedBookingsCount > 0) completedTasks += 3;
  if (packingRatio > 0.5) completedTasks += 3;
  if (expenses.length > 0) completedTasks += 2;

  const prepPercentage = Math.min(100, Math.round((completedTasks / totalTasks) * 100));

  // Helper matching trip ID
  const matchesTripId = (targetTripId: string | undefined, currentTripId: string) => {
    if (!targetTripId) return false;
    if (targetTripId === currentTripId || currentTripId.startsWith(targetTripId) || targetTripId.startsWith(currentTripId)) return true;
    return false;
  };

  const tripMoodboards = (moodboardItems || []).filter(m => matchesTripId(m.tripId, trip.id));
  const tripPlaces = (places || []).filter(p => matchesTripId(p.tripId, trip.id));
  const tripNotes = (notes || []).filter(n => matchesTripId(n.tripId, trip.id));

  // Collect ALL source photos available across the trip
  const collectAvailablePhotos = (): CustomHighlightPhoto[] => {
    const list: CustomHighlightPhoto[] = [];

    // Custom photos first
    customPhotos.forEach(cp => list.push({ ...cp, sourceType: 'custom' }));

    // Cover Image
    if (trip.coverImage) {
      list.push({
        id: `cover-${trip.id}`,
        url: trip.coverImage,
        title: trip.destination,
        category: 'Cover Trip',
        isCover: true,
        sourceType: 'cover'
      });
    }

    // Itinerary Photos
    items.forEach(item => {
      if (item.imageUrl) {
        list.push({
          id: `item-${item.id}`,
          url: item.imageUrl,
          title: item.title,
          category: `Hari ${item.time || 'Schedule'}`,
          sourceType: 'itinerary'
        });
      }
      if (item.spotImageUrl) {
        list.push({
          id: `item-${item.id}-spot`,
          url: item.spotImageUrl,
          title: `${item.title} · Spot`,
          category: `Spot ${item.time || ''}`,
          sourceType: 'itinerary'
        });
      }
      if (item.outfitImageUrl) {
        list.push({
          id: `item-${item.id}-outfit`,
          url: item.outfitImageUrl,
          title: `${item.title} · Outfit`,
          category: `Outfit ${item.time || ''}`,
          sourceType: 'itinerary'
        });
      }
    });

    // Moodboards
    tripMoodboards.forEach(m => {
      if (m.imageUrl || m.url) {
        list.push({
          id: `mood-${m.id}`,
          url: m.imageUrl || m.url,
          title: m.title || 'Moodboard',
          category: 'Moodboard',
          sourceType: 'moodboard'
        });
      }
    });

    // Places
    tripPlaces.forEach(p => {
      if (p.photos && p.photos.length > 0) {
        p.photos.forEach((phUrl, idx) => {
          list.push({
            id: `place-${p.id}-${idx}`,
            url: phUrl,
            title: p.name,
            category: p.category || 'Spot Impian',
            sourceType: 'place'
          });
        });
      }
    });

    // Bookings
    bookings.forEach(b => {
      if (b.imageUrl) {
        list.push({
          id: `booking-${b.id}`,
          url: b.imageUrl,
          title: b.name,
          category: 'Voucher / Booking',
          sourceType: 'booking'
        });
      }
    });

    // Notes
    tripNotes.forEach(n => {
      if (n.imageUrl) {
        list.push({
          id: `note-${n.id}`,
          url: n.imageUrl,
          title: n.title,
          category: 'Catatan',
          sourceType: 'note'
        });
      }
    });

    // Deduplicate by URL
    const unique = Array.from(new Map(list.map(p => [p.url, p])).values());
    return unique;
  };

  const availablePhotos = collectAvailablePhotos();

  // Initialize or sync ordered highlight photos from saved state or fallback
  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem(`traveler_highlight_order_${trip.id}`);
      const savedDeleted = localStorage.getItem(`traveler_deleted_photos_${trip.id}`);
      const deletedIds: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];

      if (savedOrder) {
        const parsedIds: string[] = JSON.parse(savedOrder);
        const map = new Map(availablePhotos.map(p => [p.id, p]));
        const orderedFromSaved: CustomHighlightPhoto[] = [];

        parsedIds.forEach(id => {
          if (map.has(id)) {
            const item = map.get(id)!;
            if (!deletedIds.includes(id) && !deletedIds.includes(item.url)) {
              orderedFromSaved.push(item);
            }
            map.delete(id);
          }
        });

        // Append remaining available photos EXCEPT those explicitly deleted
        map.forEach((item, id) => {
          if (!deletedIds.includes(id) && !deletedIds.includes(item.url)) {
            orderedFromSaved.push(item);
          }
        });

        setOrderedHighlightPhotos(orderedFromSaved);
        return;
      }
    } catch (e) {
      console.error('Failed loading saved highlight order:', e);
    }

    // Fallback: Exclude deleted photos
    const initialList = availablePhotos.filter(
      p => !deletedHighlightIds.includes(p.id) && !deletedHighlightIds.includes(p.url)
    );
    setOrderedHighlightPhotos(initialList);
  }, [trip.id, availablePhotos.length]);

  // Persist layout & order state
  const saveHighlightOrder = (newOrder: CustomHighlightPhoto[]) => {
    setOrderedHighlightPhotos(newOrder);
    const ids = newOrder.map(p => p.id);
    localStorage.setItem(`traveler_highlight_order_${trip.id}`, JSON.stringify(ids));
  };

  const saveLayoutStyle = (style: 'hero-mosaic' | 'equal-grid' | 'banner') => {
    setLayoutStyle(style);
    localStorage.setItem(`traveler_layout_${trip.id}`, style);
  };

  const saveCustomPhotos = (photos: CustomHighlightPhoto[]) => {
    setCustomPhotos(photos);
    localStorage.setItem(`traveler_custom_photos_${trip.id}`, JSON.stringify(photos));
  };

  // Delete ANY photo from Overview Highlight
  const handleDeletePhoto = (photoId: string, photoUrl: string) => {
    const updatedOrder = orderedHighlightPhotos.filter(p => p.id !== photoId && p.url !== photoUrl);
    saveHighlightOrder(updatedOrder);

    const newDeleted = Array.from(new Set([...deletedHighlightIds, photoId, photoUrl]));
    setDeletedHighlightIds(newDeleted);
    localStorage.setItem(`traveler_deleted_photos_${trip.id}`, JSON.stringify(newDeleted));

    if (photoId.startsWith('custom-')) {
      const updatedCustoms = customPhotos.filter(p => p.id !== photoId);
      saveCustomPhotos(updatedCustoms);
    }
  };

  // Toggle Import photo from Project to Overview Highlight
  const handleToggleImportPhoto = (photo: CustomHighlightPhoto) => {
    const isAlreadyImported = orderedHighlightPhotos.some(p => p.id === photo.id || p.url === photo.url);

    if (isAlreadyImported) {
      handleDeletePhoto(photo.id, photo.url);
    } else {
      const newDeleted = deletedHighlightIds.filter(id => id !== photo.id && id !== photo.url);
      setDeletedHighlightIds(newDeleted);
      localStorage.setItem(`traveler_deleted_photos_${trip.id}`, JSON.stringify(newDeleted));

      const updatedOrder = [...orderedHighlightPhotos, photo];
      saveHighlightOrder(updatedOrder);
    }
  };

  // Move photo position up / down
  const handleMovePhoto = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === orderedHighlightPhotos.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...orderedHighlightPhotos];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    saveHighlightOrder(updated);
  };

  // Set selected photo as #1 Main Cover Hero
  const handleSetAsHero = (index: number) => {
    if (index === 0) return;
    const updated = [...orderedHighlightPhotos];
    const [moved] = updated.splice(index, 1);
    updated.unshift(moved);
    saveHighlightOrder(updated);
  };

  // Add new custom photo handler
  const handleAddCustomPhoto = async () => {
    if (!newPhotoUrl.trim()) return;
    const newPhoto: CustomHighlightPhoto = {
      id: `custom-${Date.now()}`,
      url: newPhotoUrl.trim(),
      title: newPhotoTitle.trim() || 'Foto Pilihan',
      category: newPhotoCategory.trim() || 'Custom',
      sourceType: 'custom'
    };

    const updatedCustoms = [newPhoto, ...customPhotos];
    saveCustomPhotos(updatedCustoms);

    const updatedOrder = [newPhoto, ...orderedHighlightPhotos];
    saveHighlightOrder(updatedOrder);

    setNewPhotoUrl('');
    setNewPhotoTitle('');
    setActiveCustomizeTab('select');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const resized = await resizeImage(file, 1200);
      setNewPhotoUrl(resized);
    } catch (err) {
      console.error('Failed to resize uploaded photo:', err);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset to default auto order
  const handleResetToDefault = () => {
    localStorage.removeItem(`traveler_highlight_order_${trip.id}`);
    localStorage.removeItem(`traveler_deleted_photos_${trip.id}`);
    setDeletedHighlightIds([]);
    setOrderedHighlightPhotos(availablePhotos);
  };

  // Photos to render based on layout
  const displayedPhotos = orderedHighlightPhotos.slice(0, layoutStyle === 'equal-grid' ? 6 : 5);

  // Helper to accurately resolve day for any itinerary item
  const getDayForItem = (item: ItineraryItem): ItineraryDay | undefined => {
    if (!item.dayId) return undefined;
    let day = days.find(d => d.id === item.dayId);
    if (day) return day;
    day = days.find(d => d.id.includes(item.dayId) || item.dayId.includes(d.id));
    if (day) return day;
    const match = item.dayId.match(/day-?(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      day = days.find(d => Number(d.dayNumber) === num);
      if (day) return day;
    }
    return undefined;
  };

  // Upcoming activities sorted chronologically
  const sortedItems = [...items].sort((a, b) => {
    const dayA = getDayForItem(a);
    const dayB = getDayForItem(b);
    const numA = dayA ? Number(dayA.dayNumber) : 999;
    const numB = dayB ? Number(dayB.dayNumber) : 999;
    if (numA !== numB) return numA - numB;
    if (a.sortOrder !== undefined && b.sortOrder !== undefined && a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }
    return a.time.localeCompare(b.time);
  });
  const upcomingActivities = sortedItems.slice(0, 5);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return <Utensils className="w-4 h-4 text-orange-500" />;
      case 'Transport': return <Car className="w-4 h-4 text-blue-500" />;
      case 'Hotel': return <Hotel className="w-4 h-4 text-purple-500" />;
      case 'Shopping': return <ShoppingBag className="w-4 h-4 text-pink-500" />;
      default: return <Compass className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 🌟 Top Section: Customizable Instagram Travel Gallery Showcase */}
      <div className="bg-card-pink rounded-3xl p-4 md:p-6 border border-card-pink shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-extrabold text-dark">
                Trip Highlights Gallery
              </h2>
              {/* Customizer Button right next to title */}
              <button
                type="button"
                onClick={() => setIsCustomizeModalOpen(true)}
                title="Atur Foto Highlight"
                className="p-1.5 px-3 rounded-full bg-rose-50 hover:bg-rose-100 text-primary-pink border border-rose-200 text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
              >
                <Settings className="w-3.5 h-3.5 text-primary-pink" />
                <span>Atur Foto</span>
              </button>
            </div>
            <p className="text-xs text-gray-custom mt-0.5">Atur & tampilkan momen foto impian perjalanan terbaikmu</p>
          </div>
        </div>

        {/* 🖼️ Customized Photo Grid Rendering */}
        {displayedPhotos.length > 0 ? (
          <div>
            {/* LAYOUT 1: HERO MOSAIC (1 Big Hero + 4 Balanced Cards on Right) */}
            {layoutStyle === 'hero-mosaic' && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                {/* Hero Main Cover Photo (Index 0) */}
                <div 
                  onClick={() => setLightboxImage(displayedPhotos[0].url)}
                  className="md:col-span-7 relative group rounded-3xl overflow-hidden cursor-pointer border border-card-pink shadow-sm h-64 md:h-[320px]"
                >
                  <img
                    src={displayedPhotos[0].url}
                    alt={displayedPhotos[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-4 md:p-5 flex flex-col justify-end">
                    <h3 className="text-base md:text-lg font-black text-white drop-shadow-md">
                      {displayedPhotos[0].title}
                    </h3>
                  </div>
                </div>

                {/* Right Side 2x2 Grid for Remaining 4 Photos */}
                <div className="md:col-span-5 grid grid-cols-2 gap-2.5 h-64 md:h-[320px]">
                  {displayedPhotos.slice(1, 5).map((photo, idx) => (
                    <div
                      key={photo.id || idx}
                      onClick={() => setLightboxImage(photo.url)}
                      className="relative group rounded-2xl overflow-hidden cursor-pointer border border-card-pink shadow-2xs h-full min-h-[120px]"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                        <span className="text-[9px] font-extrabold text-rose-300 uppercase tracking-wider">
                          {photo.category}
                        </span>
                        <h4 className="text-xs font-bold text-white truncate drop-shadow-xs">
                          {photo.title}
                        </h4>
                      </div>
                    </div>
                  ))}

                  {/* Filler placeholder if fewer than 5 photos */}
                  {Array.from({ length: Math.max(0, 4 - displayedPhotos.slice(1, 5).length) }).map((_, i) => (
                    <div 
                      key={`fill-${i}`}
                      onClick={() => setIsCustomizeModalOpen(true)}
                      className="rounded-2xl border-2 border-dashed border-card-pink bg-surface-muted hover:bg-soft-pink/40 flex flex-col items-center justify-center p-3 cursor-pointer text-center text-gray-custom/70 hover:text-primary-pink transition-all"
                    >
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[11px] font-bold">+ Tambah Slot</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LAYOUT 2: EQUAL UNIFORM GRID (4 or 6 Equal Cards) */}
            {layoutStyle === 'equal-grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
                {displayedPhotos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    onClick={() => setLightboxImage(photo.url)}
                    className="relative group rounded-2xl overflow-hidden cursor-pointer border border-card-pink shadow-2xs h-40 md:h-48"
                  >
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-85 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-end">
                      <span className="text-[9px] font-extrabold text-white/80 uppercase tracking-wider">
                        {photo.category}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate drop-shadow-xs">
                        {photo.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* LAYOUT 3: BANNER SHOWCASE */}
            {layoutStyle === 'banner' && (
              <div className="space-y-3 pt-1">
                <div 
                  onClick={() => setLightboxImage(displayedPhotos[0].url)}
                  className="relative group rounded-3xl overflow-hidden cursor-pointer border border-card-pink shadow-sm h-56 md:h-72 w-full"
                >
                  <img
                    src={displayedPhotos[0].url}
                    alt={displayedPhotos[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 md:p-6 flex flex-col justify-end">
                    <h3 className="text-lg md:text-2xl font-black text-white">{displayedPhotos[0].title}</h3>
                  </div>
                </div>

                {displayedPhotos.length > 1 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {displayedPhotos.slice(1, 5).map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        onClick={() => setLightboxImage(photo.url)}
                        className="relative group rounded-2xl overflow-hidden cursor-pointer border border-card-pink shadow-2xs h-28 md:h-36"
                      >
                        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                          <p className="text-xs font-bold text-white truncate">{photo.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div 
            onClick={() => setIsCustomizeModalOpen(true)}
            className="p-6 md:p-8 rounded-2xl border-2 border-dashed border-card-pink bg-surface-muted hover:bg-soft-pink/40 cursor-pointer transition-all text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-soft-pink text-primary-pink flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-extrabold text-dark">Atur Galeri Foto Highlight</h4>
            <p className="text-xs text-gray-custom mt-1 max-w-sm mx-auto">
              Klik untuk memilih foto perjalanan dari Itinerary, Moodboard, atau upload foto langsung untuk ditampilkan di sini.
            </p>
            <span className="inline-block mt-3 px-4 py-1.5 rounded-full bg-primary-pink text-white text-xs font-bold shadow-xs">
              ⚙️ Atur Gallery Sekarang
            </span>
          </div>
        )}
      </div>

      {/* 4 Core Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Stat 1: Duration */}
        <div className="bg-card-pink p-4 md:p-5 rounded-2xl border border-card-pink shadow-xs flex items-center justify-between hover:border-primary-pink/50 transition-all">
          <div>
            <span className="text-[11px] font-bold text-gray-custom uppercase tracking-wider">Durasi Perjalanan</span>
            <h3 className="text-lg md:text-xl font-black text-dark mt-0.5">{duration} Hari</h3>
            <p className="text-xs font-semibold text-primary-pink mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-primary-pink animate-pulse" />
              <span>{daysToGo > 0 ? `${daysToGo} Hari Lagi` : 'Trip Sedang Berjalan'}</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-primary-pink flex items-center justify-center shrink-0 border border-rose-100">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 2: Budget */}
        <div className="bg-card-pink p-4 md:p-5 rounded-2xl border border-card-pink shadow-xs flex flex-col justify-between hover:border-primary-pink/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-gray-custom uppercase tracking-wider">Pengeluaran Trip</span>
              <h3 className="text-lg md:text-xl font-black text-dark mt-0.5">{formatCurrency(calculatedActualSpent, trip.currency)}</h3>
              <p className="text-xs text-gray-custom mt-0.5">dari {formatCurrency(trip.budget, trip.currency)}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <span className="text-base font-black">{getCurrencySymbol(trip.currency)}</span>
            </div>
          </div>
          <div className="w-full bg-surface-muted h-1.5 rounded-full overflow-hidden mt-3">
            <div 
              className="bg-primary-pink h-full rounded-full transition-all duration-500" 
              style={{ width: `${budgetSummary.spentPercentage}%` }} 
            />
          </div>
        </div>

        {/* Stat 3: Bookings */}
        <div className="bg-card-pink p-4 md:p-5 rounded-2xl border border-card-pink shadow-xs flex items-center justify-between hover:border-primary-pink/50 transition-all">
          <div>
            <span className="text-[11px] font-bold text-gray-custom uppercase tracking-wider">Status Reservasi</span>
            <h3 className="text-lg md:text-xl font-black text-dark mt-0.5">{confirmedBookingsCount} Terkonfirmasi</h3>
            <p className="text-xs text-gray-custom mt-1">dari {bookings.length} hotel / tiket</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Stat 4: Travelers */}
        <div className="bg-card-pink p-4 md:p-5 rounded-2xl border border-card-pink shadow-xs flex items-center justify-between hover:border-primary-pink/50 transition-all">
          <div>
            <span className="text-[11px] font-bold text-gray-custom uppercase tracking-wider">Peserta Trip</span>
            <h3 className="text-lg md:text-xl font-black text-dark mt-0.5">{trip.travelersCount} Orang</h3>
            <p className="text-xs text-gray-custom mt-1 truncate max-w-[130px]">{trip.destination}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Preparation Progress Bar Widget */}
      <div className="bg-card-pink p-4 md:p-6 rounded-3xl border border-card-pink shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-extrabold text-sm md:text-base text-dark">Trip Preparation Checklist</h3>
            <p className="text-xs text-gray-custom">Progres kelengkapan dokumen, itinerary, & perlengkapan</p>
          </div>
          <div className="text-right">
            <span className="text-base md:text-xl font-black text-primary-pink">{prepPercentage}%</span>
            <p className="text-xs font-medium text-gray-custom">{completedTasks} dari {totalTasks} persiapan selesai</p>
          </div>
        </div>

        {/* Progress Fill Bar */}
        <div className="w-full h-3.5 bg-soft-pink rounded-full overflow-hidden p-0.5 border border-primary-pink/10">
          <div
            className="h-full bg-gradient-to-r from-primary-pink to-rose-500 transition-all duration-500 rounded-full"
            style={{ width: `${prepPercentage}%` }}
          />
        </div>

        {/* Task Pills Checklist */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-card-pink text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${items.length > 0 ? 'bg-primary-pink text-white' : 'bg-surface-muted text-gray-custom'}`}>
              ✓
            </div>
            <span className={items.length > 0 ? 'font-bold text-dark' : 'text-gray-custom/70 font-medium'}>
              Itinerary ({items.length} Agenda)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${confirmedBookingsCount > 0 ? 'bg-primary-pink text-white' : 'bg-surface-muted text-gray-custom'}`}>
              ✓
            </div>
            <span className={confirmedBookingsCount > 0 ? 'font-bold text-dark' : 'text-gray-custom/70 font-medium'}>
              Hotel/Tiket ({confirmedBookingsCount} Booked)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${expenses.length > 0 ? 'bg-primary-pink text-white' : 'bg-surface-muted text-gray-custom'}`}>
              ✓
            </div>
            <span className={expenses.length > 0 ? 'font-bold text-dark' : 'text-gray-custom/70 font-medium'}>
              Budget ({expenses.length} Trax)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${packingRatio >= 0.7 ? 'bg-primary-pink text-white' : 'bg-surface-muted text-gray-custom'}`}>
              ✓
            </div>
            <span className={packingRatio >= 0.7 ? 'font-bold text-dark' : 'text-gray-custom/70 font-medium'}>
              Bagasi ({packedCount}/{packing.length})
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Schedule & Visual Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left 2 Cols: Upcoming Activities Schedule */}
        <div className="lg:col-span-2 bg-card-pink p-4 md:p-6 rounded-3xl border border-card-pink shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-soft-pink text-primary-pink flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm md:text-base text-dark">Jadwal Mendatang</h3>
                <p className="text-[11px] text-gray-custom">Agenda terdekat sesuai urutan hari dan waktu</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('Itinerary')}
              className="text-xs font-bold text-primary-pink hover:underline flex items-center gap-1"
            >
              Lihat Itinerary Lengkap <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-custom/70">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-custom" />
              <p className="text-sm font-medium">Belum ada aktivitas di itinerary.</p>
              <button
                onClick={() => onNavigateTab('Itinerary')}
                className="mt-3 px-5 py-2.5 rounded-full bg-primary-pink text-white text-xs font-bold hover:bg-opacity-90 transition-all shadow-xs"
              >
                + Tambah Aktivitas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingActivities.map((act) => {
                const dayObj = getDayForItem(act);
                return (
                  <div 
                    key={act.id} 
                    className="p-3 md:p-4 rounded-3xl border border-card-pink hover:border-primary-pink bg-surface-muted hover:bg-soft-pink/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Photo Thumbnail or Category Avatar */}
                      {act.imageUrl ? (
                        <div 
                          onClick={() => setLightboxImage(act.imageUrl!)}
                          className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 cursor-pointer border border-card-pink group relative"
                        >
                          <img src={act.imageUrl} alt={act.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-card-pink border border-card-pink flex items-center justify-center shrink-0 shadow-2xs">
                          {getCategoryIcon(act.category)}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {dayObj && (
                            <span className="text-[10px] font-extrabold text-primary-pink bg-soft-pink px-2 py-0.5 rounded-lg border border-primary-pink/20">
                              Hari {dayObj.dayNumber}
                            </span>
                          )}
                          <span className="text-[11px] font-extrabold bg-primary-pink text-white px-2.5 py-0.5 rounded-full">
                            {act.time}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-dark">{act.title}</h4>
                        <p className="text-xs text-gray-custom flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary-pink shrink-0" />
                          <span>{act.location} • {act.duration}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-card-pink shrink-0">
                      <span className="text-xs font-black text-dark">
                        {formatCurrency(act.estimatedCost, trip.currency)}
                      </span>
                      <button
                        onClick={() => onNavigateTab('Itinerary')}
                        className="text-[11px] font-bold text-primary-pink hover:underline flex items-center gap-0.5"
                      >
                        Detail <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Quick Action Visual Cards */}
        <div className="bg-card-pink p-4 md:p-6 rounded-3xl border border-card-pink shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm md:text-base text-dark">Kartu Aksi Cepat</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
              {/* Tile 1: Itinerary */}
              <div
                onClick={() => onNavigateTab('Itinerary')}
                className="p-3.5 rounded-2xl border border-card-pink hover:border-primary-pink bg-gradient-to-r from-rose-50/50 to-pink-50/50 hover:from-rose-100/50 hover:to-pink-100/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-pink text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-dark">Itinerary Planner</h4>
                    <p className="text-[11px] text-gray-custom">{items.length} Agenda tersimpan</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-primary-pink group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Tile 2: Bookings */}
              <div
                onClick={() => onNavigateTab('Bookings')}
                className="p-3.5 rounded-2xl border border-card-pink hover:border-primary-pink bg-gradient-to-r from-emerald-50/50 to-teal-50/50 hover:from-emerald-100/50 hover:to-teal-100/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Hotel className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-dark">Hotels & Tiket</h4>
                    <p className="text-[11px] text-gray-custom">{confirmedBookingsCount} Terkonfirmasi</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Tile 3: Budget */}
              <div
                onClick={() => onNavigateTab('Budget')}
                className="p-3.5 rounded-2xl border border-card-pink hover:border-primary-pink bg-gradient-to-r from-amber-50/50 to-yellow-50/50 hover:from-amber-100/50 hover:to-yellow-100/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-dark">Anggaran Budget</h4>
                    <p className="text-[11px] text-gray-custom">{formatCurrency(budgetSummary.remainingBudget, trip.currency)} sisa</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Tile 4: Packing */}
              <div
                onClick={() => onNavigateTab('Packing')}
                className="p-3.5 rounded-2xl border border-card-pink hover:border-primary-pink bg-gradient-to-r from-purple-50/50 to-indigo-50/50 hover:from-purple-100/50 hover:to-indigo-100/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Luggage className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-dark">Ceklist Bagasi</h4>
                    <p className="text-[11px] text-gray-custom">{packedCount} dari {packing.length} barang siap</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-soft-pink/50 border border-card-pink text-[11px] text-dark font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary-pink shrink-0" />
            <span>Unggah tiket & voucher di tab Bookings agar selalu siap di HP-mu!</span>
          </div>
        </div>
      </div>

      {/* ⚙️ Customize Photo Gallery Manager Modal */}
      {isCustomizeModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 md:p-5 animate-fade-in">
          <div className="bg-card-pink rounded-3xl max-w-2xl w-full p-5 md:p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-card-pink pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-pink text-white flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-dark">Atur Highlight Foto Overview</h3>
                  <p className="text-xs text-gray-custom">Pilih, atur urutan, atau tambah foto baru ke galeri utama</p>
                </div>
              </div>
              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                aria-label="Tutup"
                className="p-2 rounded-full hover:bg-surface-muted text-gray-custom transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex rounded-2xl bg-surface-muted p-1 gap-1 border border-card-pink text-[11px] md:text-xs font-extrabold overflow-x-auto">
              <button
                onClick={() => setActiveCustomizeTab('select')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeCustomizeTab === 'select' ? 'bg-card-pink text-primary-pink shadow-xs' : 'text-gray-custom hover:text-dark'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Atur & Hapus ({orderedHighlightPhotos.length})</span>
              </button>

              <button
                onClick={() => setActiveCustomizeTab('import')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeCustomizeTab === 'import' ? 'bg-card-pink text-primary-pink shadow-xs' : 'text-gray-custom hover:text-dark'
                }`}
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Import dari Project ({availablePhotos.length})</span>
              </button>

              <button
                onClick={() => setActiveCustomizeTab('add')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeCustomizeTab === 'add' ? 'bg-card-pink text-primary-pink shadow-xs' : 'text-gray-custom hover:text-dark'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Upload Baru</span>
              </button>

              <button
                onClick={() => setActiveCustomizeTab('layout')}
                className={`flex-1 py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                  activeCustomizeTab === 'layout' ? 'bg-card-pink text-primary-pink shadow-xs' : 'text-gray-custom hover:text-dark'
                }`}
              >
                <Layout className="w-3.5 h-3.5" />
                <span>Layout Grid</span>
              </button>
            </div>

            {/* TAB 1: Arrange & Reorder Photos */}
            {activeCustomizeTab === 'select' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-custom">
                  <span>Urutan paling atas (#1) akan jadi <b>Cover Utama / Hero Card</b></span>
                  <button
                    onClick={handleResetToDefault}
                    className="text-primary-pink hover:underline font-bold flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Urutan</span>
                  </button>
                </div>

                {orderedHighlightPhotos.length === 0 ? (
                  <div className="text-center py-8 text-gray-custom/70 border-2 border-dashed border-card-pink rounded-2xl p-4">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-custom" />
                    <p className="text-xs font-bold text-gray-custom">Belum ada foto yang dipasang di Galeri Overview.</p>
                    <p className="text-[11px] text-gray-custom/70 mt-0.5">Gunakan tab <b>Import dari Project</b> atau <b>+ Upload Baru</b> untuk menambah foto.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                    {orderedHighlightPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className={`p-2.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          index === 0
                            ? 'border-primary-pink bg-rose-50/40 shadow-xs'
                            : 'border-card-pink bg-card-pink hover:border-card-pink'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                            index === 0 ? 'bg-primary-pink text-white' : 'bg-surface-muted text-gray-custom'
                          }`}>
                            {index + 1}
                          </span>

                          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-card-pink bg-surface-muted">
                            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              {index === 0 && (
                                <span className="text-[9px] font-black bg-primary-pink text-white px-2 py-0.5 rounded-md">
                                  ⭐ COVER UTAMA
                                </span>
                              )}
                              <span className="text-[10px] font-extrabold text-gray-custom uppercase">
                                {photo.category}
                              </span>
                            </div>
                            <h4 className="text-xs font-extrabold text-dark mt-0.5 truncate max-w-[180px] sm:max-w-[220px]">
                              {photo.title}
                            </h4>
                          </div>
                        </div>

                        {/* Action Controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          {index !== 0 && (
                            <button
                              onClick={() => handleSetAsHero(index)}
                              className="p-1.5 rounded-lg bg-soft-pink text-primary-pink hover:bg-primary-pink hover:text-white transition-colors text-[10px] font-bold flex items-center gap-1"
                              title="Jadikan Cover Utama"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Set Hero</span>
                            </button>
                          )}

                          <button
                            disabled={index === 0}
                            onClick={() => handleMovePhoto(index, 'up')}
                            className="p-1.5 rounded-lg border border-card-pink text-gray-custom hover:bg-surface-muted disabled:opacity-30"
                            title="Naikkan Urutan"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          <button
                            disabled={index === orderedHighlightPhotos.length - 1}
                            onClick={() => handleMovePhoto(index, 'down')}
                            className="p-1.5 rounded-lg border border-card-pink text-gray-custom hover:bg-surface-muted disabled:opacity-30"
                            title="Turunkan Urutan"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeletePhoto(photo.id, photo.url)}
                            aria-label="Hapus foto dari Overview"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Hapus foto dari Overview"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Import Photos from Places / Itinerary / Project */}
            {activeCustomizeTab === 'import' && (
              <div className="space-y-3">
                <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-100 text-xs text-dark">
                  <p className="font-semibold">
                    💡 Pilih & Impor foto yang sudah pernah Anda upload di tab <b>Places (Tempat Wisata)</b>, <b>Itinerary (Rencana)</b>, <b>Moodboard</b>, atau <b>Booking</b> di project ini.
                  </p>
                </div>

                {/* Source Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setImportSourceFilter('all')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      importSourceFilter === 'all'
                        ? 'bg-primary-pink text-white shadow-2xs'
                        : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
                    }`}
                  >
                    Semua ({availablePhotos.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportSourceFilter('place')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      importSourceFilter === 'place'
                        ? 'bg-primary-pink text-white shadow-2xs'
                        : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
                    }`}
                  >
                    Places ({availablePhotos.filter(p => p.sourceType === 'place').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportSourceFilter('itinerary')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      importSourceFilter === 'itinerary'
                        ? 'bg-primary-pink text-white shadow-2xs'
                        : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
                    }`}
                  >
                    Itinerary ({availablePhotos.filter(p => p.sourceType === 'itinerary').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportSourceFilter('moodboard')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      importSourceFilter === 'moodboard'
                        ? 'bg-primary-pink text-white shadow-2xs'
                        : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
                    }`}
                  >
                    Moodboard ({availablePhotos.filter(p => p.sourceType === 'moodboard').length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setImportSourceFilter('booking')}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                      importSourceFilter === 'booking'
                        ? 'bg-primary-pink text-white shadow-2xs'
                        : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
                    }`}
                  >
                    Voucher ({availablePhotos.filter(p => p.sourceType === 'booking' || p.sourceType === 'note').length})
                  </button>
                </div>

                {/* Photos Grid */}
                {availablePhotos.length === 0 ? (
                  <div className="text-center py-8 text-gray-custom/70 border-2 border-dashed border-card-pink rounded-2xl p-4">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-custom" />
                    <p className="text-xs font-semibold">Belum ada foto tersimpan di Places / Itinerary project ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 pt-1">
                    {availablePhotos
                      .filter(photo => {
                        if (importSourceFilter === 'all') return true;
                        if (importSourceFilter === 'booking') return photo.sourceType === 'booking' || photo.sourceType === 'note';
                        return photo.sourceType === importSourceFilter;
                      })
                      .map(photo => {
                        const isImported = orderedHighlightPhotos.some(p => p.id === photo.id || p.url === photo.url);
                        return (
                          <div
                            key={photo.id}
                            className={`p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                              isImported ? 'border-emerald-300 bg-emerald-50/20' : 'border-card-pink bg-card-pink hover:border-card-pink'
                            }`}
                          >
                            <div className="space-y-1.5">
                              <div className="relative rounded-xl overflow-hidden h-28 bg-surface-muted border border-card-pink">
                                <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                                <span className="absolute top-1.5 left-1.5 text-[9px] font-black bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                                  {photo.category}
                                </span>
                              </div>
                              <h5 className="text-xs font-extrabold text-dark truncate" title={photo.title}>
                                {photo.title}
                              </h5>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleImportPhoto(photo)}
                              className={`mt-2 w-full py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition-all flex items-center justify-center gap-1 ${
                                isImported
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300 border border-emerald-200'
                                  : 'bg-primary-pink text-white hover:bg-opacity-90 shadow-2xs'
                              }`}
                            >
                              {isImported ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                                  <span>Terpasang (Hapus)</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Import ke Overview</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Upload New Custom Photo */}
            {activeCustomizeTab === 'add' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-dark">Pilih / Unggah Gambar dari HP/Laptop</label>
                  <label className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-card-pink hover:border-primary-pink cursor-pointer bg-surface-muted hover:bg-soft-pink/30 transition-all text-xs font-bold text-gray-custom ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="w-6 h-6 text-primary-pink mb-1" />
                    <span>{isUploading ? 'Memproses gambar...' : 'Klik untuk Unggah Gambar dari Perangkat'}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-dark">Atau Tempel URL Gambar</label>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={e => setNewPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2.5 rounded-xl border border-card-pink bg-screen-pink text-xs font-medium"
                  />
                </div>

                {newPhotoUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-card-pink h-36 bg-surface-muted">
                    <img src={newPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark mb-1">Judul / Lokasi Foto</label>
                    <input
                      type="text"
                      value={newPhotoTitle}
                      onChange={e => setNewPhotoTitle(e.target.value)}
                      placeholder="e.g. Spot Foto De Djawatan"
                      className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark mb-1">Kategori Badge</label>
                    <input
                      type="text"
                      value={newPhotoCategory}
                      onChange={e => setNewPhotoCategory(e.target.value)}
                      placeholder="e.g. Spot Impian, Sunset, Jeep"
                      className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink text-xs font-medium"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!newPhotoUrl.trim() || isUploading}
                  onClick={handleAddCustomPhoto}
                  className="w-full py-3 rounded-2xl bg-primary-pink text-white font-bold text-xs hover:bg-opacity-90 disabled:opacity-50 transition-all shadow-xs"
                >
                  + Tambahkan ke Galeri Highlight
                </button>
              </div>
            )}

            {/* TAB 3: Select Grid Layout */}
            {activeCustomizeTab === 'layout' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold text-dark mb-2">Pilih Tampilan Layout Grid</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1 */}
                  <div
                    onClick={() => saveLayoutStyle('hero-mosaic')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                      layoutStyle === 'hero-mosaic' ? 'border-primary-pink bg-rose-50/50 shadow-xs' : 'border-card-pink hover:border-card-pink bg-card-pink'
                    }`}
                  >
                    <div className="h-16 bg-surface-muted rounded-xl grid grid-cols-12 gap-1 p-1">
                      <div className="col-span-7 bg-primary-pink/30 rounded-lg flex items-center justify-center text-[9px] font-black text-primary-pink">
                        HERO
                      </div>
                      <div className="col-span-5 grid grid-cols-2 gap-1">
                        <div className="bg-surface-muted rounded-md" />
                        <div className="bg-surface-muted rounded-md" />
                        <div className="bg-surface-muted rounded-md" />
                        <div className="bg-surface-muted rounded-md" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-dark">Magazine Hero Mosaic</h4>
                      <p className="text-[10px] text-gray-custom">1 Cover Besar di kiri + 4 kartu seimbang di kanan</p>
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div
                    onClick={() => saveLayoutStyle('equal-grid')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                      layoutStyle === 'equal-grid' ? 'border-primary-pink bg-rose-50/50 shadow-xs' : 'border-card-pink hover:border-card-pink bg-card-pink'
                    }`}
                  >
                    <div className="h-16 bg-surface-muted rounded-xl grid grid-cols-3 gap-1 p-1">
                      <div className="bg-primary-pink/30 rounded-md" />
                      <div className="bg-surface-muted rounded-md" />
                      <div className="bg-surface-muted rounded-md" />
                      <div className="bg-surface-muted rounded-md" />
                      <div className="bg-surface-muted rounded-md" />
                      <div className="bg-surface-muted rounded-md" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-dark">Equal Uniform Grid</h4>
                      <p className="text-[10px] text-gray-custom">Grid simetris ukuran seragam (6 kartu)</p>
                    </div>
                  </div>

                  {/* Option 3 */}
                  <div
                    onClick={() => saveLayoutStyle('banner')}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 ${
                      layoutStyle === 'banner' ? 'border-primary-pink bg-rose-50/50 shadow-xs' : 'border-card-pink hover:border-card-pink bg-card-pink'
                    }`}
                  >
                    <div className="h-16 bg-surface-muted rounded-xl space-y-1 p-1">
                      <div className="h-9 bg-primary-pink/30 rounded-md flex items-center justify-center text-[9px] font-black text-primary-pink">
                        WIDE BANNER
                      </div>
                      <div className="h-4 grid grid-cols-4 gap-1">
                        <div className="bg-surface-muted rounded-xs" />
                        <div className="bg-surface-muted rounded-xs" />
                        <div className="bg-surface-muted rounded-xs" />
                        <div className="bg-surface-muted rounded-xs" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-dark">Panoramic Banner</h4>
                      <p className="text-[10px] text-gray-custom">Banner sinematik lebar di bagian atas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-card-pink flex justify-end">
              <button
                onClick={() => setIsCustomizeModalOpen(false)}
                className="px-6 py-2.5 rounded-full bg-primary-pink text-white text-xs font-extrabold hover:bg-gray-800 transition-all shadow-xs"
              >
                Simpan & Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal for Photos */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImage(null)}
              aria-label="Tutup lightbox"
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={lightboxImage} alt="Enlarged photo preview" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};






