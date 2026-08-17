import React, { useState } from 'react';
import { Plus, Clock, MapPin, DollarSign, Edit3, Trash2, Copy, ChevronUp, ChevronDown, Utensils, Car, Hotel, Compass, ShoppingBag, Coffee, MoreHorizontal, MoveRight, Image as ImageIcon, Upload, X, Shirt } from 'lucide-react';
import { Trip, ItineraryDay, ItineraryItem, ItineraryCategory } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { formatCurrency } from '../../utils/formatters';
import { ImagePickerField } from '../ImagePickerField';

interface TabItineraryProps {
  trip: Trip;
  days: ItineraryDay[];
  items: ItineraryItem[];
}

export const TabItinerary: React.FC<TabItineraryProps> = ({ trip, days, items }) => {
  const { addItineraryItem, updateItineraryItem, deleteItineraryItem, addItineraryDay, updateItineraryDay, deleteItineraryDay, reorderItineraryDays } = useTripContext();
  const [selectedDayId, setSelectedDayId] = useState<string>(days[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState<ItineraryItem | null>(null);
  const [targetDayId, setTargetDayId] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('1 hour');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ItineraryCategory>('Activity');
  const [cost, setCost] = useState(0);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [spotImageUrl, setSpotImageUrl] = useState('');
  const [outfitImageUrl, setOutfitImageUrl] = useState('');
  const [transportType, setTransportType] = useState('Car');
  const [isUploading, setIsUploading] = useState(false);

  const activeDay = days.find(d => d.id === selectedDayId) || days[0];
  const dayItems = items.filter(i => {
    if (!activeDay) return false;
    if (i.dayId === activeDay.id) return true;
    if (i.dayId && activeDay.id && (i.dayId.includes(activeDay.id) || activeDay.id.includes(i.dayId))) return true;
    const itemDayNum = i.dayId?.match(/day-?(\d+)/i)?.[1];
    const activeDayNum = (activeDay.id?.match(/day-?(\d+)/i)?.[1] || String(activeDay.dayNumber));
    if (itemDayNum && activeDayNum && itemDayNum === activeDayNum) return true;
    return false;
  }).sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'));

  const categoryIcons: Record<ItineraryCategory, React.ReactNode> = {
    Food: <Utensils className="w-3.5 h-3.5 text-amber-600" />,
    Transport: <Car className="w-3.5 h-3.5 text-blue-600" />,
    Hotel: <Hotel className="w-3.5 h-3.5 text-purple-600" />,
    Activity: <Compass className="w-3.5 h-3.5 text-emerald-600" />,
    Shopping: <ShoppingBag className="w-3.5 h-3.5 text-pink-600" />,
    'Free time': <Coffee className="w-3.5 h-3.5 text-teal-600" />,
    Other: <MoreHorizontal className="w-3.5 h-3.5 text-gray-600" />
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setTitle('');
    setTime('09:00');
    setDuration('1 hour');
    setLocation(trip.destination);
    setCategory('Activity');
    setCost(50000);
    setDescription('');
    setNotes('');
    setImageUrl('');
    setSpotImageUrl('');
    setOutfitImageUrl('');
    setIsModalOpen(true);
  };

  const [isMoveAllModalOpen, setIsMoveAllModalOpen] = useState(false);
  const [targetDayIdAll, setTargetDayIdAll] = useState<string>('');
  const [moveMode, setMoveMode] = useState<'merge' | 'swap' | 'shift'>('shift');

  const handleOpenMoveAll = () => {
    setTargetDayIdAll('');
    setIsMoveAllModalOpen(true);
  };

  const handleSaveMoveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetDayIdAll && targetDayIdAll !== activeDay?.id && activeDay) {
      const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
      const targetIndex = sortedDays.findIndex(d => d.id === targetDayIdAll);
      const targetDay = sortedDays[targetIndex];
      const sourceDay = activeDay;
      
      const updates: { id: string, newDayId: string }[] = [];
      const titleUpdates: { id: string, newTitle: string }[] = [];
      
      if (moveMode === 'merge') {
        dayItems.forEach(item => updates.push({ id: item.id, newDayId: targetDayIdAll }));
        titleUpdates.push({ id: targetDay.id, newTitle: `${sourceDay.title} & ${targetDay.title}` });
        titleUpdates.push({ id: sourceDay.id, newTitle: 'Hari Kosong' });
      } else if (moveMode === 'swap') {
        const targetItems = items.filter(i => i.dayId === targetDayIdAll);
        dayItems.forEach(item => updates.push({ id: item.id, newDayId: targetDayIdAll }));
        targetItems.forEach(item => updates.push({ id: item.id, newDayId: sourceDay.id }));
        titleUpdates.push({ id: targetDay.id, newTitle: sourceDay.title });
        titleUpdates.push({ id: sourceDay.id, newTitle: targetDay.title });
      } else if (moveMode === 'shift') {
        for (let i = targetIndex; i < sortedDays.length - 1; i++) {
          const currentDayId = sortedDays[i].id;
          const nextDayId = sortedDays[i+1].id;
          const itemsToShift = items.filter(it => it.dayId === currentDayId && it.dayId !== sourceDay.id);
          itemsToShift.forEach(item => updates.push({ id: item.id, newDayId: nextDayId }));
          titleUpdates.push({ id: nextDayId, newTitle: sortedDays[i].title });
        }
        dayItems.forEach(item => updates.push({ id: item.id, newDayId: targetDayIdAll }));
        titleUpdates.push({ id: targetDay.id, newTitle: sourceDay.title });
        if (!titleUpdates.some(tu => tu.id === sourceDay.id)) {
           titleUpdates.push({ id: sourceDay.id, newTitle: 'Hari Kosong' });
        }
      }
      
      for (const u of updates) {
        if (u.newDayId) {
          await updateItineraryItem(u.id, { dayId: u.newDayId });
        }
      }
      for (const tu of titleUpdates) {
         await updateItineraryDay(tu.id, tu.newTitle);
      }
    }
    setIsMoveAllModalOpen(false);
  };

  const handleOpenMove = (item: ItineraryItem) => {
    setItemToMove(item);
    setTargetDayId(item.dayId);
    setIsMoveModalOpen(true);
  };

  const handleSaveMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemToMove && targetDayId && targetDayId !== itemToMove.dayId) {
      await updateItineraryItem(itemToMove.id, { dayId: targetDayId });
    }
    setIsMoveModalOpen(false);
    setItemToMove(null);
  };

  const handleOpenEdit = (item: ItineraryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setTime(item.time);
    setDuration(item.duration);
    setLocation(item.location);
    setCategory(item.category);
    setCost(item.estimatedCost);
    setDescription(item.description || '');
    setNotes(item.notes || '');
    setImageUrl(item.imageUrl || '');
    setSpotImageUrl(item.spotImageUrl || '');
    setOutfitImageUrl(item.outfitImageUrl || '');
    setIsModalOpen(true);
  };

  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
  
  const [draggedDayId, setDraggedDayId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedDayId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged element from turning completely transparent if we styled it
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedDayId) {
      await reorderItineraryDays(trip.id, draggedDayId, targetIndex);
    }
    setDraggedDayId(null);
  };

  const [newDayTitleInput, setNewDayTitleInput] = useState('');
  const [insertDayIndex, setInsertDayIndex] = useState<number | ''>('');
  const [editingDayTitleId, setEditingDayTitleId] = useState<string | null>(null);
  const [editedDayTitle, setEditedDayTitle] = useState('');

  const handleCreateNewDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDayTitleInput.trim()) {
      const idx = insertDayIndex === '' ? undefined : Number(insertDayIndex);
      addItineraryDay(trip.id, newDayTitleInput.trim(), idx);
      setNewDayTitleInput('');
      setInsertDayIndex('');
      setIsAddDayModalOpen(false);
    }
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !activeDay) return;

    if (editingItem) {
      updateItineraryItem(editingItem.id, {
        title,
        time,
        duration,
        location,
        category,
        estimatedCost: cost,
        description,
        notes,
        imageUrl: imageUrl.trim(),
        spotImageUrl: spotImageUrl.trim(),
        outfitImageUrl: outfitImageUrl.trim(),
        transportType,
      });
    } else {
      addItineraryItem({
        dayId: activeDay.id,
        tripId: trip.id,
        time,
        duration,
        title,
        location,
        category,
        estimatedCost: cost,
        description,
        notes,
        imageUrl: imageUrl.trim(),
        spotImageUrl: spotImageUrl.trim(),
        outfitImageUrl: outfitImageUrl.trim(),
        transportType,
      });
    }
    setIsModalOpen(false);
  };

  const parseDurationToMinutes = (dur: string): number => {
    if (!dur) return 60;
    const lower = dur.toLowerCase().trim();
    if (lower === 'full day' || lower === 'seharian') return 480;
    
    let totalMin = 0;
    const hoursMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:h|hour|jam)/);
    if (hoursMatch) {
      totalMin += parseFloat(hoursMatch[1]) * 60;
    }
    const minsMatch = lower.match(/(\d+)\s*(?:m|min|menit)/);
    if (minsMatch) {
      totalMin += parseInt(minsMatch[1], 10);
    }
    if (totalMin === 0) {
      const num = parseInt(lower, 10);
      if (!isNaN(num)) totalMin = num;
    }
    return totalMin > 0 ? Math.round(totalMin) : 60;
  };

  const formatMinutesToDuration = (minutes: number): string => {
    if (minutes <= 0) return '15m';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const formatMinutesToIndonesian = (minutes: number): string => {
    if (minutes <= 0) return '15 menit';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins} menit`;
    if (mins === 0) return `${hrs} jam`;
    return `${hrs} jam ${mins} menit`;
  };

  const getEndTimeString = (startTime: string, durStr: string): string => {
    let [h, m] = (startTime || '09:00').split(':').map(Number);
    if (isNaN(h)) h = 9;
    if (isNaN(m)) m = 0;
    const durationMins = parseDurationToMinutes(durStr);
    const totalMins = (h * 60 + m + durationMins) % (24 * 60);
    const endH = String(Math.floor(totalMins / 60)).padStart(2, '0');
    const endM = String(totalMins % 60).padStart(2, '0');
    return `${endH}:${endM}`;
  };

  const handleEndTimeChange = (newEndTime: string) => {
    let [startH, startM] = (time || '09:00').split(':').map(Number);
    let [endH, endM] = (newEndTime || '10:00').split(':').map(Number);
    if (isNaN(startH)) startH = 9;
    if (isNaN(startM)) startM = 0;
    if (isNaN(endH)) endH = 10;
    if (isNaN(endM)) endM = 0;

    let startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;
    if (endTotal < startTotal) {
      endTotal += 24 * 60;
    }
    let diffMinutes = endTotal - startTotal;
    if (diffMinutes <= 0) diffMinutes = 15;

    setDuration(formatMinutesToDuration(diffMinutes));
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Horizontal Bar */}
      <div 
        className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar"
        onDragOver={handleDragOver}
      >
        {days.map((day, index) => {
          const isActive = day.id === selectedDayId;
          const isDragging = draggedDayId === day.id;
          return (
            <button
              key={day.id}
              draggable
              onDragStart={(e) => handleDragStart(e, day.id)}
              onDrop={(e) => handleDrop(e, index)}
              onClick={() => setSelectedDayId(day.id)}
              className={`cursor-grab active:cursor-grabbing px-3 md:px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-primary-pink text-white border-primary-pink shadow-sm'
                  : 'bg-white text-dark border-card-pink hover:bg-soft-pink'
              } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
              title="Tahan dan geser untuk memindahkan hari"
            >
              <span>DAY {day.dayNumber}</span>
              <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-gray-custom'}`}>• {day.date}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsAddDayModalOpen(true)}
          className="px-3.5 py-3 rounded-2xl bg-white border border-dashed border-gray-300 hover:border-primary-pink text-xs font-bold text-primary-pink whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Hari</span>
        </button>
      </div>

      {/* Day Title & Header Banner */}
      <div className="bg-white p-3 md:p-5 rounded-2xl border border-card-pink flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-xs font-bold text-primary-pink tracking-wider uppercase">
              DAY {activeDay?.dayNumber} — {activeDay?.date}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {editingDayTitleId === activeDay?.id ? (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editedDayTitle.trim() && activeDay) {
                    updateItineraryDay(activeDay.id, editedDayTitle.trim());
                  }
                  setEditingDayTitleId(null);
                }}
                className="flex items-center gap-2 w-full max-w-sm"
              >
                <input 
                  type="text" 
                  value={editedDayTitle}
                  onChange={(e) => setEditedDayTitle(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm font-bold text-dark w-full"
                  autoFocus
                />
                <button type="submit" className="text-xs bg-primary-pink text-white px-2 py-1 rounded-md">Simpan</button>
                <button type="button" onClick={() => setEditingDayTitleId(null)} className="text-xs text-gray-500">Batal</button>
              </form>
            ) : (
              <>
                <h2 className="text-lg md:text-xl font-extrabold text-dark">{activeDay?.title}</h2>
                <button 
                  onClick={() => {
                    if (activeDay) {
                      setEditedDayTitle(activeDay.title);
                      setEditingDayTitleId(activeDay.id);
                    }
                  }}
                  className="text-gray-400 hover:text-primary-pink transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          <p className="text-xs text-gray-custom mt-1">
            Total {dayItems.length} Aktivitas | Estimasi Biaya:{' '}
            <span className="font-bold text-dark">
              {formatCurrency(
                dayItems.reduce((acc, i) => acc + i.estimatedCost, 0),
                trip.currency
              )}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 justify-end mt-4 sm:mt-0">
          {activeDay && (
            <button 
              onClick={() => {
                 if (true) {
                    deleteItineraryDay(activeDay.id, trip.id);
                 }
              }}
              className="bg-white border border-card-pink hover:border-red-500 text-gray-500 hover:text-red-500 w-10 h-10 flex items-center justify-center rounded-full transition-all shadow-sm active:scale-95 shrink-0"
              title="Hapus Hari Ini"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {dayItems.length > 0 && (
            <button
              onClick={handleOpenMoveAll}
              className="bg-white border border-card-pink hover:border-primary-pink text-dark hover:text-primary-pink px-3 md:px-4 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
            >
              <MoveRight className="w-4 h-4" />
              <span className="hidden sm:inline">Pindah Semua</span>
            </button>
          )}
          <button
            onClick={handleOpenAdd}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-3 md:px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aktivitas</span>
          </button>
        </div>
      </div>

      {/* Timeline Activities List */}
      {dayItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-card-pink p-12 text-center shadow-sm">
          <Clock className="w-12 h-12 text-soft-pink mx-auto mb-3" />
          <h3 className="font-bold text-sm md:text-base text-dark">Belum ada aktivitas di {activeDay?.title}</h3>
          <p className="text-xs text-gray-custom mt-1 mb-4">Tambahkan aktivitas manual atau gunakan AI untuk auto-generate.</p>
          <button
            onClick={handleOpenAdd}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-3 md:px-5 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aktivitas Pertama</span>
          </button>
        </div>
      ) : (
        <div className="relative pl-8 space-y-6 before:absolute before:left-[15px] before:top-6 before:bottom-6 before:border-l-[3px] before:border-dashed before:border-primary-pink/30">
          {dayItems.map((item, index) => (
            <div key={item.id} className="relative group">
              {/* Timeline Pin Dot */}
              <div className="absolute -left-[25px] top-[24px] w-[14px] h-[14px] rounded-full bg-primary-pink border-[3px] border-white shadow-sm group-hover:scale-125 transition-transform z-10" />

              {/* Activity Card */}
              <div className="bg-white rounded-3xl p-3 md:p-5 border border-card-pink hover:border-primary-pink shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 md:gap-4">
                <div className="space-y-2 flex-1">
                  {/* Category Pill & Time */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-primary-pink bg-soft-pink px-2.5 py-1 rounded-full">
                      {item.time}
                    </span>
                    <span className="text-gray-400 font-semibold">•</span>
                    <span className="font-medium text-gray-custom flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {item.duration}
                    </span>
                    <span className="text-gray-400 font-semibold">•</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 font-bold text-[11px] text-dark">
                      {categoryIcons[item.category]}
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="font-bold text-sm md:text-base text-dark">{item.title}</h3>
                    <p className="text-xs text-gray-custom flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary-pink shrink-0" />
                      {item.location}
                    </p>
                  </div>

                  {/* Description & Notes */}
                  {item.description && (
                    <p className="text-xs text-gray-600 bg-screen-pink p-2.5 rounded-xl border border-gray-100">
                      {item.description}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
                      💡 {item.notes}
                    </p>
                  )}

                  {/* Spot & Outfit Media Strip */}
                  {(item.spotImageUrl || item.imageUrl || item.outfitImageUrl) && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(item.spotImageUrl || item.imageUrl) && (
                        <div
                          onClick={() => setPreviewImage(item.spotImageUrl || item.imageUrl!)}
                          className="relative group/img cursor-pointer rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-xs h-24 md:h-28 w-40 shrink-0"
                        >
                          <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold">
                            <MapPin className="w-3 h-3 text-pink-300" />
                            Spot
                          </span>
                          <img
                            src={item.spotImageUrl || item.imageUrl}
                            alt={`Spot ${item.title}`}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <ImageIcon className="w-4 h-4" />
                            <span>Lihat Foto</span>
                          </div>
                        </div>
                      )}
                      {item.outfitImageUrl && (
                        <div
                          onClick={() => setPreviewImage(item.outfitImageUrl!)}
                          className="relative group/img cursor-pointer rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-xs h-24 md:h-28 w-40 shrink-0"
                        >
                          <span className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-[10px] font-bold">
                            <Shirt className="w-3 h-3 text-pink-300" />
                            Outfit
                          </span>
                          <img
                            src={item.outfitImageUrl}
                            alt={`Outfit ${item.title}`}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <ImageIcon className="w-4 h-4" />
                            <span>Lihat Foto</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Side Cost & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 gap-3 shrink-0">
                  <span className="font-extrabold text-sm text-dark">
                    {formatCurrency(item.estimatedCost, trip.currency)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenMove(item)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-dark transition-colors"
                      title="Pindah Hari"
                    >
                      <MoveRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-dark transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteItineraryItem(item.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Move All Activities Modal */}
      {isMoveAllModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-3 md:p-6 shadow-2xl relative border border-gray-100 animate-scale-up">
            <h3 className="font-extrabold text-sm text-dark mb-4">
              Pindahkan Semua Aktivitas
            </h3>
            
            <form onSubmit={handleSaveMoveAll} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-dark mb-1">Pilih Hari Tujuan</label>
                <select
                  value={targetDayIdAll}
                  onChange={(e) => setTargetDayIdAll(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark mb-3"
                >
                  <option value="" disabled>Pilih hari...</option>
                  {days.filter(d => d.id !== activeDay?.id).map(d => (
                    <option key={d.id} value={d.id}>DAY {d.dayNumber} - {d.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-dark mb-2">Metode Pindah</label>
                <div className="space-y-2">
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${moveMode === 'shift' ? 'border-primary-pink bg-soft-pink' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="moveMode" value="shift" checked={moveMode === 'shift'} onChange={() => setMoveMode('shift')} className="mt-0.5" />
                    <div>
                      <div className="font-bold text-dark">Geser Jadwal (Shift)</div>
                      <div className="text-gray-500 mt-0.5 text-[10px]">Aktivitas tujuan akan digeser ke hari berikutnya (Efek Domino).</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${moveMode === 'swap' ? 'border-primary-pink bg-soft-pink' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="moveMode" value="swap" checked={moveMode === 'swap'} onChange={() => setMoveMode('swap')} className="mt-0.5" />
                    <div>
                      <div className="font-bold text-dark">Tukar Hari (Swap)</div>
                      <div className="text-gray-500 mt-0.5 text-[10px]">Aktivitas hari ini dan hari tujuan akan saling bertukar tempat.</div>
                    </div>
                  </label>
                  <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${moveMode === 'merge' ? 'border-primary-pink bg-soft-pink' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <input type="radio" name="moveMode" value="merge" checked={moveMode === 'merge'} onChange={() => setMoveMode('merge')} className="mt-0.5" />
                    <div>
                      <div className="font-bold text-dark">Gabungkan (Merge)</div>
                      <div className="text-gray-500 mt-0.5 text-[10px]">Tumpuk semua aktivitas ini ke hari tujuan (Bisa overbooked).</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMoveAllModalOpen(false)}
                  className="px-3 md:px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!targetDayIdAll}
                  className="px-3 md:px-4 py-2 rounded-xl bg-primary-pink text-white font-bold shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  Proses
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Activity Modal */}
      {isMoveModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-3 md:p-6 shadow-2xl relative border border-gray-100 animate-scale-up">
            <h3 className="font-extrabold text-sm text-dark mb-4">
              Pindahkan Aktivitas
            </h3>
            <div className="mb-4 text-xs text-gray-500">
              Pindahkan <span className="font-bold text-dark">{itemToMove?.title}</span> ke hari lain:
            </div>
            <form onSubmit={handleSaveMove} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-dark mb-1">Pilih Hari Tujuan</label>
                <select
                  value={targetDayId}
                  onChange={(e) => setTargetDayId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark"
                >
                  {days.map(d => (
                    <option key={d.id} value={d.id}>DAY {d.dayNumber} - {d.title}</option>
                  ))}
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMoveModalOpen(false)}
                  className="px-3 md:px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 md:px-4 py-2 rounded-xl bg-primary-pink text-white font-bold shadow-md active:scale-95 transition-all"
                >
                  Pindahkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-3 md:p-6 shadow-2xl relative border border-card-pink">
            <h3 className="font-bold text-base md:text-lg text-dark mb-4">
              {editingItem ? 'Edit Activity' : 'Add New Activity'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-dark mb-1">Judul Aktivitas</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Visit Kawah Ijen Crater"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark focus:outline-none focus:border-[#18A66A]"
                />
              </div>

              {/* Time & Duration Section */}
              <div className="bg-screen-pink p-3.5 rounded-2xl border border-card-pink space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-dark mb-1">
                      Jam Mulai
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-dark text-sm focus:ring-2 focus:ring-primary-pink/30 focus:border-primary-pink cursor-pointer shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-dark mb-1">
                      Jam Selesai
                    </label>
                    <input
                      type="time"
                      value={getEndTimeString(time, duration)}
                      onChange={(e) => handleEndTimeChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-bold text-dark text-sm focus:ring-2 focus:ring-primary-pink/30 focus:border-primary-pink cursor-pointer shadow-2xs"
                    />
                  </div>
                </div>

                {/* Duration Badge & Quick Adjust Stepper */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center gap-1.5 bg-pink-50 border border-pink-200 px-3 py-1.5 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-primary-pink shrink-0" />
                    <span className="text-xs font-semibold text-gray-600">Durasi:</span>
                    <span className="text-xs font-extrabold text-primary-pink">
                      {formatMinutesToIndonesian(parseDurationToMinutes(duration))}
                    </span>
                  </div>

                  {/* Quick +/- Steppers */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = parseDurationToMinutes(duration);
                        if (cur > 15) setDuration(formatMinutesToDuration(cur - 15));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-bold text-xs text-gray-700 transition-all active:scale-95 shadow-2xs"
                      title="Kurangi 15 menit"
                    >
                      -15m
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration(formatMinutesToDuration(parseDurationToMinutes(duration) + 15))}
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-bold text-xs text-gray-700 transition-all active:scale-95 shadow-2xs"
                      title="Tambah 15 menit"
                    >
                      +15m
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuration(formatMinutesToDuration(parseDurationToMinutes(duration) + 60))}
                      className="px-2.5 py-1 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 font-bold text-xs text-gray-700 transition-all active:scale-95 shadow-2xs"
                      title="Tambah 1 jam"
                    >
                      +1j
                    </button>
                  </div>
                </div>

                {/* Preset Duration Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: '30 mnt', val: '30m' },
                    { label: '1 jam', val: '1h' },
                    { label: '1.5 jam', val: '1h 30m' },
                    { label: '2 jam', val: '2h' },
                    { label: '3 jam', val: '3h' },
                    { label: 'Seharian (8j)', val: '8h' },
                  ].map((preset) => {
                    const isSelected = parseDurationToMinutes(duration) === parseDurationToMinutes(preset.val);
                    return (
                      <button
                        key={preset.val}
                        type="button"
                        onClick={() => setDuration(preset.val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
                          isSelected
                            ? 'bg-primary-pink text-white border-primary-pink shadow-xs'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-dark mb-1">Lokasi</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kawah Ijen, Banyuwangi"
                  className="w-full px-3.5 py-2 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItineraryCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark"
                  >
                    <option value="Activity">Activity</option>
                    <option value="Food">Food</option>
                    <option value="Hotel">Hotel</option>
                    <option value="Transport">Transport</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Free time">Free time</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-dark mb-1">Estimasi Biaya ({trip.currency})</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-dark mb-1">Deskripsi</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark"
                />
              </div>

              {/* Image Attachment Field */}
              <div className="pt-1 space-y-4 border-t border-gray-100">
                <ImagePickerField
                  value={spotImageUrl}
                  onChange={setSpotImageUrl}
                  label="Foto Spot / Lokasi"
                />
                <ImagePickerField
                  value={outfitImageUrl}
                  onChange={setOutfitImageUrl}
                  label="Rekomendasi Outfit"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 md:px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-3 md:px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90 disabled:opacity-50"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black text-white rounded-full z-10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img src={previewImage} alt="Enlarged preview" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}

      {/* Add Day Modal */}
      {isAddDayModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-3xl p-3 md:p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <h3 className="font-bold text-sm md:text-base text-dark">Tambah Hari Itinerary Baru</h3>
            <form onSubmit={handleCreateNewDay} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-dark mb-1">Judul / Kegiatan Hari</label>
                <input
                  type="text"
                  value={newDayTitleInput}
                  onChange={(e) => setNewDayTitleInput(e.target.value)}
                  placeholder="e.g. Hari: Wisata Belanja & Oleh-oleh"
                  required
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark"
                />
              </div>
              <div>
                <label className="block font-semibold text-dark mb-1">Sisipkan di Posisi</label>
                <select
                  value={insertDayIndex}
                  onChange={(e) => setInsertDayIndex(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl border border-card-pink bg-screen-pink font-medium text-dark"
                >
                  <option value="">Di Akhir (Sebagai Hari Terakhir)</option>
                  {days.map((d, idx) => (
                    <option key={d.id} value={idx}>Sisipkan sebagai DAY {idx + 1}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDayModalOpen(false)}
                  className="px-3 md:px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 md:px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90"
                >
                  Tambah Hari
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
