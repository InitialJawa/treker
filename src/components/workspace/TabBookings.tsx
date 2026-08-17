import React, { useState } from 'react';
import { Plus, Hotel, Plane, Train, Car, ShieldCheck, FileText, ExternalLink, Edit3, Trash2, Tag, Calendar, MapPin, Image as ImageIcon, Upload, X } from 'lucide-react';
import { Trip, Booking, BookingType, BookingStatus } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { formatCurrency } from '../../utils/formatters';
import { resizeImage } from '../../utils/imageUtils';
import { ImagePickerField } from '../ImagePickerField';

interface TabBookingsProps {
  trip: Trip;
  bookings: Booking[];
}

export const TabBookings: React.FC<TabBookingsProps> = ({ trip, bookings }) => {
  const { addBooking, updateBooking, deleteBooking } = useTripContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState<BookingType>('Hotel');
  const [provider, setProvider] = useState('Booking.com');
  const [confirmationNumber, setConfirmationNumber] = useState('BK-123456');
  const [date, setDate] = useState('2026-10-04');
  const [time, setTime] = useState('14:00');
  const [location, setLocation] = useState(trip.destination);
  const [price, setPrice] = useState(1200000);
  const [status, setStatus] = useState<BookingStatus>('Confirmed');
  const [notes, setNotes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const bookingIcons: Record<BookingType, React.ReactNode> = {
    Hotel: <Hotel className="w-5 h-5 text-purple-600" />,
    Flight: <Plane className="w-5 h-5 text-blue-600" />,
    Train: <Train className="w-5 h-5 text-emerald-600" />,
    'Car rental': <Car className="w-5 h-5 text-amber-600" />,
    Restaurant: <Tag className="w-5 h-5 text-orange-600" />,
    Attraction: <ShieldCheck className="w-5 h-5 text-teal-600" />,
    Other: <FileText className="w-5 h-5 text-gray-600" />
  };

  const statusColors: Record<BookingStatus, string> = {
    Confirmed: 'bg-emerald-100 text-[#18A66A] border-emerald-200',
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    'Need Booking': 'bg-gray-100 text-gray-700 border-gray-200',
    Cancelled: 'bg-red-100 text-red-600 border-red-200',
    Completed: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const resizedDataUrl = await resizeImage(file, 1000);
      setImageUrl(resizedDataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBooking(null);
    setName('');
    setType('Hotel');
    setProvider('Booking.com');
    setConfirmationNumber(`CONF-${Math.floor(Math.random() * 900000 + 100000)}`);
    setDate(trip.startDate);
    setTime('14:00');
    setLocation(trip.destination);
    setPrice(500000);
    setStatus('Confirmed');
    setNotes('');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: Booking) => {
    setEditingBooking(b);
    setName(b.name);
    setType(b.type);
    setProvider(b.provider);
    setConfirmationNumber(b.confirmationNumber);
    setDate(b.date);
    setTime(b.time);
    setLocation(b.location);
    setPrice(b.price);
    setStatus(b.status);
    setNotes(b.notes || '');
    setImageUrl(b.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingBooking) {
      updateBooking(editingBooking.id, {
        name,
        type,
        provider,
        confirmationNumber,
        date,
        time,
        location,
        price,
        status,
        notes,
        imageUrl: imageUrl.trim(),
      });
    } else {
      addBooking({
        tripId: trip.id,
        name,
        type,
        provider,
        confirmationNumber,
        date,
        time,
        location,
        price,
        status,
        notes,
        imageUrl: imageUrl.trim(),
        attachmentName: `${type.toLowerCase()}_confirmation.pdf`
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-3 md:p-5 rounded-[24px] border border-card-pink flex items-center justify-between gap-2 md:gap-4 shadow-sm">
        <div>
          <span className="text-[10px] md:text-xs font-extrabold text-primary-pink tracking-wider uppercase">Reservations</span>
          <h2 className="text-base md:text-lg md:text-xl font-extrabold text-dark">Booking Manager</h2>
          <p className="text-[10px] md:text-xs text-gray-custom mt-0.5">
            {bookings.filter(b => b.status === 'Confirmed').length} dari {bookings.length} reservasi terkonfirmasi
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-primary-pink hover:bg-opacity-90 text-white px-3 md:px-4 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Booking</span>
        </button>
      </div>

      {/* Booking Cards Grid */}
      {bookings.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-card-pink p-12 text-center text-gray-custom shadow-sm">
          <Hotel className="w-12 h-12 mx-auto mb-2 text-soft-pink" />
          <h3 className="font-bold text-sm md:text-base text-dark">Belum ada reservasi tersimpan</h3>
          <p className="text-xs text-gray-custom mt-1 mb-4">Simpan bukti voucher hotel, tiket pesawat, atau penyewaan kendaraan.</p>
          <button
            onClick={handleOpenAdd}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-3 md:px-5 py-2.5 rounded-full font-bold text-xs transition-all"
          >
            + Add Booking
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl p-3 md:p-5 border border-card-pink hover:border-primary-pink shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Type & Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-offwhite flex items-center justify-center">
                      {bookingIcons[b.type]}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-custom uppercase">{b.type}</span>
                      <p className="text-xs font-bold text-dark">{b.provider}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${statusColors[b.status]}`}>
                    ● {b.status}
                  </span>
                </div>

                {/* Booking Name & Code */}
                <div>
                  <h3 className="font-extrabold text-sm md:text-base text-dark">{b.name}</h3>
                  <p className="text-xs text-gray-custom flex items-center gap-1.5 mt-1">
                    <span>Code:</span>
                    <span className="font-mono font-bold text-dark bg-offwhite px-2 py-0.5 rounded-md">
                      {b.confirmationNumber}
                    </span>
                  </p>
                </div>

                {/* Date, Time & Location */}
                <div className="text-xs text-gray-custom space-y-1 bg-offwhite p-3 rounded-2xl border border-card-pink">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary-pink" />
                    {b.date} • {b.time}
                  </p>
                  <p className="flex items-center gap-1.5 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-primary-pink shrink-0" />
                    <span className="truncate">{b.location}</span>
                  </p>
                </div>

                {b.notes && (
                  <p className="text-xs text-gray-custom italic">" {b.notes} "</p>
                )}

                {/* Booking Image / Voucher Attachment */}
                {b.imageUrl && (
                  <div className="mt-2">
                    <div
                      onClick={() => setPreviewImage(b.imageUrl!)}
                      className="relative group/img cursor-pointer rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 h-32 w-full"
                    >
                      <img
                        src={b.imageUrl}
                        alt={b.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ImageIcon className="w-4 h-4" />
                        <span>Lihat Bukti Voucher / Tiket</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Price & Actions Footer */}
              <div className="mt-4 pt-3 border-t border-card-pink flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-custom block font-semibold">Total Price</span>
                  <span className="text-sm font-extrabold text-dark">
                    {formatCurrency(b.price, trip.currency)}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(b)}
                    className="p-2 hover:bg-soft-pink rounded-full text-gray-custom hover:text-primary-pink transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteBooking(b.id)}
                    className="p-2 hover:bg-red-50 rounded-full text-red-400 hover:text-red-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-3 md:p-6 shadow-2xl border border-card-pink">
            <h3 className="font-bold text-sm md:text-base text-dark mb-4">
              {editingBooking ? 'Edit Booking' : 'Add Booking'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-dark mb-1">Booking Title</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ketapang Indah Hotel"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as BookingType)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  >
                    <option value="Hotel">Hotel</option>
                    <option value="Flight">Flight</option>
                    <option value="Train">Train</option>
                    <option value="Car rental">Car rental</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Attraction">Attraction</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-dark mb-1">Provider</label>
                  <input
                    type="text"
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="e.g. Tiket.com, Traveloka"
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Code / Confirmation #</label>
                  <input
                    type="text"
                    value={confirmationNumber}
                    onChange={(e) => setConfirmationNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-dark mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookingStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Need Booking">Need Booking</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Price ({trip.currency})</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-dark mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-dark mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                />
              </div>

              {/* Attachment / Image Field */}
              <div className="pt-1 border-t border-gray-100">
                <ImagePickerField
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Lampiran Gambar / Bukti Tiket / Voucher"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 md:px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-3 md:px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90 transition-all disabled:opacity-50"
                >
                  Save Booking
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
            <img src={previewImage} alt="Enlarged voucher preview" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
