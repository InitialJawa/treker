import React, { useState, useRef } from 'react';
import { ArrowLeft, Share2, Printer, Edit3, Calendar, MapPin, Users, DollarSign, Heart, Trash2, Copy, AlertTriangle, Check, UserPlus, X, Globe, Shield, Upload, Lock } from 'lucide-react';
import { Trip } from '../types/travel';
import { useTripContext } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDateRange, formatCurrency } from '../utils/formatters';
import { resizeImage } from '../utils/imageUtils';
import { getBadgeData, getTripTimeStatus, getTripStatusLabel, isTemplateReadOnly } from '../utils/tripBadges';
import { banyuwangiTrip, banyuwangiDays, banyuwangiItems, banyuwangiPlaces } from '../data/banyuwangiTemplate';

// Tabs
import { TabOverview } from './workspace/TabOverview';
import { TabMoodboard } from './workspace/TabMoodboard';
import { TabItinerary } from './workspace/TabItinerary';
import { TabBudget } from './workspace/TabBudget';
import { TabBookings } from './workspace/TabBookings';
import { TabPlaces } from './workspace/TabPlaces';
import { TabTransport } from './workspace/TabTransport';
import { TabPacking } from './workspace/TabPacking';
import { TabNotes } from './workspace/TabNotes';
import { ExportPdfModal } from './ExportPdfModal';

interface TripWorkspaceViewProps {
  trip: Trip;
  onBackToDashboard: () => void;
}

export const TripWorkspaceView: React.FC<TripWorkspaceViewProps> = ({
  trip,
  onBackToDashboard,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    itineraryDays,
    itineraryItems,
    bookings,
    packingItems,
    expenses,
    places,
    transports,
    notes,
    moodboardItems,
    toggleTripFavorite,
    deleteTrip,
    duplicateTrip,
    shareTripWithCollaborator,
    removeCollaborator,
    updateTrip,
    toggleTripTemplate
  } = useTripContext();

  const isOwner = user?.uid === trip.userId;
  const isCollaborator = trip.collaborators?.includes(user?.email || '');
  const hasEditAccess = isOwner || isCollaborator;
  const isTemplateViewOnly = !hasEditAccess && trip.isTemplate;

  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDest, setEditDest] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editTravelers, setEditTravelers] = useState(1);
  const [editBudget, setEditBudget] = useState(0);

  const openEditTripModal = () => {
    setEditName(trip.name);
    setEditDest(trip.destination);
    setEditStart(trip.startDate);
    setEditEnd(trip.endDate);
    setEditTravelers(trip.travelersCount || 1);
    setEditBudget(trip.budget || 0);
    setNewCoverUrl(trip.coverImage || '');
    setIsEditTripModalOpen(true);
  };

  const handleEditTripSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasEditAccess) return;
    
    setIsSaving(true);
    
    const start = new Date(editStart);
    const end = new Date(editEnd);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    
    if (start.getFullYear() < 2000) {
      showToast('Tahun tidak valid. Masukkan tahun yang benar.', 'error');
      setIsSaving(false);
      return;
    }
    
    if (diffDays > 60) {
      showToast('Maksimal durasi trip adalah 60 hari. Silakan sesuaikan tanggal.', 'error');
      setIsSaving(false);
      return;
    }

    try {
      await updateTrip(trip.id, {
        name: editName,
        destination: editDest,
        startDate: editStart,
        endDate: editEnd,
        travelersCount: editTravelers,
        budget: editBudget
      });
      setIsEditTripModalOpen(false);
      showToast('Detail trip berhasil diperbarui!');
    } catch (e: any) {
      console.error(e);
      showToast('Gagal menyimpan perubahan: ' + (e.message || e), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Import Template Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importName, setImportName] = useState('');
  const [importStartDate, setImportStartDate] = useState('');
  const [importEndDate, setImportEndDate] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const openImportModal = () => {
    setImportName(`${trip.name} (Salin)`);
    setImportStartDate(trip.startDate);
    setImportEndDate(trip.endDate);
    setIsImportModalOpen(true);
  };

  const handleStartDateChange = (newStart: string) => {
    setImportStartDate(newStart);
    if (!newStart || isNaN(new Date(newStart).getTime())) return;
    if (trip.startDate && trip.endDate) {
      const oldStart = new Date(trip.startDate);
      const oldEnd = new Date(trip.endDate);
      const diffMs = oldEnd.getTime() - oldStart.getTime();
      
      const newStartObj = new Date(newStart);
      const newEndObj = new Date(newStartObj.getTime() + diffMs);
      if (!isNaN(newEndObj.getTime())) {
        setImportEndDate(newEndObj.toISOString().split('T')[0]);
      }
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsImporting(true);
    try {
      await duplicateTrip(trip.id, importName, importStartDate, importEndDate);
      setIsImportModalOpen(false);
      showToast('Template berhasil diimpor! Silakan kembali ke Dashboard.');
      setTimeout(() => {
        onBackToDashboard();
      }, 2500);
    } catch (err: any) {
      console.error(err);
      showToast('Gagal mengimpor template: ' + (err?.message || 'Terjadi kesalahan'), 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const [activeTab, setActiveTab] = useState('Overview');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isEditingCover, setIsEditingCover] = useState(false);
  const [newCoverUrl, setNewCoverUrl] = useState(trip.coverImage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSaveCover = async () => {
    if (newCoverUrl && newCoverUrl !== trip.coverImage) {
      await updateTrip(trip.id, { coverImage: newCoverUrl });
    }
    setIsEditingCover(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const dataUrl = await resizeImage(file, 1200); // 1200px max width for cover
      await updateTrip(trip.id, { coverImage: dataUrl });
      setIsEditingCover(false);
    } catch (error) {
      console.error('Failed to upload image:', error);
      showToast('Gagal mengunggah gambar. Pastikan format file sesuai.', 'error');
    } finally {
      setIsUploading(false);
    }
  };
  
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);

  const handleDuplicate = async () => {
    try {
      await duplicateTrip(trip.id);
      showToast(`Trip "${trip.name}" telah berhasil diduplikat!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collaboratorEmail.trim()) return;

    setShareLoading(true);
    try {
      await shareTripWithCollaborator(trip.id, collaboratorEmail.trim());
      showToast(`Akses trip berhasil dibagikan ke ${collaboratorEmail.trim()}`);
      setCollaboratorEmail('');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal membagikan trip: ' + (err?.message || 'Terjadi kesalahan'), 'error');
    } finally {
      setShareLoading(false);
    }
  };

  const handleRemoveCollab = async (email: string) => {
    try {
      await removeCollaborator(trip.id, email);
      showToast(`Kolaborator ${email} dihapus.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTemplate = async () => {
    try {
      await toggleTripTemplate(trip.id);
      showToast(trip.isTemplate ? 'Status template dinonaktifkan.' : 'Trip dijadikan template untuk dikopi user lain!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteConfirm = () => {
    deleteTrip(trip.id);
    setIsDeleteModalOpen(false);
    onBackToDashboard();
  };

  // Filter trip-specific items
  const matchesTripId = (targetTripId: string | undefined, currentTripId: string) => {
    if (!targetTripId) return false;
    if (targetTripId === currentTripId) return true;
    if (currentTripId.startsWith(targetTripId) || targetTripId.startsWith(currentTripId)) return true;
    if (targetTripId.toLowerCase().includes('banyuwangi') && currentTripId.toLowerCase().includes('banyuwangi')) return true;
    return false;
  };

  const tripMoodboards = moodboardItems.filter(m => matchesTripId(m.tripId, trip.id));
  const rawTripDays = itineraryDays.filter(d => matchesTripId(d.tripId, trip.id)).sort((a, b) => Number(a.dayNumber) - Number(b.dayNumber));
  const tripDays = rawTripDays.length > 0 ? rawTripDays : (trip.id.toLowerCase().includes('banyuwangi') ? banyuwangiDays : []);
  
  const rawTripItems = itineraryItems.filter(i => matchesTripId(i.tripId, trip.id));
  const tripItems = rawTripItems.length > 0 ? rawTripItems : (trip.id.toLowerCase().includes('banyuwangi') ? banyuwangiItems : []);
  
  const tripBookings = bookings.filter(b => matchesTripId(b.tripId, trip.id));
  const tripPacking = packingItems.filter(p => matchesTripId(p.tripId, trip.id));
  const tripExpenses = expenses.filter(e => matchesTripId(e.tripId, trip.id));
  const tripTransports = transports.filter(t => matchesTripId(t.tripId, trip.id));
  const rawTripPlaces = places.filter(p => !p.tripId || matchesTripId(p.tripId, trip.id));
  const tripPlaces = rawTripPlaces.length > 0 ? rawTripPlaces : (trip.id.toLowerCase().includes('banyuwangi') ? banyuwangiPlaces : []);
  const tripNotes = notes.filter(n => !n.tripId || matchesTripId(n.tripId, trip.id));

  const tabs = [
    'Overview',
    'Moodboard',
    'Itinerary',
    'Budget',
    'Bookings',
    'Places',
    'Transport',
    'Packing',
    'Notes'
  ];

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4">
        {/* Removed Back to Dashboard button */}

        <div className="flex items-center justify-between w-full md:w-auto gap-1 md:gap-2 whitespace-nowrap">
          <button
            onClick={() => toggleTripFavorite(trip.id)}
            title="Sukai Trip Ini"
            className="p-1.5 md:p-2.5 rounded-full bg-white hover:bg-soft-pink text-primary-pink shadow-sm transition-colors"
          >
            <Heart className={`w-3 h-3 md:w-4 md:h-4 ${trip.isFavorite ? 'fill-primary-pink' : ''}`} />
          </button>

          {isTemplateViewOnly ? (
            <button
              onClick={openImportModal}
              className="shrink-0 bg-primary-pink text-white px-3 py-1 md:px-5 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Copy className="w-3 h-3 md:w-4 md:h-4" />
              <span>Gunakan Template Ini</span>
            </button>
          ) : (
            <>
              {hasEditAccess && (
                <button
                  onClick={() => setIsShareModalOpen(true)}
                  className="bg-white hover:bg-soft-pink text-primary-pink px-2.5 py-1 md:px-4 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 transition-all shadow-sm"
                >
                  <UserPlus className="w-3 h-3 md:w-4 md:h-4" />
                  <span>Kolaborasi</span>
                  {trip.collaborators && trip.collaborators.length > 0 && (
                    <span className="bg-primary-pink text-white text-[10px] px-1.5 py-0.5 rounded-full font-black ml-0.5">
                      {trip.collaborators.length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={handleDuplicate}
                className="shrink-0 bg-white hover:bg-soft-pink text-primary-pink px-2.5 py-1 md:px-4 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5 transition-all shadow-sm"
              >
                <Copy className="w-3 h-3 md:w-4 md:h-4" />
                <span>Duplikat</span>
              </button>

              <button
                onClick={() => setIsExportModalOpen(true)}
                className="shrink-0 bg-primary-pink text-white px-2.5 py-1 md:px-4 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-1 md:gap-2 shadow-sm transition-all"
              >
                <Printer className="w-3 h-3 md:w-4 md:h-4" />
                <span>Cetak PDF</span>
              </button>

              {isOwner && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="shrink-0 bg-white hover:bg-red-50 text-red-500 p-1.5 md:px-4 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs flex items-center justify-center gap-1 md:gap-1.5 transition-all shadow-sm"
                >
                  <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hero Image Banner Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg h-64 md:h-80 group border-[6px] border-white">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        

        

        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getBadgeData(trip, user).bgClass} ${getBadgeData(trip, user).textClass}`}>
              {getBadgeData(trip, user).type === 'shared' ? <Users className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {getBadgeData(trip, user).label}
            </span>
            {isTemplateReadOnly(trip, user) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold">
                <Lock className="w-3 h-3" /> Hanya Bisa Dikopi
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold backdrop-blur-sm">
              {getTripStatusLabel(getTripTimeStatus(trip))}
            </span>
          </div>
          <h1 className="text-base md:text-lg md:text-4xl font-black tracking-tight flex items-center gap-3">
            {trip.name}
            {hasEditAccess && (
              <button onClick={openEditTripModal} aria-label="Edit detail trip" className="text-white hover:text-primary-pink transition-colors bg-white/20 hover:bg-white p-2 rounded-full backdrop-blur-sm shadow-sm" title="Edit Trip Details">
                <Edit3 className="w-5 h-5" />
              </button>
            )}
          </h1>
          <p className="text-[10px] md:text-sm font-semibold opacity-90 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-primary-pink" />
              {trip.destination}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-primary-pink" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-primary-pink" />
              {trip.travelersCount} Peserta
            </span>
          </p>
        </div>
      </div>

      {/* Horizontal Workspace Nav Tabs */}
      <div className="bg-white rounded-full border border-card-pink p-1.5 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 w-full min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 text-center px-3 md:px-4 py-3 rounded-full text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-primary-pink text-white shadow-md'
                    : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === 'Overview' && (
        <TabOverview
          trip={trip}
          days={tripDays}
          items={tripItems}
          bookings={tripBookings}
          packing={tripPacking}
          expenses={tripExpenses}
          transports={tripTransports}
          onNavigateTab={setActiveTab}
        />
      )}

{activeTab === 'Moodboard' && (
        <TabMoodboard
          trip={trip}
          items={tripMoodboards}
        />
      )}

      {activeTab === 'Itinerary' && (
        <TabItinerary
          trip={trip}
          days={tripDays}
          items={tripItems}
        />
      )}

      {activeTab === 'Budget' && (
        <TabBudget
          trip={trip}
          expenses={tripExpenses}
          itineraryItems={tripItems}
          bookings={tripBookings}
          transports={tripTransports}
        />
      )}

      {activeTab === 'Bookings' && (
        <TabBookings
          trip={trip}
          bookings={tripBookings}
        />
      )}

      {activeTab === 'Places' && (
        <TabPlaces
          trip={trip}
          places={places}
          days={tripDays}
        />
      )}

      {activeTab === 'Transport' && (
        <TabTransport
          trip={trip}
          transports={transports}
        />
      )}

      {activeTab === 'Packing' && (
        <TabPacking
          trip={trip}
          packing={tripPacking}
        />
      )}

      {activeTab === 'Notes' && (
        <TabNotes
          trip={trip}
          notes={notes}
        />
      )}

      {/* Export Modal */}
      <ExportPdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        trip={trip}
        days={tripDays}
        items={tripItems}
        bookings={tripBookings}
        expenses={tripExpenses}
        packing={tripPacking}
        transports={tripTransports}
      />

      {/* Share / Collaboration Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-3xl p-3 md:p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary-pink" />
                <h3 className="font-extrabold text-sm md:text-base text-dark">Bagikan Trip ke Akun Lain</h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Masukkan alamat email akun lain dalam project ini agar mereka dapat melihat dan mengedit trip <span className="font-bold text-dark">"{trip.name}"</span> secara real-time.
            </p>

            <form onSubmit={handleAddCollaborator} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={collaboratorEmail}
                  onChange={(e) => setCollaboratorEmail(e.target.value)}
                  placeholder="email.teman@gmail.com"
                  required
                  className="flex-1 px-3 md:px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-none focus:border-primary-pink bg-soft-pink"
                />
                <button
                  type="submit"
                  disabled={shareLoading}
                  className="shrink-0 bg-primary-pink hover:bg-primary-pink/90 text-white px-3 md:px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-500/20 active:scale-95 shrink-0"
                >
                  {shareLoading ? 'Menambahkan...' : 'Undang'}
                </button>
              </div>
            </form>

            {/* List of current collaborators */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-dark uppercase tracking-wider">
                Kolaborator Terdaftar ({trip.collaborators?.length || 0})
              </h4>
              {!trip.collaborators || trip.collaborators.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada kolaborator yang diundang.</p>
              ) : (
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {trip.collaborators.map((cEmail) => (
                    <div key={cEmail} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl text-xs font-medium">
                      <span className="text-dark truncate">{cEmail}</span>
                      <button
                        onClick={() => handleRemoveCollab(cEmail)}
                        className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Toggle Template Public */}
            <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-dark">Jadikan Template Publik</p>
                <p className="text-[10px] text-gray-400">Izinkan user lain mengkopi seluruh agenda trip ini</p>
              </div>
              <button
                type="button"
                onClick={handleToggleTemplate}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  trip.isTemplate ? 'bg-primary-pink' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    trip.isTemplate ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* Edit Trip Modal */}
      {isEditTripModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-3xl p-3 md:p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-dark">
                Edit Detail Trip
              </h3>
              <button 
                onClick={() => setIsEditTripModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleEditTripSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1">Nama Trip</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-offwhite border border-card-pink rounded-xl px-3 md:px-4 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1">Destinasi</label>
                <input
                  type="text"
                  required
                  value={editDest}
                  onChange={(e) => setEditDest(e.target.value)}
                  className="w-full bg-offwhite border border-card-pink rounded-xl px-3 md:px-4 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    min={editStart}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Jumlah Peserta</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editTravelers}
                    onChange={(e) => setEditTravelers(parseInt(e.target.value))}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-custom mb-1">Total Budget</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={editBudget}
                    onChange={(e) => setEditBudget(parseInt(e.target.value))}
                    className="w-full bg-offwhite border border-card-pink rounded-xl px-3 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block text-xs font-bold text-gray-custom mb-2 mt-2">Foto Cover Trip</label>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 w-full">
                    <input
                      type="text"
                      value={newCoverUrl}
                      onChange={(e) => setNewCoverUrl(e.target.value)}
                      placeholder="Paste Image URL here..."
                      className="flex-1 bg-offwhite border border-card-pink rounded-xl px-3 py-2 text-xs font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
                    />
                    <button 
                      type="button"
                      onClick={handleSaveCover}
                      className="shrink-0 bg-primary-pink text-white px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap hover:bg-opacity-90 transition-colors"
                    >
                      Save URL
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 md:gap-4 my-1">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">ATAU</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <div className="flex gap-2 w-full">
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={fileInputRef} 
                      className="hidden" 
                      onChange={handleFileUpload} 
                    />
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full bg-white border border-gray-200 text-dark px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-gray-50 disabled:opacity-70 transition-colors shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {isUploading ? 'Mengunggah...' : 'Upload dari Perangkat (Maks 5MB)'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full bg-primary-pink text-white rounded-xl py-3 text-sm font-extrabold shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Template Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-3xl p-3 md:p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-extrabold text-sm text-dark">
                Gunakan Template Ini
              </h3>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-custom mb-1">Nama Trip Baru</label>
                <input
                  type="text"
                  required
                  value={importName}
                  onChange={(e) => setImportName(e.target.value)}
                  className="w-full bg-offwhite border border-card-pink rounded-xl px-3 md:px-4 py-3 text-sm font-bold text-dark focus:outline-none focus:border-primary-pink transition-colors"
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
                  {isImporting ? 'Menyalin Template...' : 'Gunakan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-3xl p-3 md:p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-extrabold text-sm md:text-base text-dark">Hapus Trip "{trip.name}"?</h3>
              <p className="text-xs font-semibold text-gray-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus trip ini? Seluruh data itinerary, budget, booking, dan catatan akan dihapus secara permanen dari Firestore.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
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
