import React, { useRef, useState } from 'react';
import { Trip, MoodboardItem } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { resizeImage } from '../../utils/imageUtils';
import { Plus, Trash2, Image as ImageIcon, Loader2, X, Maximize2, Edit2, Lock, Unlock, Upload, FolderPlus } from 'lucide-react';
import { Rnd } from 'react-rnd';
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
  const [isLocked, setIsLocked] = useState(true);
  const [isProjectPickerOpen, setIsProjectPickerOpen] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [activeItem, setActiveItem] = useState<MoodboardItem | null>(null);
  
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');

  const [lightboxImage, setLightboxImage] = useState<MoodboardItem | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const resizedBase64 = await resizeImage(file, 800);
      setModalMode('add');
      setTempImage(resizedBase64);
      setTitle('');
      setCaption('');
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
      const resizedBase64 = await resizeImage(file, 800);
      setTempImage(resizedBase64);
    } catch (error) {
      console.error('Error replacing image:', error);
    } finally {
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = '';
      }
    }
  };

  const handleOpenEdit = (item: MoodboardItem) => {
    setModalMode('edit');
    setActiveItem(item);
    setTempImage(item.imageUrl);
    setTitle(item.title || '');
    setCaption(item.caption || '');
    setIsModalOpen(true);
  };

  const handleSaveUpload = async () => {
    if (!tempImage) return;
    
    if (modalMode === 'add') {
      await addMoodboardItem(trip.id, tempImage, title, caption);
    } else if (modalMode === 'edit' && activeItem) {
      await updateMoodboardItem(activeItem.id, { 
        imageUrl: tempImage, 
        title, 
        caption 
      });
    }
    
    setIsModalOpen(false);
    setTempImage(null);
    setActiveItem(null);
    setTitle('');
    setCaption('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="bg-white rounded-3xl p-5 md:p-6 border border-card-pink shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-extrabold text-dark flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary-pink" />
            Moodboard Inspirasi
          </h2>
          <p className="text-xs text-gray-custom mt-1">
            Kumpulkan referensi visual, inspirasi OOTD, atau pose foto untuk {trip.destination}.
          </p>
        </div>
        
        <div className="flex gap-2 items-center">
          {items.length > 0 && (
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`px-3 md:px-5 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 shrink-0 border ${
                isLocked 
                  ? 'bg-dark text-white border-dark' 
                  : 'bg-white text-dark border-card-pink hover:border-gray-400'
              }`}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              <span className="hidden sm:inline">{isLocked ? 'Board Terkunci' : 'Board Bebas'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsProjectPickerOpen(true)}
            className="bg-rose-50 hover:bg-rose-100 text-primary-pink border border-rose-200 px-3 md:px-4 py-2.5 rounded-full font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Pilih dari Project</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-3 md:px-5 py-2.5 rounded-full font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>{isUploading ? 'Menyiapkan...' : 'Upload Foto'}</span>
          </button>
        </div>
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          className="hidden"
        />
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-card-pink p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-soft-pink rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-primary-pink" />
          </div>
          <h3 className="font-bold text-sm md:text-base text-dark mb-2">Papan Inspirasi Masih Kosong</h3>
          <p className="text-xs text-gray-custom max-w-md mx-auto mb-6">
            Kumpulkan ide-ide visual untuk liburan Anda. Upload referensi tempat estetik, ide pakaian, atau suasana yang ingin Anda ciptakan.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-card-pink hover:border-primary-pink text-dark hover:text-primary-pink px-3 md:px-5 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Foto Pertama</span>
          </button>
        </div>
      ) : (
        <div className={`relative w-full h-[600px] md:h-[800px] rounded-3xl border overflow-hidden shadow-inner transition-colors ${
          isLocked ? 'bg-gray-100/50 border-gray-200' : 'bg-gray-50/50 border-dashed border-gray-300'
        }`}>
          {items.map((item) => (
            <Rnd
              key={item.id}
              default={{
                x: item.x || Math.random() * 200,
                y: item.y || Math.random() * 200,
                width: item.width || 250,
                height: item.height || 250,
              }}
              minWidth={100}
              minHeight={100}
              bounds="parent"
              disableDragging={isLocked}
              enableResizing={!isLocked}
              style={{ zIndex: item.zIndex || 1 }}
              onDragStop={(e, d) => {
                if (isLocked) return;
                const maxZ = Math.max(...items.map(i => i.zIndex || 0), 0);
                updateMoodboardItem(item.id, { x: d.x, y: d.y, zIndex: maxZ + 1 });
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                if (isLocked) return;
                updateMoodboardItem(item.id, {
                  width: parseInt(ref.style.width),
                  height: parseInt(ref.style.height),
                  ...position,
                });
              }}
              className={`group ${!isLocked ? 'cursor-grab active:cursor-grabbing' : ''}`}
            >
              <div className="relative w-full h-full bg-white p-2 rounded-xl shadow-md border border-gray-200 flex flex-col pointer-events-auto">
                <div className="relative flex-1 overflow-hidden rounded-lg">
                  <img 
                    src={item.imageUrl} 
                    alt={item.title || "Moodboard item"} 
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                  
                  {/* Action Buttons in the Top Right Corner */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1 bg-black/40 p-1.5 rounded-lg backdrop-blur-sm z-10">
                    <button
                      onClick={(e) => { e.stopPropagation(); setLightboxImage(item); }}
                      className="bg-white/90 text-gray-800 p-1.5 rounded hover:bg-white hover:scale-105 transition-all shadow-sm"
                      title="Lihat Penuh"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    {!isLocked && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                          className="bg-white/90 text-gray-800 p-1.5 rounded hover:bg-white hover:scale-105 transition-all shadow-sm"
                          title="Edit Info"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteMoodboardItem(item.id); }}
                          className="bg-white/90 text-red-500 p-1.5 rounded hover:bg-red-500 hover:text-white hover:scale-105 transition-all shadow-sm"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {(item.title || item.caption) && (
                  <div className="pt-2 px-1 pb-1 text-center pointer-events-none">
                    {item.title && <h4 className="font-bold text-xs text-dark truncate">{item.title}</h4>}
                    {item.caption && <p className="text-[10px] text-gray-500 truncate">{item.caption}</p>}
                  </div>
                )}
              </div>
            </Rnd>
          ))}
        </div>
      )}

      {/* Upload/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-soft-pink/30">
              <h3 className="font-bold text-dark">
                {modalMode === 'add' ? 'Detail Foto Moodboard' : 'Edit Foto Moodboard'}
              </h3>
              <button 
                onClick={() => { setIsModalOpen(false); setTempImage(null); setActiveItem(null); }}
                className="text-gray-400 hover:text-dark p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {tempImage && (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden group">
                  <img src={tempImage} alt="Preview" className="w-full h-full object-contain" />
                  
                  {/* Button to replace image in edit mode */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button 
                      onClick={() => replaceFileInputRef.current?.click()} 
                      className="bg-white px-4 py-2 rounded-full text-xs font-bold flex gap-2 items-center text-gray-800 hover:scale-105 transition-transform"
                    >
                      <Upload className="w-4 h-4"/> Ganti Foto
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
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Judul Foto (Opsional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Inspirasi OOTD Pantai"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Keterangan / Caption (Opsional)</label>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Beri catatan untuk foto ini..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors text-sm"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button
                onClick={() => { setIsModalOpen(false); setTempImage(null); setActiveItem(null); }}
                className="px-4 py-2 rounded-full border border-gray-300 font-bold text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveUpload}
                className="px-5 py-2 rounded-full bg-primary-pink hover:bg-opacity-90 text-white font-bold text-xs shadow-sm transition-all"
              >
                {modalMode === 'add' ? 'Simpan ke Moodboard' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox / Popup Image Viewer */}
      {lightboxImage && (
        <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" style={{ zIndex: 999999 }} onClick={() => setLightboxImage(null)}>
          <button 
            className="absolute top-4 right-4 text-white hover:text-primary-pink p-2 bg-black/40 rounded-full backdrop-blur-sm transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img 
              src={lightboxImage.imageUrl} 
              alt={lightboxImage.title || 'Moodboard'} 
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />
            {(lightboxImage.title || lightboxImage.caption) && (
              <div className="mt-4 text-center bg-black/50 p-4 rounded-xl backdrop-blur-sm max-w-2xl">
                {lightboxImage.title && <h3 className="text-white font-bold text-lg">{lightboxImage.title}</h3>}
                {lightboxImage.caption && <p className="text-gray-200 mt-1">{lightboxImage.caption}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Media Picker Modal */}
      <ProjectMediaPickerModal
        isOpen={isProjectPickerOpen}
        onClose={() => setIsProjectPickerOpen(false)}
        onSelectImage={(url) => {
          addMoodboardItem(trip.id, url, 'Inspirasi Foto', 'Diimpor dari folder project');
          setIsProjectPickerOpen(false);
        }}
        title="Tambah Inspirasi ke Moodboard"
      />
    </div>
  );
};
