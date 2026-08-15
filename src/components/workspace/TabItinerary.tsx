import React, { useState } from 'react';
import { Plus, Clock, MapPin, DollarSign, Edit3, Trash2, Sparkles, Copy, ChevronUp, ChevronDown, Utensils, Car, Hotel, Compass, ShoppingBag, Coffee, MoreHorizontal } from 'lucide-react';
import { Trip, ItineraryDay, ItineraryItem, ItineraryCategory } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { formatCurrency } from '../../utils/formatters';

interface TabItineraryProps {
  trip: Trip;
  days: ItineraryDay[];
  items: ItineraryItem[];
}

export const TabItinerary: React.FC<TabItineraryProps> = ({ trip, days, items }) => {
  const { addItineraryItem, updateItineraryItem, deleteItineraryItem, addItineraryDay } = useTripContext();
  const [selectedDayId, setSelectedDayId] = useState<string>(days[0]?.id || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState('1 hour');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ItineraryCategory>('Activity');
  const [cost, setCost] = useState(0);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [transportType, setTransportType] = useState('Car');

  const activeDay = days.find(d => d.id === selectedDayId) || days[0];
  const dayItems = items.filter(i => i.dayId === (activeDay?.id || '')).sort((a, b) => a.time.localeCompare(b.time));

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
    setIsModalOpen(true);
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
    setIsModalOpen(true);
  };

  const [isAddDayModalOpen, setIsAddDayModalOpen] = useState(false);
  const [newDayTitleInput, setNewDayTitleInput] = useState('');

  const handleCreateNewDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDayTitleInput.trim()) {
      addItineraryDay(trip.id, newDayTitleInput.trim());
      setNewDayTitleInput('');
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
        transportType,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Horizontal Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {days.map((day) => {
          const isActive = day.id === selectedDayId;
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-primary-pink text-white border-primary-pink shadow-sm'
                  : 'bg-white text-dark border-card-pink hover:bg-soft-pink'
              }`}
            >
              <span>DAY {day.dayNumber}</span>
              <span className={`text-[10px] ${isActive ? 'text-white/80' : 'text-[#6F7787]'}`}>• {day.date}</span>
            </button>
          );
        })}

        <button
          onClick={() => setIsAddDayModalOpen(true)}
          className="px-3.5 py-3 rounded-2xl bg-white border border-dashed border-gray-300 hover:border-primary-pink text-xs font-bold text-primary-pink whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Day</span>
        </button>
      </div>

      {/* Day Title & Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-card-pink flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-bold text-primary-pink tracking-wider uppercase">
            DAY {activeDay?.dayNumber} — {activeDay?.date}
          </span>
          <h2 className="text-xl font-extrabold text-dark mt-0.5">{activeDay?.title}</h2>
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

        <button
          onClick={handleOpenAdd}
          className="bg-primary-pink hover:bg-opacity-90 text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Timeline Activities List */}
      {dayItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-card-pink p-12 text-center shadow-sm">
          <Clock className="w-12 h-12 text-soft-pink mx-auto mb-3" />
          <h3 className="font-bold text-base text-dark">Belum ada aktivitas di {activeDay?.title}</h3>
          <p className="text-xs text-gray-custom mt-1 mb-4">Tambahkan aktivitas manual atau gunakan AI untuk auto-generate.</p>
          <button
            onClick={handleOpenAdd}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-5 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Aktivitas Pertama</span>
          </button>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-card-pink">
          {dayItems.map((item, index) => (
            <div key={item.id} className="relative group">
              {/* Timeline Pin Dot */}
              <div className="absolute -left-[23px] top-4 w-4 h-4 rounded-full bg-primary-pink border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />

              {/* Activity Card */}
              <div className="bg-white rounded-3xl p-5 border border-card-pink hover:border-primary-pink shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Category Pill & Time */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-extrabold text-primary-pink bg-soft-pink px-2.5 py-1 rounded-full">
                      {item.time}
                    </span>
                    <span className="text-gray-400 font-semibold">•</span>
                    <span className="font-medium text-[#6F7787] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {item.duration}
                    </span>
                    <span className="text-gray-400 font-semibold">•</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 font-bold text-[11px] text-[#20263D]">
                      {categoryIcons[item.category]}
                      {item.category}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <div>
                    <h3 className="font-bold text-base text-dark">{item.title}</h3>
                    <p className="text-xs text-gray-custom flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-primary-pink shrink-0" />
                      {item.location}
                    </p>
                  </div>

                  {/* Description & Notes */}
                  {item.description && (
                    <p className="text-xs text-gray-600 bg-[#F7F8FA] p-2.5 rounded-xl border border-gray-100">
                      {item.description}
                    </p>
                  )}

                  {item.notes && (
                    <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg font-medium">
                      💡 {item.notes}
                    </p>
                  )}
                </div>

                {/* Right Side Cost & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 gap-3 shrink-0">
                  <span className="font-extrabold text-sm text-[#20263D]">
                    {formatCurrency(item.estimatedCost, trip.currency)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-[#20263D] transition-colors"
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

      {/* Add / Edit Activity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-[#E8EBEF]">
            <h3 className="font-bold text-lg text-[#20263D] mb-4">
              {editingItem ? 'Edit Activity' : 'Add New Activity'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Activity Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Visit Kawah Ijen Crater"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-[#20263D] focus:outline-none focus:border-[#18A66A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Start Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="09:00"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-[#20263D]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="1h 30m"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-[#20263D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kawah Ijen, Banyuwangi"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-[#20263D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItineraryCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-[#20263D]"
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
                  <label className="block font-semibold text-[#20263D] mb-1">Estimated Cost ({trip.currency})</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-[#20263D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-[#20263D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Day Modal */}
      {isAddDayModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 animate-scale-up">
            <h3 className="font-bold text-base text-[#20263D]">Tambah Hari Itinerary Baru</h3>
            <form onSubmit={handleCreateNewDay} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Judul / Kegiatan Hari</label>
                <input
                  type="text"
                  value={newDayTitleInput}
                  onChange={(e) => setNewDayTitleInput(e.target.value)}
                  placeholder="e.g. Hari 4: Wisata Belanja & Oleh-oleh"
                  required
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-[#20263D]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDayModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90"
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
