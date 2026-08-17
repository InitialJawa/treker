import React, { useRef, useState, useMemo } from 'react';
import { Trip, MoodboardItem } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { resizeImage } from '../../utils/imageUtils';
import { 
  Plus, Trash2, Loader2, X, Maximize2, Edit2, 
  Upload, FolderPlus, Search, Pin, Download, Check
} from 'lucide-react';
import { ProjectMediaPickerModal } from '../ProjectMediaPickerModal';

interface TabMoodboardProps {
  trip: Trip;
  items: MoodboardItem[];
}

export const TabMoodboard: React.FC<TabMoodboardProps> = ({ trip, items }) => {
  const { addMoodboardItem, deleteMoodboardItem, updateMoodboardItem } = useTripContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Semua');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [activeItem, setActiveItem] = useState<MoodboardItem | null>(null);
  
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<string>('Spot Foto');

  // Lightbox / Pin Detail Modal
  const [lightboxItem, setLightboxItem] = useState<MoodboardItem | null>(null);

  const categories = ['Semua', 'Spot Foto', 'OOTD & Fashion', 'Destinasi', 'Kuliner & Cafe'];
  const categoryOptions = ['Spot Foto', 'OOTD & Fashion', 'Destinasi', 'Kuliner & Cafe'];

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        !searchQuery || 
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.caption && item.caption.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (activeCategory === 'Semua') return true;

      // Match item.category directly
      if (item.category) {
        return item.category === activeCategory;
      }

      // Fallback matching for legacy items without category set
      const text = `${item.title || ''} ${item.caption || ''}`.toLowerCase();
      if (activeCategory === 'Spot Foto') return text.includes('foto') || text.includes('spot') || text.includes('pose');
      if (activeCategory === 'OOTD & Fashion') return text.includes('ootd') || text.includes('baju') || text.includes('outfit') || text.includes('pakaian');
      if (activeCategory === 'Destinasi') return text.includes('pantai') || text.includes('wisata') || text.includes('gunung') || text.includes('lokasi');
      if (activeCategory === 'Kuliner & Cafe') return text.includes('makan') || text.includes('cafe') || text.includes('kuliner') || text.includes('kopi');
      
      return false;
    });
  }, [items, searchQuery, activeCategory]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const resizedBase64 = await resizeImage(file, 1200);
      setModalMode('add');
      setTempImage(resizedBase64);
      setTitle('');
      setCaption('');
      setCategory(activeCategory !== 'Semua' ? activeCategory : 'Spot Foto');
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resizedBase64 = await resizeImage(file, 1200);
      setTempImage(resizedBase64);
    } catch (error) {
      console.error('Error replacing image:', error);
    } finally {
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = '';
      }
    }
  };

  const handleOpenEdit = (item: MoodboardItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setModalMode('edit');
    setActiveItem(item);
    setTempImage(item.imageUrl);
    setTitle(item.title || '');
    setCaption(item.caption || '');
    setCategory(item.category || 'Spot Foto');
    setIsModalOpen(true);
  };

  const handleSaveUpload = async () => {
    if (!tempImage) return;
    
    if (modalMode === 'add') {
      await addMoodboardItem(trip.id, tempImage, title, caption, category);
    } else if (modalMode === 'edit' && activeItem) {
      await updateMoodboardItem(activeItem.id, { 
        imageUrl: tempImage, 
        title, 
        caption,
        category 
      });
      if (lightboxItem && lightboxItem.id === activeItem.id) {
        setLightboxItem({ ...lightboxItem, imageUrl: tempImage, title, caption, category });
      }
    }
    
    setIsModalOpen(false);
    setTempImage(null);
    setActiveItem(null);
    setTitle('');
    setCaption('');
  };

  const handleDelete = async (itemId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    await deleteMoodboardItem(itemId);
    if (lightboxItem?.id === itemId) {
      setLightboxItem(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Pinterest-style Banner / Header */}
      <div className="bg-card-pink rounded-3xl p-5 md:p-6 border border-card-pink shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-soft-pink text-primary-pink rounded-xl">
                <Pin className="w-4 h-4 fill-current" />
              </span>
              <span className="text-xs font-extrabold text-primary-pink uppercase tracking-wider">Moodboard Board</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-dark">Moodboard & Inspirasi Visual</h2>
            <p className="text-xs text-gray-custom mt-1">
              Kumpulkan referensi foto estetik, ide OOTD, dan spot instagramable untuk <span className="font-bold text-dark">{trip.destination}</span>.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsProjectPickerOpen(true)}
              className="bg-card-pink hover:bg-soft-pink text-primary-pink border border-card-pink px-4 py-2.5 rounded-full font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Impor dari Project</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-primary-pink hover:bg-opacity-90 text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 stroke-[3]" />
              )}
              <span>{isUploading ? 'Menyiapkan...' : 'Tambah Pin Baru'}</span>
            </button>

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* Filter & Search Bar - Always visible */}
        <div className="mt-5 pt-4 border-t border-card-pink flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const count = cat === 'Semua' 
                ? items.length 
                : items.filter(i => (i.category || 'Spot Foto') === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === cat
                      ? 'bg-dark text-white shadow-xs'
                      : 'bg-surface-muted text-gray-custom hover:bg-pink-100/60 hover:text-dark'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeCategory === cat ? 'bg-white/20 text-white' : 'bg-card-pink text-gray-custom'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-custom absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ide / pin..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs border border-card-pink bg-surface-muted focus:bg-card-pink focus:outline-hidden focus:border-primary-pink transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-custom hover:text-dark text-xs"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="bg-card-pink rounded-3xl border border-card-pink p-12 text-center shadow-xs max-w-xl mx-auto my-8">
          <div className="w-16 h-16 bg-soft-pink border border-card-pink rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Pin className="w-8 h-8 text-primary-pink fill-primary-pink/20" />
          </div>
          <h3 className="font-extrabold text-base md:text-lg text-dark mb-2">Papan Moodboard Masih Kosong</h3>
          <p className="text-xs text-gray-custom leading-relaxed mb-6">
            Mulai kumpulkan ide visual untuk trip Anda. Upload foto dari galeri atau impor gambar tempat favorit dari proyek Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary-pink hover:bg-opacity-90 text-white px-5 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Upload Foto Pertama</span>
            </button>
            <button
              type="button"
              onClick={() => setIsProjectPickerOpen(true)}
              className="bg-white hover:bg-slate-50 text-dark border border-card-pink px-4 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-primary-pink" />
              <span>Pilih Foto Tempat</span>
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-card-pink rounded-3xl border border-card-pink p-8 text-center text-gray-custom shadow-xs">
          <p className="text-xs font-semibold">Tidak ada pin di kategori <span className="font-bold text-dark">"{activeCategory}"</span> {searchQuery ? `dengan pencarian "${searchQuery}"` : ''}.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('Semua'); }}
            className="mt-3 bg-primary-pink text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xs hover:bg-opacity-90 transition-all cursor-pointer"
          >
            Lihat Semua Pin ({items.length})
          </button>
        </div>
      ) : (
        /* PINTEREST MASONRY GRID */
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-card-pink border border-card-pink/80 shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Image Container */}
              <div className="relative w-full overflow-hidden bg-surface-muted">
                <img 
                  src={item.imageUrl} 
                  alt={item.title || "Moodboard pin"} 
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Always visible category badge tag */}
                <div className="absolute top-2.5 left-2.5 z-1">
                  <span className="bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-xs">
                    {item.category || 'Spot Foto'}
                  </span>
                </div>

                {/* Pinterest Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-between">
                  {/* Top Overlay Actions */}
                  <div className="flex items-center justify-between">
                    <span className="bg-primary-pink text-white font-extrabold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs shadow-xs flex items-center gap-1">
                      <Pin className="w-3 h-3 fill-current" /> Simpan
                    </span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setLightboxItem(item); }}
                      className="bg-white/90 text-dark p-1.5 rounded-full hover:bg-white transition-all shadow-xs"
                      title="Perbesar"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Overlay Actions */}
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(item, e)}
                      className="bg-white/90 text-dark hover:bg-white p-1.5 rounded-full transition-all shadow-xs"
                      title="Edit Pin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(item.id, e)}
                      className="bg-white/90 text-red-600 hover:bg-red-600 hover:text-white p-1.5 rounded-full transition-all shadow-xs"
                      title="Hapus Pin"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pin Caption / Info Footer */}
              {(item.title || item.caption) && (
                <div className="p-3 bg-card-pink border-t border-card-pink/50">
                  {item.title && (
                    <h4 className="font-extrabold text-xs text-dark line-clamp-1 group-hover:text-primary-pink transition-colors">
                      {item.title}
                    </h4>
                  )}
                  {item.caption && (
                    <p className="text-[11px] text-gray-custom leading-snug line-clamp-2 mt-0.5 font-normal">
                      {item.caption}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs z-50 animate-fade-in">
          <div className="bg-card-pink rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-card-pink">
            <div className="p-4 border-b border-card-pink flex justify-between items-center bg-surface-muted">
              <h3 className="font-black text-dark text-sm flex items-center gap-2">
                <Pin className="w-4 h-4 text-primary-pink fill-current" />
                {modalMode === 'add' ? 'Detail Pin Baru' : 'Edit Detail Pin'}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); setTempImage(null); setActiveItem(null); }}
                aria-label="Tutup"
                className="text-gray-custom hover:text-dark p-1 rounded-full hover:bg-card-pink transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {tempImage && (
                <div className="relative w-full max-h-64 bg-surface-muted rounded-2xl overflow-hidden group border border-card-pink">
                  <img src={tempImage} alt="Preview" className="w-full h-full object-contain mx-auto" />
                  
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button 
                      onClick={() => replaceFileInputRef.current?.click()} 
                      className="bg-white/90 hover:bg-white text-dark px-4 py-2 rounded-full text-xs font-bold flex gap-2 items-center shadow-md transition-all cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-primary-pink" /> Ganti Foto
                    </button>
                    <input 
                      type="file"
                      ref={replaceFileInputRef}
                      onChange={handleReplaceFile}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Category Selector Field */}
              <div>
                <label className="block text-xs font-bold text-dark mb-1.5">Pilih Kategori Pin</label>
                <div className="grid grid-cols-2 gap-2">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border text-left flex items-center justify-between cursor-pointer ${
                        category === cat
                          ? 'bg-primary-pink text-white border-primary-pink shadow-2xs'
                          : 'bg-surface-muted border-card-pink text-gray-custom hover:border-primary-pink/50'
                      }`}
                    >
                      <span>{cat}</span>
                      {category === cat && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Judul Pin (Opsional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: OOTD Pantai Keren, Spot Foto Sunset"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-pink bg-surface-muted focus:bg-card-pink focus:outline-hidden focus:border-primary-pink text-xs transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Catatan / Caption (Opsional)</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tambahkan catatan lokasi, jam foto terbaik, atau tips..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-card-pink bg-surface-muted focus:bg-card-pink focus:outline-hidden focus:border-primary-pink text-xs transition-colors"
                />
              </div>
            </div>

            <div className="p-4 border-t border-card-pink flex justify-end gap-2 bg-surface-muted">
              <button
                onClick={() => { setIsModalOpen(false); setTempImage(null); setActiveItem(null); }}
                className="px-4 py-2 rounded-xl border border-card-pink font-bold text-xs text-gray-custom hover:bg-card-pink transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveUpload}
                className="px-5 py-2.5 rounded-full bg-primary-pink hover:bg-opacity-90 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {modalMode === 'add' ? 'Simpan ke Board' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Pinterest Detail Modal */}
      {lightboxItem && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in z-50" 
          onClick={() => setLightboxItem(null)}
        >
          <button 
            aria-label="Tutup lightbox"
            className="absolute top-4 right-4 text-white hover:text-primary-pink p-2 bg-black/50 rounded-full backdrop-blur-xs transition-colors cursor-pointer z-10"
            onClick={() => setLightboxItem(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="relative bg-card-pink rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-card-pink/50 animate-scale-up" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image Side */}
            <div className="flex-1 bg-black/90 flex items-center justify-center p-4 min-h-[300px] md:min-h-[500px]">
              <img 
                src={lightboxItem.imageUrl} 
                alt={lightboxItem.title || 'Moodboard pin'} 
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>

            {/* Sidebar Details */}
            <div className="w-full md:w-80 p-6 flex flex-col justify-between bg-card-pink border-t md:border-t-0 md:border-l border-card-pink">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="bg-soft-pink text-primary-pink font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1">
                    <Pin className="w-3.5 h-3.5 fill-current" /> {lightboxItem.category || 'Spot Foto'}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black text-dark leading-snug">
                    {lightboxItem.title || 'Inspirasi Visual'}
                  </h3>
                  {lightboxItem.caption ? (
                    <p className="text-xs text-gray-custom leading-relaxed mt-2 whitespace-pre-wrap">
                      {lightboxItem.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-custom italic mt-2">Tidak ada catatan untuk pin ini.</p>
                  )}
                </div>
              </div>

              {/* Action Buttons in Modal */}
              <div className="pt-6 border-t border-card-pink flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(lightboxItem)}
                    className="p-2 bg-surface-muted hover:bg-pink-100 text-dark rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-primary-pink" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lightboxItem.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>

                <a
                  href={lightboxItem.imageUrl}
                  download="moodboard-pin.png"
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 bg-dark text-white hover:bg-black rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Media Picker Modal */}
      <ProjectMediaPickerModal
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        onSelectImage={(url) => {
          addMoodboardItem(
            trip.id, 
            url, 
            'Inspirasi Tempat', 
            'Diimpor dari folder project', 
            activeCategory !== 'Semua' ? activeCategory : 'Destinasi'
          );
          setIsProjectPickerOpen(false);
        }}
        title="Tambah Foto dari Project ke Moodboard"
      />
    </div>
  );
};

