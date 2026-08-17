import React, { useState } from 'react';
import { Plus, CheckSquare, Trash2, Wand2, CheckCircle2, Pencil } from 'lucide-react';
import { Trip, PackingItem, PackingCategory } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';

interface TabPackingProps {
  trip: Trip;
  packing: PackingItem[];
}

export const TabPacking: React.FC<TabPackingProps> = ({ trip, packing }) => {
  const { addPackingItem, updatePackingItem, togglePackingItem, deletePackingItem, generateAIPackingListForTrip } = useTripContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);

  // Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState<PackingCategory>('Clothing');
  const [quantity, setQuantity] = useState(1);

  const tripPacking = packing.filter(p => p.tripId === trip.id);
  const packedCount = tripPacking.filter(p => p.isPacked).length;
  const totalCount = tripPacking.length;
  const packedPercent = totalCount > 0 ? Math.round((packedCount / totalCount) * 100) : 0;

  const categories: PackingCategory[] = ['Documents', 'Clothing', 'Electronics', 'Toiletries', 'Other'];

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setCategory('Clothing');
    setQuantity(1);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PackingItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      await updatePackingItem(editingItem.id, {
        name,
        category,
        quantity,
      });
    } else {
      await addPackingItem({
        tripId: trip.id,
        name,
        category,
        quantity,
      });
    }
    setName('');
    setEditingItem(null);
    setIsModalOpen(false);
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      await generateAIPackingListForTrip(trip.id);
      setIsGenerating(false);
    } catch (err) {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-card-pink p-3 md:p-6 rounded-3xl border border-card-pink shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-4">
          <div>
            <span className="text-xs font-extrabold text-primary-pink tracking-wider uppercase">Checklist</span>
            <h2 className="text-xl md:text-2xl font-black text-dark">Packing List Planner</h2>
            <p className="text-xs text-gray-custom mt-0.5">
              {packedCount} of {totalCount} items packed ({packedPercent}%)
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="bg-soft-pink hover:bg-soft-pink/80 text-primary-pink border border-card-pink px-3 md:px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? 'Generating...' : 'AI Auto-Fill List'}</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="bg-primary-pink hover:bg-opacity-90 text-white px-3 md:px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Item</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 bg-soft-pink rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-pink transition-all duration-500 rounded-full"
            style={{ width: `${packedPercent}%` }}
          />
        </div>
      </div>

      {/* Category Groups */}
      {tripPacking.length === 0 ? (
        <div className="bg-card-pink rounded-3xl border border-card-pink p-12 text-center text-gray-custom shadow-sm">
          <CheckSquare className="w-12 h-12 mx-auto mb-2 text-soft-pink" />
          <h3 className="font-bold text-sm md:text-base text-dark">Belum ada item barang bawaan</h3>
          <p className="text-xs text-gray-custom mt-1 mb-4">Klik AI Auto-Fill untuk menghasilkan daftar barang bawaan otomatis.</p>
          <button
            onClick={handleGenerateAI}
            className="bg-primary-pink text-white px-3 md:px-5 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 hover:bg-opacity-90 transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Generate Packing List AI</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((cat) => {
            const catItems = tripPacking.filter(p => p.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="bg-card-pink rounded-3xl border border-card-pink overflow-hidden shadow-sm">
                <div className="p-3 md:p-5 bg-surface-muted border-b border-card-pink flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-dark">{cat}</h3>
                  <span className="text-xs font-semibold text-gray-custom">
                    {catItems.filter(i => i.isPacked).length}/{catItems.length} Packed
                  </span>
                </div>

                <div className="divide-y divide-card-pink text-xs">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => togglePackingItem(item.id)}
                      className="p-2 md:p-4 hover:bg-soft-pink/50 cursor-pointer flex items-center justify-between gap-3 transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                          item.isPacked ? 'bg-primary-pink border-primary-pink text-white' : 'border-white bg-card-pink'
                        }`}>
                          {item.isPacked && <CheckCircle2 className="w-4 h-4" />}
                        </div>

                        <span className={`font-bold text-sm ${
                          item.isPacked ? 'line-through text-gray-custom/70' : 'text-dark'
                        }`}>
                          {item.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-surface-muted font-bold px-3 py-1 rounded-full text-dark border border-card-pink mr-1">
                          x{item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(item, e)}
                          aria-label={`Edit item ${item.name}`}
                          title="Edit item"
                          className="p-1.5 hover:bg-pink-100/80 text-gray-custom/70 hover:text-primary-pink rounded-full transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePackingItem(item.id);
                          }}
                          aria-label={`Hapus item ${item.name}`}
                          title="Hapus item"
                          className="p-1.5 hover:bg-red-50 text-gray-custom/70 hover:text-red-500 rounded-full transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-2 md:p-4">
          <div className="bg-card-pink rounded-2xl max-w-md w-full p-3 md:p-6 shadow-2xl border border-card-pink">
            <h3 className="font-bold text-sm md:text-base text-dark mb-4">
              {editingItem ? 'Edit Item Packing' : 'Tambah Item Packing'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-dark mb-1">Nama Item</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Powerbank 20000mAh"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-hidden focus:border-primary-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-dark mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PackingCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-hidden focus:border-primary-pink"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-dark mb-1">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    min={1}
                    className="w-full px-3 py-2 rounded-xl border border-card-pink bg-screen-pink focus:outline-hidden focus:border-primary-pink"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 md:px-4 py-2 rounded-xl border border-card-pink font-bold text-gray-custom hover:bg-surface-muted transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 md:px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  {editingItem ? 'Simpan Perubahan' : 'Tambah Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
