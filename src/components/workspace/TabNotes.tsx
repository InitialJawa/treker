import React, { useState } from 'react';
import { Plus, StickyNote, Edit3, Trash2, Calendar } from 'lucide-react';
import { Trip, Note } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';

interface TabNotesProps {
  trip: Trip;
  notes: Note[];
}

export const TabNotes: React.FC<TabNotesProps> = ({ trip, notes }) => {
  const { addNote, updateNote, deleteNote } = useTripContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('#FEF3C7'); // yellow

  const tripNotes = notes.filter(n => n.tripId === trip.id);

  const colors = [
    { name: 'Warm Yellow', hex: '#FEF3C7' },
    { name: 'Mint Green', hex: '#DCFCE7' },
    { name: 'Soft Blue', hex: '#E0F2FE' },
    { name: 'Lavender', hex: '#F3E8FF' },
    { name: 'Peach', hex: '#FFEDD5' },
  ];

  const handleOpenAdd = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor('#FEF3C7');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (n: Note) => {
    setEditingNote(n);
    setTitle(n.title);
    setContent(n.content);
    setColor(n.color || '#FEF3C7');
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
      });
    } else {
      addNote({
        tripId: trip.id,
        title,
        content,
        color,
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
                  className="px-5 py-2 rounded-xl bg-[var(--color-primary-pink)] text-white font-bold"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
