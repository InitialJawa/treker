import React from 'react';
import { X, Printer, Share2, Download, CheckCircle, Copy, MapPin, Calendar, DollarSign, Users } from 'lucide-react';
import { Trip, ItineraryDay, ItineraryItem, Booking, Expense, PackingItem } from '../types/travel';
import { formatCurrency, formatDateRange } from '../utils/formatters';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  days: ItineraryDay[];
  items: ItineraryItem[];
  bookings: Booking[];
  expenses: Expense[];
  packing: PackingItem[];
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  trip,
  days,
  items,
  bookings,
  expenses,
  packing,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/trip/${trip.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="print-modal fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="print-modal-card bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-[#E8EBEF] overflow-hidden">
        {/* Top Action Header */}
        <div className="p-4 md:p-6 border-b border-[#E8EBEF] flex items-center justify-between bg-white z-10 no-print">
          <div>
            <h3 className="text-lg font-bold text-dark">Export & Share Trip Summary</h3>
            <p className="text-xs text-[#6F7787]">Simpan dokumen PDF atau bagikan ke teman seperjalanan</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-2 rounded-xl border border-[#E8EBEF] hover:bg-gray-50 text-xs font-bold text-dark flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-[var(--color-primary-pink)]" />
              {isCopied ? 'Copied!' : 'Share Link'}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary-pink)] hover:bg-opacity-90 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Area */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-dark">
          {/* Printable Document Banner */}
          <div className="border-b border-gray-200 pb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-extrabold tracking-widest text-[var(--color-primary-pink)] uppercase">
                ✦ TRAVELER TRIP ITINERARY DOCUMENT
              </span>
              <span className="text-xs font-semibold text-gray-400">Status: Confirmed</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-dark">{trip.name}</h1>
            <p className="text-sm font-semibold text-[#6F7787] flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-[var(--color-primary-pink)]" />
              {trip.destination}
              <span>•</span>
              <Calendar className="w-4 h-4 text-[var(--color-primary-pink)]" />
              {formatDateRange(trip.startDate, trip.endDate)}
              <span>•</span>
              <Users className="w-4 h-4 text-[var(--color-primary-pink)]" />
              {trip.travelersCount} Travelers
            </p>
          </div>

          {/* Budget & Stats Summary */}
          <div className="grid grid-cols-3 gap-4 bg-[#F7F8FA] p-4 rounded-2xl border border-[#E8EBEF]">
            <div>
              <span className="text-[11px] font-bold text-[#6F7787] uppercase">Total Budget</span>
              <p className="text-base font-extrabold text-dark">{formatCurrency(trip.budget, trip.currency)}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6F7787] uppercase">Spent</span>
              <p className="text-base font-extrabold text-[var(--color-primary-pink)]">{formatCurrency(trip.actualSpent, trip.currency)}</p>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#6F7787] uppercase">Remaining</span>
              <p className="text-base font-extrabold text-amber-600">
                {formatCurrency(Math.max(0, trip.budget - trip.actualSpent), trip.currency)}
              </p>
            </div>
          </div>

          {/* Itinerary Section */}
          <div>
            <h3 className="text-base font-bold text-dark border-b border-gray-200 pb-2 mb-4">
              📅 Itinerary Timeline
            </h3>
            <div className="space-y-4">
              {days.map((day) => {
                const dayItems = items.filter(i => i.dayId === day.id);
                return (
                  <div key={day.id} className="border-l-2 border-[var(--color-primary-pink)] pl-4 space-y-2">
                    <h4 className="font-extrabold text-sm text-dark">{day.title} ({day.date})</h4>
                    {dayItems.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">Belum ada agenda aktivitas.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {dayItems.map((item) => (
                          <div key={item.id} className="flex items-start justify-between text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <div>
                              <span className="font-bold text-[var(--color-primary-pink)] mr-2">{item.time}</span>
                              <span className="font-bold text-dark">{item.title}</span>
                              <span className="text-gray-400 ml-2">({item.location})</span>
                              {item.description && <p className="text-[11px] text-[#6F7787] mt-0.5">{item.description}</p>}
                            </div>
                            <span className="font-semibold text-gray-600 shrink-0">{formatCurrency(item.estimatedCost, trip.currency)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirmed Bookings Section */}
          <div>
            <h3 className="text-base font-bold text-dark border-b border-gray-200 pb-2 mb-3">
              🏨 Booking & Reservasi
            </h3>
            {bookings.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Belum ada reservasi.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl border border-[#E8EBEF] text-xs space-y-1">
                    <div className="flex justify-between font-bold text-dark">
                      <span>{b.name}</span>
                      <span className="text-[var(--color-primary-pink)]">{b.status}</span>
                    </div>
                    <p className="text-gray-500">Provider: {b.provider} | Code: <span className="font-mono text-dark">{b.confirmationNumber}</span></p>
                    <p className="text-gray-500">Waktu: {b.date} {b.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Packing Checklist Summary */}
          <div>
            <h3 className="text-base font-bold text-dark border-b border-gray-200 pb-2 mb-3">
              🎒 Packing List Checklist ({packing.filter(p => p.isPacked).length}/{packing.length} Packed)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {packing.map((p) => (
                <div key={p.id} className="flex items-center gap-2 text-gray-700">
                  <CheckCircle className={`w-3.5 h-3.5 ${p.isPacked ? 'text-[var(--color-primary-pink)]' : 'text-gray-300'}`} />
                  <span className={p.isPacked ? 'line-through text-gray-400' : 'font-medium'}>{p.name} ({p.quantity})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
