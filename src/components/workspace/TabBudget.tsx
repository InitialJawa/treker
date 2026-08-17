import React, { useState } from 'react';
import { Plus, Wallet, TrendingUp, AlertTriangle, CheckCircle2, Clock, Edit3, Trash2, PieChart } from 'lucide-react';
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

  // Form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [estimatedAmount, setEstimatedAmount] = useState(100000);
  const [actualAmount, setActualAmount] = useState(100000);
  const [status, setStatus] = useState<'paid' | 'unpaid'>('paid');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Unified Budget Calculation
  const budgetSummary = calculateTripBudgetSummary(trip, expenses, itineraryItems, bookings, transports);
  const totalBudget = budgetSummary.totalBudget;
  const totalSpent = budgetSummary.totalSpent;
  const totalEstimated = budgetSummary.totalEstimated;
  const remaining = budgetSummary.remainingBudget;
  const spentPercent = budgetSummary.spentPercentage;
  const categoryTotals = budgetSummary.categoryTotals;

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
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Budget Header Gauge */}
      <div className="bg-card-pink p-3 md:p-6 rounded-3xl border border-card-pink shadow-sm">
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
            className="bg-primary-pink hover:bg-opacity-90 text-white px-3 md:px-4 py-1.5 md:px-5 md:py-2.5 rounded-full font-bold text-[10px] md:text-xs flex items-center gap-1.5 md:gap-2 shadow-sm self-start md:self-auto transition-all"
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
            style={{ width: `${spentPercent}%` }}
          />
        </div>

        {/* Spent vs Remaining Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-card-pink text-xs">
          <div className="bg-surface-muted p-3 rounded-2xl border border-card-pink">
            <span className="text-gray-custom font-semibold">Total Estimasi (Termasuk Itinerary)</span>
            <p className="text-sm font-extrabold text-dark">
              {formatCurrency(
                totalEstimated,
                trip.currency
              )}
            </p>
          </div>

          <div className="bg-soft-pink p-3 rounded-2xl border border-card-pink">
            <span className="text-primary-pink font-semibold">Total yang Dibayar</span>
            <p className="text-sm font-extrabold text-primary-pink">{formatCurrency(totalSpent, trip.currency)}</p>
          </div>

          <div className="bg-card-pink p-3 rounded-2xl border border-card-pink">
            <span className="text-gray-custom font-semibold">Sisa Budget</span>
            <p className="text-sm font-extrabold text-dark">{formatCurrency(remaining, trip.currency)}</p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryTotals.length > 0 && (
        <div className="bg-card-pink p-3 md:p-6 rounded-3xl border border-card-pink shadow-sm">
          <h3 className="font-extrabold text-sm md:text-base text-dark mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary-pink" />
            Expense Breakdown by Category
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
            {categoryTotals.map((cat) => {
              const catPercent = Math.min(100, Math.round((cat.actual / (totalSpent || 1)) * 100));
              return (
                <div key={cat.category} className="p-3.5 rounded-2xl border border-card-pink bg-surface-muted">
                  <div className="flex justify-between text-xs font-bold text-dark mb-1.5">
                    <span>{cat.category}</span>
                    <span>{formatCurrency(cat.actual, trip.currency)}</span>
                  </div>
                  <div className="w-full h-2 bg-soft-pink rounded-full overflow-hidden">
                    <div className="h-full bg-primary-pink" style={{ width: `${catPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expenses Table / List */}
      <div className="bg-card-pink rounded-3xl border border-card-pink overflow-hidden shadow-sm">
        <div className="p-3 md:p-5 border-b border-card-pink flex items-center justify-between">
          <h3 className="font-extrabold text-sm md:text-base text-dark">Item Pengeluaran</h3>
          <span className="text-xs text-gray-custom font-semibold">{expenses.length} Transaksi</span>
        </div>

        {expenses.length === 0 ? (
          <div className="p-2 md:p-4 md:p-8 text-center text-gray-custom/70">
            <Wallet className="w-10 h-10 mx-auto mb-2 text-gray-custom" />
            <p className="text-sm font-medium">Belum ada item pengeluaran tercatat.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 text-xs">
            {expenses.map((exp) => (
              <div key={exp.id} className="p-2 md:p-4 hover:bg-surface-muted flex items-center justify-between gap-2 md:gap-4 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-dark">{exp.title}</span>
                    <span className="px-2 py-0.5 rounded-full bg-soft-pink font-semibold text-[10px] text-primary-pink">
                      {exp.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        exp.status === 'paid'
                          ? 'bg-primary-pink text-white'
                          : 'bg-card-pink text-dark'
                      }`}
                    >
                      {exp.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  <p className="text-gray-custom text-[11px]">
                    Tanggal: {exp.date} • Estimasi: {formatCurrency(exp.estimatedAmount, trip.currency)}
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
                      className="p-1.5 hover:bg-soft-pink rounded-full text-gray-custom hover:text-primary-pink"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      aria-label={`Hapus pengeluaran ${exp.title}`}
                      className="p-1.5 hover:bg-red-50 rounded-full text-red-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-card-pink rounded-2xl max-w-md w-full p-3 md:p-6 shadow-2xl border border-card-pink">
            <h3 className="font-bold text-sm md:text-base text-dark mb-4">
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-dark mb-1">Nama Pengeluaran</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tiket Masuk Kawah Ijen"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                />
              </div>

              <div>
                <label className="block font-semibold text-dark mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                >
                  {categoriesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Estimasi Biaya</label>
                  <input
                    type="number"
                    value={estimatedAmount}
                    onChange={(e) => setEstimatedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-dark mb-1">Terpakai</label>
                  <input
                    type="number"
                    value={actualAmount}
                    onChange={(e) => setActualAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'paid' | 'unpaid')}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  >
                    <option value="paid">Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-dark mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 md:px-4 py-2 rounded-xl border border-card-pink font-bold text-gray-custom"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 md:px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
