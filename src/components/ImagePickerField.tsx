import React, { useState } from 'react';
import { Upload, FolderPlus, Trash2, Image as ImageIcon, Link2, RefreshCw } from 'lucide-react';
import { ProjectMediaPickerModal } from './ProjectMediaPickerModal';
import { useToast } from '../context/ToastContext';

interface ImagePickerFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const ImagePickerField: React.FC<ImagePickerFieldProps> = ({
  value,
  onChange,
  label = 'Foto / Gambar',
  placeholder = 'Atau tempel URL gambar (https://...)',
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const { showToast } = useToast();

  // Handle Local Device File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      showToast('Ukuran file maksimal 8MB!', 'error');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
      setIsUploading(false);
    };
    reader.onerror = () => {
      showToast('Gagal membaca file gambar.', 'error');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block font-semibold text-dark text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-primary-pink" />
            <span>{label}</span>
          </span>
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-red-500 hover:text-red-700 text-[11px] font-bold flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded-lg border border-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Foto</span>
            </button>
          )}
        </label>
      )}

      {/* If an image is currently selected */}
      {value ? (
        <div className="space-y-2">
          <div className="relative rounded-2xl overflow-hidden border border-card-pink h-36 bg-surface-muted group">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 bg-card-pink text-dark rounded-xl font-bold text-xs shadow-md hover:bg-surface-muted flex items-center gap-1.5 transition-all"
              >
                <FolderPlus className="w-4 h-4 text-primary-pink" />
                <span>Ganti dari Project</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md"
                title="Hapus foto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* If no image selected, show the 3 choices */
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* Choice 1: Pick from Project Gallery Modal */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/70 text-primary-pink font-extrabold text-xs transition-all shadow-2xs hover:scale-[1.01]"
            >
              <FolderPlus className="w-4 h-4 shrink-0" />
              <span>Pilih dari Project</span>
            </button>

            {/* Choice 2: Upload Device File */}
            <label
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border border-card-pink bg-screen-pink hover:bg-surface-muted text-dark font-extrabold text-xs cursor-pointer transition-all ${
                isUploading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <Upload className="w-4 h-4 text-gray-custom shrink-0" />
              <span>{isUploading ? 'Memproses...' : 'Unggah File'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Choice 3: URL Toggle/Input */}
          {!showUrlInput ? (
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="text-[11px] font-bold text-gray-custom/70 hover:text-primary-pink flex items-center gap-1 transition-colors px-1"
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Atau tempel URL gambar langsung</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 px-3 py-2 rounded-xl border border-card-pink bg-screen-pink font-medium text-xs text-dark focus:bg-card-pink focus:border-primary-pink focus:outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Reusable Project Media Picker Modal */}
      <ProjectMediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectImage={(url) => {
          onChange(url);
          setIsModalOpen(false);
        }}
        currentImageUrl={value}
      />
    </div>
  );
};
