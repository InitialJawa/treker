import React from 'react';
import { Calendar, DollarSign, Users, CheckSquare, Clock, MapPin, ArrowRight, ShieldCheck, AlertCircle, Plus } from 'lucide-react';
import { Trip, ItineraryDay, ItineraryItem, Booking, PackingItem, Expense } from '../../types/travel';
import { formatCurrency, calculateTripDurationDays, calculateDaysToGo } from '../../utils/formatters';

interface TabOverviewProps {
  trip: Trip;
  days: ItineraryDay[];
  items: ItineraryItem[];
  bookings: Booking[];
  packing: PackingItem[];
  expenses: Expense[];
  onNavigateTab: (tabName: string) => void;
}

export const TabOverview: React.FC<TabOverviewProps> = ({
  trip,
  days,
  items,
  bookings,
  packing,
  expenses,
  onNavigateTab,
}) => {
  const duration = calculateTripDurationDays(trip.startDate, trip.endDate);
  const daysToGo = calculateDaysToGo(trip.startDate);

  // Preparation Progress Math
  const totalTasks = 11; // Standard benchmark tasks
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

  // Upcoming activities
  const sortedItems = [...items].sort((a, b) => a.time.localeCompare(b.time));
  const upcomingActivities = sortedItems.slice(0, 4);

  return (
    <div className="space-[#20263D] space-y-6">
      {/* 3 Core Quick Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Duration */}
        <div className="bg-white p-5 rounded-[24px] border border-card-pink shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-custom uppercase tracking-wider">Duration</span>
            <h3 className="text-xl font-extrabold text-dark mt-0.5">{duration} Days</h3>
            <p className="text-xs font-medium text-primary-pink mt-1">{daysToGo > 0 ? `${daysToGo} Days to Go` : 'Trip Active'}</p>
          </div>
          <div className="w-11 h-11 rounded-[16px] bg-soft-pink text-primary-pink flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2: Budget */}
        <div className="bg-white p-5 rounded-[24px] border border-card-pink shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-custom uppercase tracking-wider">Budget Spent</span>
            <h3 className="text-xl font-extrabold text-dark mt-0.5">{formatCurrency(trip.actualSpent, trip.currency)}</h3>
            <p className="text-xs text-gray-custom mt-1">of {formatCurrency(trip.budget, trip.currency)}</p>
          </div>
          <div className="w-11 h-11 rounded-[16px] bg-soft-pink text-primary-pink flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3: Bookings */}
        <div className="bg-white p-5 rounded-[24px] border border-card-pink shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-custom uppercase tracking-wider">Bookings</span>
            <h3 className="text-xl font-extrabold text-dark mt-0.5">{confirmedBookingsCount} Confirmed</h3>
            <p className="text-xs text-gray-custom mt-1">of {bookings.length} reservations</p>
          </div>
          <div className="w-11 h-11 rounded-[16px] bg-soft-pink text-primary-pink flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4: Travelers */}
        <div className="bg-white p-5 rounded-[24px] border border-card-pink shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-custom uppercase tracking-wider">Travelers</span>
            <h3 className="text-xl font-extrabold text-dark mt-0.5">{trip.travelersCount} People</h3>
            <p className="text-xs text-gray-custom mt-1">{trip.destination}</p>
          </div>
          <div className="w-11 h-11 rounded-[16px] bg-soft-pink text-primary-pink flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Preparation Progress Bar Widget */}
      <div className="bg-white p-6 rounded-[32px] border border-card-pink shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-extrabold text-base text-dark">Trip Preparation</h3>
            <p className="text-xs text-gray-custom">Kemajuan persiapan perjalanan menuju {trip.destination}</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-primary-pink">{prepPercentage}%</span>
            <p className="text-xs font-medium text-gray-custom">{completedTasks} of {totalTasks} tasks completed</p>
          </div>
        </div>

        {/* Progress Fill Bar */}
        <div className="w-full h-3 bg-soft-pink rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-pink transition-all duration-500 rounded-full"
            style={{ width: `${prepPercentage}%` }}
          />
        </div>

        {/* Task Pills Checklist */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-card-pink text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${items.length > 0 ? 'bg-primary-pink text-white' : 'bg-gray-200'}`}>
              ✓
            </div>
            <span className={items.length > 0 ? 'font-semibold text-dark' : 'text-gray-400'}>Itinerary Drafted</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${confirmedBookingsCount > 0 ? 'bg-primary-pink text-white' : 'bg-gray-200'}`}>
              ✓
            </div>
            <span className={confirmedBookingsCount > 0 ? 'font-semibold text-dark' : 'text-gray-400'}>Hotels & Flights Booked</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${expenses.length > 0 ? 'bg-primary-pink text-white' : 'bg-gray-200'}`}>
              ✓
            </div>
            <span className={expenses.length > 0 ? 'font-semibold text-dark' : 'text-gray-400'}>Budget Calculated</span>
          </div>

          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${packingRatio >= 0.7 ? 'bg-primary-pink text-white' : 'bg-gray-200'}`}>
              ✓
            </div>
            <span className={packingRatio >= 0.7 ? 'font-semibold text-dark' : 'text-gray-400'}>Packing List Done</span>
          </div>
        </div>
      </div>

      {/* Grid: Upcoming Schedule & Actionable Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Activities Schedule */}
        <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-card-pink shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-pink" />
              <h3 className="font-extrabold text-base text-dark">Upcoming Schedule</h3>
            </div>
            <button
              onClick={() => onNavigateTab('Itinerary')}
              className="text-xs font-bold text-primary-pink hover:underline flex items-center gap-1"
            >
              See All Itinerary <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {upcomingActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">Belum ada aktivitas di itinerary.</p>
              <button
                onClick={() => onNavigateTab('Itinerary')}
                className="mt-3 px-5 py-2.5 rounded-full bg-primary-pink text-white text-xs font-bold hover:bg-opacity-90 transition-all"
              >
                + Tambah Aktivitas
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingActivities.map((act) => (
                <div key={act.id} className="p-4 rounded-3xl border border-card-pink hover:border-primary-pink bg-offwhite hover:bg-soft-pink/50 transition-all flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-extrabold bg-primary-pink text-white px-3 py-1.5 rounded-full shrink-0">
                      {act.time}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-dark">{act.title}</h4>
                      <p className="text-xs text-gray-custom flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-primary-pink" />
                        {act.location} • {act.duration}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-dark shrink-0">
                    {formatCurrency(act.estimatedCost, trip.currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Quick Preparation Actions */}
        <div className="bg-white p-6 rounded-[32px] border border-card-pink shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-dark mb-3">Aksi Cepat Preparation</h3>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('Itinerary')}
                className="w-full text-left p-4 rounded-[20px] border border-card-pink hover:bg-soft-pink flex items-center justify-between text-xs font-bold text-dark transition-colors"
              >
                <span>+ Tambah Agenda Itinerary</span>
                <Plus className="w-4 h-4 text-primary-pink" />
              </button>

              <button
                onClick={() => onNavigateTab('Bookings')}
                className="w-full text-left p-4 rounded-[20px] border border-card-pink hover:bg-soft-pink flex items-center justify-between text-xs font-bold text-dark transition-colors"
              >
                <span>+ Catat Reservasi Hotel/Tiket</span>
                <Plus className="w-4 h-4 text-primary-pink" />
              </button>

              <button
                onClick={() => onNavigateTab('Budget')}
                className="w-full text-left p-4 rounded-[20px] border border-card-pink hover:bg-soft-pink flex items-center justify-between text-xs font-bold text-dark transition-colors"
              >
                <span>+ Input Pengeluaran Budget</span>
                <Plus className="w-4 h-4 text-primary-pink" />
              </button>

              <button
                onClick={() => onNavigateTab('Packing')}
                className="w-full text-left p-4 rounded-[20px] border border-card-pink hover:bg-soft-pink flex items-center justify-between text-xs font-bold text-dark transition-colors"
              >
                <span>🎒 Ceklist Barang Bawaan</span>
                <ArrowRight className="w-4 h-4 text-primary-pink" />
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-3xl bg-soft-pink/50 border border-card-pink text-[11px] text-dark font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary-pink shrink-0" />
            <span>Jangan lupa mengunggah bukti e-tiket & konfirmasi hotel di tab Bookings!</span>
          </div>
        </div>
      </div>
    </div>
  );
};
