import React, { useState } from 'react';
import { Plus, StickyNote, Edit3, Trash2, Calendar, Image as ImageIcon, Upload, X } from 'lucide-react';
import { Trip, Note } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { resizeImage } from '../../utils/imageUtils';

interface TabNotesProps {
  trip: Trip;
  notes: Note[];
}

export const TabNotes: React.FC<TabNotesProps> = ({ trip, notes }) => {
  const { addNote, updateNote, deleteNote } = useTripContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FEF3C7'); // yellow
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const tripNotes = notes.filter(n => n.tripId === trip.id);

  const colors = [
    { name: 'Warm Yellow', hex: '#FEF3C7' },
    { name: 'Mint Green', hex: '#DCFCE7' },
    { name: 'Soft Blue', hex: '#E0F2FE' },
    { name: 'Lavender', hex: '#F3E8FF' },
    { name: 'Peach', hex: '#FFEDD5' },
  ];

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
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor('#FEF3C7');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (n: Note) => {
    setEditingNote(n);
    setTitle(n.title);
    setContent(n.content);
    setColor(n.color || '#FEF3C7');
    setImageUrl(n.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingNote) {
      updateNote(editingNote.id, {
        title,
        content,
        color,
        imageUrl: imageUrl.trim(),
      });
    } else {
      addNote({
        tripId: trip.id,
        title,
        content,
        color,
        imageUrl: imageUrl.trim(),
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8EBEF] flex items-center justify-between gap-4 shadow-xs">
        <div>
          <span className="text-xs font-extrabold text-[var(--color-primary-pink)] tracking-wider uppercase">Trip Notes</span>
          <h2 className="text-xl font-extrabold text-[#20263D]">Important Reminders & Contacts</h2>
          <p className="text-xs text-[#6F7787] mt-0.5">
            Catatan penting, instruksi driver, dan reminder khusus perjalanan
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-[var(--color-primary-pink)] hover:bg-opacity-90 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Sticky Notes Cards Grid */}
      {tripNotes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E8EBEF] p-12 text-center text-gray-400">
          <StickyNote className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <h3 className="font-bold text-base text-[#20263D]">Belum ada catatan tersimpan</h3>
          <p className="text-xs text-[#6F7787] mt-1 mb-4">Catat nomor kontak driver, rekomendasi kuliner, atau reminder jeep.</p>
          <button
            onClick={handleOpenAdd}
            className="bg-[var(--color-primary-pink)] text-white px-5 py-2 rounded-xl font-bold text-xs"
          >
            + New Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tripNotes.map((note) => (
            <div
              key={note.id}
              style={{ backgroundColor: note.color || '#FEF3C7' }}
              className="p-5 rounded-2xl border border-black/5 shadow-xs flex flex-col justify-between min-h-[180px] hover:shadow-md transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-extrabold text-base text-[#20263D]">{note.title}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1 hover:bg-black/5 rounded text-gray-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1 hover:bg-black/5 rounded text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-800 whitespace-pre-wrap leading-relaxed font-medium">
                  {note.content}
                </p>

                {/* Attached Image */}
                {note.imageUrl && (
                  <div className="mt-2">
                    <div 
                      onClick={() => setPreviewImage(note.imageUrl!)}
                      className="relative group/img cursor-pointer rounded-xl overflow-hidden border border-black/10 bg-black/5 h-28 w-full"
                    >
                      <img 
                        src={note.imageUrl} 
                        alt={note.title} 
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ImageIcon className="w-4 h-4" />
                        <span>Lihat Foto</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-2 border-t border-black/10 text-[10px] text-gray-600 font-semibold flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {note.updatedAt}
                </span>
                <span>Trip Note</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8EBEF]">
            <h3 className="font-bold text-base text-[#20263D] mb-4">
              {editingNote ? 'Edit Note' : 'Create Note'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Booking Jeep H-7"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Tulis catatan penting..."
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Card Color</label>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setColor(c.hex)}
                      style={{ backgroundColor: c.hex }}
                      className={`w-7 h-7 rounded-full border ${
                        color === c.hex ? 'ring-2 ring-black' : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Attachment / Image Field */}
              <div className="space-y-2 pt-1 border-t border-gray-100">
                <label className="block font-semibold text-[#20263D] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-primary-pink" />
                    <span>Lampiran Foto / Gambar</span>
                  </span>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-red-500 hover:text-red-700 text-[11px] font-bold"
                    >
                      Hapus Foto
                    </button>
                  )}
                </label>

                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-gray-200 h-28 bg-gray-50 group">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* File Upload Button */}
                    <label className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-primary-pink cursor-pointer bg-[#F7F8FA] hover:bg-soft-pink/30 transition-all text-xs font-bold text-gray-600 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload className="w-4 h-4 text-primary-pink" />
                      <span>{isUploading ? 'Memproses...' : 'Upload Gambar'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileUpload}
                        className="hidden" 
                      />
                    </label>

                    {/* URL Input */}
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Atau URL gambar (https://...)"
                      className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA] text-xs font-medium text-[#20263D]"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 rounded-xl bg-[var(--color-primary-pink)] text-white font-bold disabled:opacity-50"
                >
                  Save Note
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
            <img src={previewImage} alt="Enlarged note preview" className="max-w-full max-h-[85vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
};
