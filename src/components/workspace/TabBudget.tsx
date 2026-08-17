import React, { useState } from 'react';
import { Plus, Wallet, TrendingUp, AlertTriangle, CheckCircle2, Clock, Edit3, Trash2, PieChart, Users, Calendar, Filter, CreditCard } from 'lucide-react';
import { Trip, Expense, ExpenseCategory, ItineraryItem, Booking, TransportLeg } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { formatCurrency } from '../../utils/formatters';
import { calculateTripBudgetSummary } from '../../utils/budgetUtils';

interface TabBudgetProps {
  trip: Trip;
  expenses: Expense[];
  itineraryItems?: ItineraryItem[];
  bookings?: Booking[];
  transports?: TransportLeg[];
}

export const TabBudget: React.FC<TabBudgetProps> = ({ trip, expenses, itineraryItems = [], bookings = [], transports = [] }) => {
  const { addExpense, updateExpense, deleteExpense } = useTripContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterSource, setFilterSource] = useState<'all' | 'manual' | 'bookings' | 'itinerary'>('all');

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [estimatedAmount, setEstimatedAmount] = useState(100000);
  const [actualAmount, setActualAmount] = useState(100000);
  const [status, setStatus] = useState<'paid' | 'unpaid'>('paid');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Kartu Kredit' | 'Transfer' | 'Other'>('QRIS');

  // Unified Budget Calculation
  const budgetSummary = calculateTripBudgetSummary(trip, expenses, itineraryItems, bookings, transports);
  const totalBudget = budgetSummary.totalBudget;
  const totalSpent = budgetSummary.totalSpent;
  const totalEstimated = budgetSummary.totalEstimated;
  const remaining = budgetSummary.remainingBudget;
  const spentPercent = budgetSummary.spentPercentage;
  const categoryTotals = budgetSummary.categoryTotals;

  // Additional Calculations: Cost per person & Daily limit
  const travelersCount = Math.max(1, trip.travelersCount || 1);
  const spentPerPerson = Math.round(totalSpent / travelersCount);
  const budgetPerPerson = Math.round(totalBudget / travelersCount);

  const startMs = new Date(trip.startDate).getTime();
  const endMs = new Date(trip.endDate).getTime();
  const tripDaysCount = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
  const dailySafeLimit = Math.max(0, Math.round(remaining / tripDaysCount));

  // Categories list for form select
  const categoriesList: ExpenseCategory[] = [
    'Transportation', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Tickets', 'Rental', 'Emergency', 'Other'
  ];

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setTitle('');
    setCategory('Food');
    setEstimatedAmount(100000);
    setActualAmount(100000);
    setStatus('paid');
    setDate(new Date().toISOString().split('T')[0]);
    setPaidBy('');
    setPaymentMethod('QRIS');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setCategory(exp.category);
    setEstimatedAmount(exp.estimatedAmount);
    setActualAmount(exp.actualAmount);
    setStatus(exp.status);
    setDate(exp.date);
    setPaidBy(exp.paidBy || '');
    setPaymentMethod(exp.paymentMethod || 'QRIS');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title,
        category,
        estimatedAmount,
        actualAmount,
        status,
        date,
        paidBy: paidBy.trim() || undefined,
        paymentMethod,
      });
    } else {
      addExpense({
        tripId: trip.id,
        title,
        category,
        estimatedAmount,
        actualAmount,
        status,
        date,
        paidBy: paidBy.trim() || undefined,
        paymentMethod,
      });
    }
    setIsModalOpen(false);
  };

  const tripBookings = bookings.filter(b => b.tripId === trip.id && b.price > 0);
  const tripItineraryCosts = itineraryItems.filter(i => i.tripId === trip.id && i.estimatedCost > 0);

  return (
    <div className="space-y-6">
      {/* Top Budget Header Gauge */}
      <div className="bg-card-pink p-3 md:p-6 rounded-3xl border border-card-pink shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-4">
          <div>
            <span className="text-[10px] md:text-xs font-extrabold text-primary-pink tracking-wider uppercase">Ringkasan Budget</span>
            <h2 className="text-lg md:text-xl md:text-2xl font-black text-dark">
              {formatCurrency(totalSpent, trip.currency)} / {formatCurrency(totalBudget, trip.currency)}
            </h2>
            <p className="text-[10px] md:text-xs text-gray-custom mt-0.5">Sisa budget: {formatCurrency(remaining, trip.currency)}</p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-3 md:px-4 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 shadow-xs self-start md:self-auto transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengeluaran</span>
          </button>
        </div>

        {/* Progress Fill Bar */}
        <div className="w-full h-3.5 bg-soft-pink rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              spentPercent > 90 ? 'bg-red-500' : spentPercent > 75 ? 'bg-amber-500' : 'bg-primary-pink'
            }`}
            style={{ width: `${Math.min(100, spentPercent)}%` }}
          />
        </div>

        {/* Spent vs Remaining Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-card-pink text-xs">
          <div className="bg-surface-muted p-3 rounded-2xl border border-card-pink">
            <span className="text-gray-custom text-[10px] md:text-xs font-semibold block">Total Estimasi</span>
            <p className="text-xs md:text-sm font-extrabold text-dark mt-0.5">
              {formatCurrency(totalEstimated, trip.currency)}
            </p>
          </div>

          <div className="bg-soft-pink p-3 rounded-2xl border border-card-pink">
            <span className="text-primary-pink text-[10px] md:text-xs font-semibold block">Total Dibayar</span>
            <p className="text-xs md:text-sm font-extrabold text-primary-pink mt-0.5">{formatCurrency(totalSpent, trip.currency)}</p>
          </div>

          <div className="bg-amber-50/80 p-3 rounded-2xl border border-amber-200/80">
            <span className="text-amber-800 text-[10px] md:text-xs font-semibold flex items-center gap-1">
              <Users className="w-3 h-3" /> Biaya / Orang
            </span>
            <p className="text-xs md:text-sm font-extrabold text-amber-900 mt-0.5">
              {formatCurrency(spentPerPerson, trip.currency)}
            </p>
            <span className="text-[9px] text-amber-700">({travelersCount} Peserta)</span>
          </div>

          <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200/80">
            <span className="text-emerald-800 text-[10px] md:text-xs font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Batas Aman / Hari
            </span>
            <p className="text-xs md:text-sm font-extrabold text-emerald-900 mt-0.5">
              {formatCurrency(dailySafeLimit, trip.currency)}
            </p>
            <span className="text-[9px] text-emerald-700">({tripDaysCount} Hari Tersisa)</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-card-pink p-3 md:p-6 rounded-3xl border border-card-pink shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm md:text-base text-dark flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-pink" />
            Pengeluaran per Kategori
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {categoryTotals.map((cat) => {
              const catPercent = Math.min(100, Math.round((cat.actual / (totalSpent || 1)) * 100));
              const isHighSpend = totalBudget > 0 && cat.actual > totalBudget * 0.35;
              return (
                <div key={cat.category} className="p-3.5 rounded-2xl border border-card-pink bg-surface-muted relative">
                  <div className="flex justify-between text-xs font-bold text-dark mb-1.5">
                    <span className="flex items-center gap-1">
                      {cat.category}
                      {isHighSpend && (
                        <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-extrabold" title="Kategori pengeluaran terbesar (>35% budget)">
                          Tinggi
                        </span>
                      )}
                    </span>
                    <span>{formatCurrency(cat.actual, trip.currency)}</span>
                  </div>
                  <div className="w-full h-2 bg-soft-pink rounded-full overflow-hidden">
                    <div className={`h-full ${isHighSpend ? 'bg-amber-500' : 'bg-primary-pink'}`} style={{ width: `${catPercent}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-custom mt-1 text-right">{catPercent}% dari total terpakai</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Source Filter Tabs & Transaction List */}
      <div className="bg-card-pink rounded-3xl border border-card-pink overflow-hidden shadow-xs">
        <div className="p-3 md:p-5 border-b border-card-pink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-extrabold text-sm md:text-base text-dark">Rincian & Sumber Pengeluaran</h3>
          
          <div className="flex items-center gap-1 bg-surface-muted p-1 rounded-full text-[11px] font-bold overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilterSource('all')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${filterSource === 'all' ? 'bg-primary-pink text-white shadow-2xs' : 'text-gray-custom hover:text-dark'}`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterSource('manual')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${filterSource === 'manual' ? 'bg-primary-pink text-white shadow-2xs' : 'text-gray-custom hover:text-dark'}`}
            >
              Manual ({expenses.length})
            </button>
            <button
              onClick={() => setFilterSource('bookings')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${filterSource === 'bookings' ? 'bg-primary-pink text-white shadow-2xs' : 'text-gray-custom hover:text-dark'}`}
            >
              Bookings ({tripBookings.length})
            </button>
            <button
              onClick={() => setFilterSource('itinerary')}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${filterSource === 'itinerary' ? 'bg-primary-pink text-white shadow-2xs' : 'text-gray-custom hover:text-dark'}`}
            >
              Itinerary ({tripItineraryCosts.length})
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          {/* Render Manual Expenses */}
          {(filterSource === 'all' || filterSource === 'manual') && expenses.map((exp) => (
            <div key={exp.id} className="p-3 md:p-4 hover:bg-surface-muted flex items-center justify-between gap-2 md:gap-4 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-dark">{exp.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-soft-pink font-semibold text-[10px] text-primary-pink">
                    {exp.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${exp.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {exp.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                  </span>
                  {exp.paymentMethod && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                      {exp.paymentMethod}
                    </span>
                  )}
                </div>
                <p className="text-gray-custom text-[11px]">
                  Tanggal: {exp.date} {exp.paidBy ? `• Dibayar oleh: ${exp.paidBy}` : ''}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sm text-dark">
                  {formatCurrency(exp.actualAmount, trip.currency)}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(exp)}
                    aria-label={`Edit pengeluaran ${exp.title}`}
                    className="p-1.5 hover:bg-soft-pink rounded-full text-gray-custom hover:text-primary-pink cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteExpense(exp.id)}
                    aria-label={`Hapus pengeluaran ${exp.title}`}
                    className="p-1.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-500 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Render Bookings Expenses */}
          {(filterSource === 'all' || filterSource === 'bookings') && tripBookings.map((b) => (
            <div key={`booking-${b.id}`} className="p-3 md:p-4 bg-purple-50/40 hover:bg-purple-50/70 flex items-center justify-between gap-2 md:gap-4 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-dark">{b.name}</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-extrabold text-[10px]">
                    ✈️ Booking ({b.type})
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    {b.status}
                  </span>
                </div>
                <p className="text-gray-custom text-[11px]">
                  Provider: {b.provider} • Tanggal: {b.date}
                </p>
              </div>
              <span className="font-extrabold text-sm text-purple-900">
                {formatCurrency(b.price, trip.currency)}
              </span>
            </div>
          ))}

          {/* Render Itinerary Costs */}
          {(filterSource === 'all' || filterSource === 'itinerary') && tripItineraryCosts.map((item) => (
            <div key={`itinerary-${item.id}`} className="p-3 md:p-4 bg-amber-50/40 hover:bg-amber-50/70 flex items-center justify-between gap-2 md:gap-4 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm text-dark">{item.title}</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold text-[10px]">
                    📍 Itinerary ({item.category})
                  </span>
                </div>
                <p className="text-gray-custom text-[11px]">
                  Lokasi: {item.location || 'Aktivitas Trip'}
                </p>
              </div>
              <span className="font-extrabold text-sm text-amber-900">
                {formatCurrency(item.estimatedCost, trip.currency)}
              </span>
            </div>
          ))}

          {expenses.length === 0 && tripBookings.length === 0 && tripItineraryCosts.length === 0 && (
            <div className="p-8 text-center text-gray-custom">
              <Wallet className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">Belum ada item pengeluaran tercatat.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add / Edit Expense */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-card-pink rounded-3xl max-w-md w-full p-4 md:p-6 shadow-2xl border border-card-pink">
            <h3 className="font-extrabold text-base text-dark mb-4">
              {editingExpense ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-dark mb-1">Nama Pengeluaran</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="misal: Tiket Masuk Kawah Ijen / Makan Malam"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-none focus:border-primary-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-none focus:border-primary-pink"
                  >
                    {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-dark mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-none focus:border-primary-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Estimasi Biaya</label>
                  <input
                    type="number"
                    value={estimatedAmount}
                    onChange={(e) => setEstimatedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-none focus:border-primary-pink"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-dark mb-1">Biaya Terpakai</label>
                  <input
                    type="number"
                    value={actualAmount}
                    onChange={(e) => setActualAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-none focus:border-primary-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Ditalangi / Dibayar Oleh</label>
                  <input
                    type="text"
                    placeholder="misal: Budi / Saya"
                    value={paidBy}
                    onChange={(e) => setPaidBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-none focus:border-primary-pink"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-dark mb-1">Metode Pembayaran</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-none focus:border-primary-pink"
                  >
                    <option value="QRIS">QRIS</option>
                    <option value="Cash">Cash / Tunai</option>
                    <option value="Kartu Kredit">Kartu Kredit / Debit</option>
                    <option value="Transfer">Transfer Bank</option>
                    <option value="Other">Lainnya</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-dark mb-1">Status Pembayaran</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
                  className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-none focus:border-primary-pink"
                >
                  <option value="paid">Lunas (Paid)</option>
                  <option value="unpaid">Belum Dibayar (Unpaid)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-card-pink font-bold text-gray-custom cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90 shadow-2xs cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
