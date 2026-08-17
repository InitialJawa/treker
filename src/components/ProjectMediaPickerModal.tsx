import React, { useState, useMemo } from 'react';
import { X, Search, Camera, Check, FolderPlus, ImageIcon, MapPin, Calendar, Hotel, Trash2 } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { useToast } from '../context/ToastContext';
import { ConfirmDialog } from './ui';

export interface AvailableProjectPhoto {
  id: string;
  url: string;
  title: string;
  category: string;
  sourceType: 'place' | 'itinerary' | 'moodboard' | 'booking' | 'note' | 'cover';
  targetId: string;
  isMainPlaceImage?: boolean;
}

interface ProjectMediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  currentImageUrl?: string;
  title?: string;
}

export const ProjectMediaPickerModal: React.FC<ProjectMediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  currentImageUrl,
  title = 'Pilih Foto dari Project'
}) => {
  const {
    trip,
    days,
    places,
    moodboardItems,
    bookings,
    notes,
    updateTrip,
    updatePlace,
    updateItineraryItem,
    deleteMoodboardItem,
    updateBooking,
    updateNote
  } = useTripContext();

  const [activeFilter, setActiveFilter] = useState<'all' | 'place' | 'itinerary' | 'moodboard' | 'booking' | 'note' | 'cover'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [photoToDelete, setPhotoToDelete] = useState<AvailableProjectPhoto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();

  // Collect all images uploaded across all tabs in this project
  const availablePhotos = useMemo(() => {
    const list: AvailableProjectPhoto[] = [];
    const seenUrls = new Set<string>();

    const addPhoto = (photo: AvailableProjectPhoto) => {
      if (!photo.url || seenUrls.has(photo.url)) return;
      seenUrls.add(photo.url);
      list.push(photo);
    };

    // 1. Cover Image
    if (trip?.coverImage) {
      addPhoto({
        id: `cover-${trip.id}`,
        url: trip.coverImage,
        title: trip.destination || 'Cover Trip',
        category: 'Cover Trip',
        sourceType: 'cover',
        targetId: trip.id
      });
    }

    // 2. Places / Spots Impian
    places?.forEach((p) => {
      if (p.imageUrl) {
        addPhoto({
          id: `place-${p.id}`,
          url: p.imageUrl,
          title: p.name,
          category: p.category || 'Spot Impian',
          sourceType: 'place',
          targetId: p.id,
          isMainPlaceImage: true
        });
      }
      p.photos?.forEach((phUrl, idx) => {
        addPhoto({
          id: `place-${p.id}-extra-${idx}`,
          url: phUrl,
          title: `${p.name} #${idx + 1}`,
          category: 'Spot Impian',
          sourceType: 'place',
          targetId: p.id,
          isMainPlaceImage: false
        });
      });
    });

    // 3. Itinerary / Rencana Harian
    days?.forEach((d) => {
      d.items?.forEach((item) => {
        if (item.imageUrl) {
          addPhoto({
            id: `item-${item.id}`,
            url: item.imageUrl,
            title: item.title,
            category: `Day ${d.dayNumber}: ${d.title}`,
            sourceType: 'itinerary',
            targetId: item.id
          });
        }
      });
    });

    // 4. Moodboard
    moodboardItems?.forEach((m) => {
      const img = m.imageUrl || m.url;
      if (img) {
        addPhoto({
          id: `mood-${m.id}`,
          url: img,
          title: m.title || 'Moodboard',
          category: 'Moodboard',
          sourceType: 'moodboard',
          targetId: m.id
        });
      }
    });

    // 5. Bookings / Tiket / Hotel
    bookings?.forEach((b) => {
      if (b.imageUrl) {
        addPhoto({
          id: `booking-${b.id}`,
          url: b.imageUrl,
          title: b.name,
          category: 'Voucher / Booking',
          sourceType: 'booking',
          targetId: b.id
        });
      }
    });

    // 6. Notes
    notes?.forEach((n) => {
      if (n.imageUrl) {
        addPhoto({
          id: `note-${n.id}`,
          url: n.imageUrl,
          title: n.title,
          category: 'Catatan',
          sourceType: 'note',
          targetId: n.id
        });
      }
    });

    return list;
  }, [trip, days, places, moodboardItems, bookings, notes]);

  // Filtered photos based on tab and search
  const filteredPhotos = useMemo(() => {
    return availablePhotos.filter((p) => {
      const matchesFilter = activeFilter === 'all' || p.sourceType === activeFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [availablePhotos, activeFilter, searchQuery]);

  // Handle Photo Deletion across source models
  const handleDeletePhoto = async (e: React.MouseEvent, photo: AvailableProjectPhoto) => {
    e.stopPropagation();
    setPhotoToDelete(photo);
  };

  const confirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    setIsDeleting(true);
    const photo = photoToDelete;
    try {
      if (photo.sourceType === 'cover') {
        if (trip) await updateTrip(trip.id, { coverImage: '' });
      } else if (photo.sourceType === 'place') {
        const place = places.find((p) => p.id === photo.targetId);
        if (place) {
          if (photo.isMainPlaceImage) {
            await updatePlace(place.id, { imageUrl: '' });
          } else {
            const updatedPhotos = (place.photos || []).filter((u) => u !== photo.url);
            await updatePlace(place.id, { photos: updatedPhotos });
          }
        }
      } else if (photo.sourceType === 'itinerary') {
        await updateItineraryItem(photo.targetId, { imageUrl: '' });
      } else if (photo.sourceType === 'moodboard') {
        await deleteMoodboardItem(photo.targetId);
      } else if (photo.sourceType === 'booking') {
        await updateBooking(photo.targetId, { imageUrl: '' });
      } else if (photo.sourceType === 'note') {
        await updateNote(photo.targetId, { imageUrl: '' });
      }
      showToast('Foto berhasil dihapus.');
      setPhotoToDelete(null);
    } catch (err) {
      console.error('Error deleting photo:', err);
      showToast('Gagal menghapus foto.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-card-pink rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative border border-card-pink flex flex-col max-h-[90vh] animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-card-pink">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-primary-pink rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-dark">{title}</h3>
              <p className="text-xs text-gray-custom">
                Pilih atau hapus dari {availablePhotos.length} foto yang ada di folder project ini
              </p>
            </div>
          </div>
          <button aria-label="Tutup"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-muted text-gray-custom/70 hover:text-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="py-3 space-y-2.5">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-custom/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari foto berdasarkan nama tempat/aktivitas..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-muted border border-card-pink text-xs font-medium text-dark focus:bg-card-pink focus:border-primary-pink focus:outline-none transition-all"
            />
          </div>

          {/* Source Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all ${
                activeFilter === 'all'
                  ? 'bg-primary-pink text-white shadow-2xs'
                  : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
              }`}
            >
              Semua ({availablePhotos.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('place')}
              className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeFilter === 'place'
                  ? 'bg-primary-pink text-white shadow-2xs'
                  : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Places ({availablePhotos.filter((p) => p.sourceType === 'place').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('itinerary')}
              className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeFilter === 'itinerary'
                  ? 'bg-primary-pink text-white shadow-2xs'
                  : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Itinerary ({availablePhotos.filter((p) => p.sourceType === 'itinerary').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('moodboard')}
              className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeFilter === 'moodboard'
                  ? 'bg-primary-pink text-white shadow-2xs'
                  : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Moodboard ({availablePhotos.filter((p) => p.sourceType === 'moodboard').length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('booking')}
              className={`px-3 py-1.5 rounded-xl font-extrabold whitespace-nowrap transition-all flex items-center gap-1 ${
                activeFilter === 'booking'
                  ? 'bg-primary-pink text-white shadow-2xs'
                  : 'bg-surface-muted text-gray-custom hover:bg-surface-muted'
              }`}
            >
              <Hotel className="w-3.5 h-3.5" />
              <span>Voucher ({availablePhotos.filter((p) => p.sourceType === 'booking' || p.sourceType === 'note').length})</span>
            </button>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-1">
          {filteredPhotos.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-card-pink rounded-2xl p-6">
              <Camera className="w-10 h-10 mx-auto mb-2 text-gray-custom" />
              <p className="text-xs font-bold text-gray-custom">Tidak ada foto ditemukan.</p>
              <p className="text-[11px] text-gray-custom/70 mt-1">
                {searchQuery ? 'Coba ubah kata kunci pencarian Anda.' : 'Belum ada foto tersimpan di folder tab ini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredPhotos.map((photo) => {
                const isSelected = currentImageUrl === photo.url;
                return (
                  <div
                    key={photo.id}
                    onClick={() => {
                      onSelectImage(photo.url);
                      onClose();
                    }}
                    className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                      isSelected
                        ? 'border-primary-pink ring-2 ring-rose-200 shadow-md'
                        : 'border-card-pink hover:border-card-pink'
                    }`}
                  >
                    <div className="h-32 bg-surface-muted relative overflow-hidden">
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Handle broken image fallback display gracefully
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-black bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-xs uppercase z-10">
                        {photo.category}
                      </span>

                      {/* Top Right Action Buttons: Selected Checkmark & Delete Icon */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                        {isSelected && (
                          <div className="w-6 h-6 bg-primary-pink text-white rounded-full flex items-center justify-center shadow-md">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={(e) => handleDeletePhoto(e, photo)}
                          title="Hapus foto ini dari project"
                          className="p-1.5 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-md transition-all hover:scale-110 flex items-center justify-center group-hover:opacity-100 opacity-90"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-card-pink flex items-center justify-between gap-1">
                      <h5 className="text-xs font-bold text-dark truncate flex-1" title={photo.title}>
                        {photo.title}
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-card-pink flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-card-pink text-xs font-bold text-gray-custom hover:bg-surface-muted transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      open={!!photoToDelete}
      title="Hapus Foto"
      message={photoToDelete ? `Hapus foto "${photoToDelete.title}" ini dari folder project?` : ''}
      confirmLabel="Hapus"
      onConfirm={confirmDeletePhoto}
      onCancel={() => setPhotoToDelete(null)}
      loading={isDeleting}
    />
    </>
  );
};
