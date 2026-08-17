import React from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, Share2, CheckCircle, MapPin, Calendar, Users, Clock, Wallet, Landmark, Luggage, Route, Plane, Train, Car, Bus, Footprints, Shirt } from 'lucide-react';
import { Trip, ItineraryDay, ItineraryItem, Booking, Expense, PackingItem, TransportLeg } from '../types/travel';
import { formatCurrency, formatDateRange, calculateTripDurationDays } from '../utils/formatters';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
  days: ItineraryDay[];
  items: ItineraryItem[];
  bookings: Booking[];
  expenses: Expense[];
  packing: PackingItem[];
  transports?: TransportLeg[];
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
  transports = [],
}) => {
  const [isCopied, setIsCopied] = React.useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/trip/${trip.id}`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const sortedDays = [...days].sort((a, b) => a.dayNumber - b.dayNumber);
  const sortedItems = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
  const tripDuration = calculateTripDurationDays(trip.startDate, trip.endDate);

  const expenseByCategory: Record<string, number> = {};
  for (const e of expenses) {
    const amount = e.actualAmount || e.estimatedAmount || 0;
    expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + amount;
  }
  const totalExpense = Object.values(expenseByCategory).reduce((a: number, b: number) => a + b, 0);
  const topCategories: [string, number][] = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const transportIcon = (type: TransportLeg['type']) => {
    switch (type) {
      case 'Plane': return <Plane className="w-3.5 h-3.5" />;
      case 'Train': return <Train className="w-3.5 h-3.5" />;
      case 'Car': return <Car className="w-3.5 h-3.5" />;
      case 'Bus': return <Bus className="w-3.5 h-3.5" />;
      case 'Walking': return <Footprints className="w-3.5 h-3.5" />;
      default: return <Route className="w-3.5 h-3.5" />;
    }
  };

  const bookingStatusColor: Record<string, string> = {
    Confirmed: 'bg-emerald-100 text-emerald-700',
    Completed: 'bg-emerald-100 text-emerald-700',
    Pending: 'bg-amber-100 text-amber-700',
    'Need Booking': 'bg-orange-100 text-orange-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return createPortal(
    <div className="print-modal fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="print-modal-card bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl relative border border-card-pink overflow-hidden">
        {/* Top Action Header */}
        <div className="p-4 md:p-6 border-b border-card-pink flex items-center justify-between bg-white z-10 no-print">
          <div>
            <h3 className="text-lg font-bold text-dark">Ekspor & Bagikan Ringkasan Trip</h3>
            <p className="text-xs text-gray-custom">Simpan dokumen PDF atau bagikan ke teman seperjalanan</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="px-3 py-2 rounded-xl border border-card-pink hover:bg-gray-50 text-xs font-bold text-dark flex items-center gap-1.5 transition-colors"
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
            <button aria-label="Tutup"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="print-doc p-6 md:p-8 space-y-6 text-dark">

          {/* Halaman 1: Cover */}
          <section className="print-page">
            <div className="relative rounded-3xl overflow-hidden min-h-[280px] flex flex-col justify-end">
              {trip.coverImage ? (
                <>
                  <img src={trip.coverImage} alt={trip.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#4a0415] via-[#7a0c22]/70 to-primary-pink/20" />
                </>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-[#E11D48] via-[#be123c] to-[#7a0c22]" />
              )}
              <div className="relative p-6 md:p-8 text-white">
                <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] uppercase bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
                  ✦ Trip Itinerary Document
                </span>
                <h1 className="text-3xl md:text-4xl font-black leading-tight drop-shadow-sm">{trip.name}</h1>
                <p className="text-sm font-semibold text-white/90 flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {trip.destination}</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDateRange(trip.startDate, trip.endDate)}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {tripDuration} Hari</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {trip.travelersCount} Wisatawan</span>
                </p>
                {trip.description && (
                  <p className="text-xs text-white/80 mt-3 max-w-2xl leading-relaxed">{trip.description}</p>
                )}
              </div>
            </div>
          </section>

          {/* Ringkasan Budget */}
          <section className="print-section avoid-break">
            <h3 className="print-section-title"><Wallet className="w-4 h-4" /> Ringkasan Budget</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-card-pink bg-screen-pink p-4">
                <span className="text-[10px] font-bold text-gray-custom uppercase tracking-wide">Total Budget</span>
                <p className="text-lg font-extrabold text-dark mt-1">{formatCurrency(trip.budget, trip.currency)}</p>
              </div>
              <div className="rounded-2xl border border-primary-pink/20 bg-soft-pink p-4">
                <span className="text-[10px] font-bold text-primary-pink uppercase tracking-wide">Terpakai</span>
                <p className="text-lg font-extrabold text-primary-pink mt-1">{formatCurrency(trip.actualSpent, trip.currency)}</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">Sisa</span>
                <p className="text-lg font-extrabold text-amber-600 mt-1">{formatCurrency(Math.max(0, trip.budget - trip.actualSpent), trip.currency)}</p>
              </div>
            </div>
            {topCategories.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-custom uppercase tracking-wide mb-2">
                  <span>Breakdown per Kategori</span>
                  <span>{formatCurrency(totalExpense, trip.currency)}</span>
                </div>
                <div className="space-y-1.5">
                  {topCategories.map(([cat, val]) => {
                    const pct = totalExpense > 0 ? Math.round((val / totalExpense) * 100) : 0;
                    return (
                      <div key={cat} className="flex items-center gap-2 text-xs">
                        <span className="w-32 shrink-0 font-semibold text-gray-600">{cat}</span>
                        <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div className="h-full rounded-full bg-[var(--color-primary-pink)]" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-20 text-right font-bold text-dark">{formatCurrency(val, trip.currency)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Halaman 2: Itinerary + Booking */}
          <section className="print-page">
            <div className="flex items-center gap-2 mb-4">
              <span className="print-page-number">01</span>
              <h2 className="print-page-title">Itinerary Harian</h2>
            </div>

            <div className="space-y-4">
              {sortedDays.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada agenda aktivitas.</p>
              ) : (
                sortedDays.map((day) => {
                  const dayItems = sortedItems.filter(i => i.dayId === day.id);
                  return (
                    <div key={day.id} className="avoid-break">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="shrink-0 w-9 h-9 rounded-xl bg-[var(--color-primary-pink)] text-white flex items-center justify-center text-xs font-black">
                          {String(day.dayNumber).padStart(2, '0')}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm text-dark leading-tight">{day.title}</h4>
                          <p className="text-[11px] font-semibold text-gray-custom">{day.date}</p>
                        </div>
                      </div>
                      {dayItems.length === 0 ? (
                        <p className="text-xs text-gray-400 italic pl-12">Belum ada agenda aktivitas.</p>
                      ) : (
                        <div className="pl-12 space-y-1.5">
                          {dayItems.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-2.5">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="shrink-0 rounded-md bg-primary-pink/10 text-primary-pink text-[10px] font-black px-1.5 py-0.5">{item.time}</span>
                                  <span className="font-bold text-xs text-dark truncate">{item.title}</span>
                                  <span className="shrink-0 text-[10px] font-semibold rounded-full bg-white border border-gray-200 text-gray-500 px-2 py-0.5">{item.category}</span>
                                </div>
                                {item.location && <p className="text-[11px] text-gray-custom mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</p>}
                                {item.description && <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>}
                                {(item.spotImageUrl || item.imageUrl || item.outfitImageUrl) && (
                                  <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                                    {(item.spotImageUrl || item.imageUrl) && (
                                      <span className="inline-flex items-center gap-1">
                                        <img src={item.spotImageUrl || item.imageUrl} alt={`Spot ${item.title}`} className="h-10 w-14 rounded-md object-cover border border-gray-200" />
                                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-gray-custom"><MapPin className="w-2.5 h-2.5" />Spot</span>
                                      </span>
                                    )}
                                    {item.outfitImageUrl && (
                                      <span className="inline-flex items-center gap-1">
                                        <img src={item.outfitImageUrl} alt={`Outfit ${item.title}`} className="h-10 w-14 rounded-md object-cover border border-gray-200" />
                                        <span className="flex items-center gap-0.5 text-[9px] font-bold text-gray-custom"><Shirt className="w-2.5 h-2.5" />Outfit</span>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <span className="shrink-0 text-[11px] font-bold text-gray-600">{formatCurrency(item.estimatedCost, trip.currency)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Booking & Reservasi */}
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <Landmark className="w-4 h-4 text-primary-pink" />
                <h3 className="print-section-title">Booking & Reservasi</h3>
              </div>
              {bookings.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada reservasi.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {bookings.map((b) => (
                    <div key={b.id} className="avoid-break rounded-xl border border-card-pink p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-dark">{b.name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${bookingStatusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>{b.status}</span>
                      </div>
                      <p className="text-gray-500">{b.type} · {b.provider}{b.confirmationNumber ? ` · Code: ${b.confirmationNumber}` : ''}</p>
                      <p className="text-gray-500">{b.date}{b.time ? ` ${b.time}` : ''}</p>
                      {b.price > 0 && <p className="font-bold text-primary-pink">{formatCurrency(b.price, trip.currency)}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Halaman 3: Packing + Transport */}
          <section className="print-page">
            <div className="flex items-center gap-2 mb-4">
              <span className="print-page-number">02</span>
              <h2 className="print-page-title">Packing & Transport</h2>
            </div>

            <div className="avoid-break">
              <h3 className="print-section-title"><Luggage className="w-4 h-4" /> Packing Checklist ({packing.filter(p => p.isPacked).length}/{packing.length} Packed)</h3>
              {packing.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Belum ada item packing.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-xs mt-3">
                  {packing.map((p) => (
                    <div key={p.id} className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${p.isPacked ? 'text-[var(--color-primary-pink)]' : 'text-gray-300'}`} />
                      <span className={p.isPacked ? 'line-through text-gray-400' : 'font-medium'}>{p.name} <span className="text-gray-400">({p.quantity})</span></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {transports.length > 0 && (
              <div className="mt-6 avoid-break">
                <h3 className="print-section-title"><Route className="w-4 h-4" /> Rute Transport</h3>
                <div className="space-y-2 mt-3">
                  {transports.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 rounded-xl border border-card-pink p-3 text-xs">
                      <span className="shrink-0 w-8 h-8 rounded-xl bg-soft-pink text-primary-pink flex items-center justify-center">
                        {transportIcon(t.type)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-dark truncate">{t.origin} → {t.destination}</p>
                        <p className="text-[11px] text-gray-500">{t.type}{t.duration ? ` · ${t.duration}` : ''}{t.distance ? ` · ${t.distance}` : ''}</p>
                      </div>
                      {t.estimatedCost > 0 && (
                        <span className="shrink-0 font-bold text-gray-600">{formatCurrency(t.estimatedCost, trip.currency)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  , document.body);
};