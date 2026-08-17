import React, { useState } from 'react';
import { X, BookOpen, MapPin, Calendar, Users, DollarSign, Check, Copy, ArrowRight, Compass, Bookmark } from 'lucide-react';
import { INITIAL_TRIPS } from '../data/mockData';
import { useTripContext } from '../context/TripContext';
import { formatDateRange, formatCurrency } from '../utils/formatters';

interface PublicTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTrip: (tripId: string) => void;
}

export const PublicTemplatesModal: React.FC<PublicTemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTrip,
}) => {
  const { duplicateTrip } = useTripContext();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const publicTemplates = INITIAL_TRIPS.filter(t => t.isTemplate);

  const handleSelectTemplate = (templateId: string, templateName: string, startDate: string) => {
    setSelectedTemplateId(templateId);
    setCustomName(`${templateName} (Project Baru)`);
    setNewStartDate(startDate || new Date().toISOString().split('T')[0]);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId) return;

    setIsImporting(true);
    try {
      const template = publicTemplates.find(t => t.id === selectedTemplateId);
      let calculatedEndDate: string | undefined = undefined;

      if (template && template.startDate && template.endDate && newStartDate) {
        const oldStart = new Date(template.startDate);
        const oldEnd = new Date(template.endDate);
        const diffMs = oldEnd.getTime() - oldStart.getTime();
        const newStartObj = new Date(newStartDate);
        const newEndObj = new Date(newStartObj.getTime() + diffMs);
        if (!isNaN(newEndObj.getTime())) {
          calculatedEndDate = newEndObj.toISOString().split('T')[0];
        }
      }

      const newTripId = await duplicateTrip(selectedTemplateId, customName, newStartDate, calculatedEndDate);
      setSuccessMessage('Template berhasil diimpor ke Project Saya!');
      
      setTimeout(() => {
        setIsImporting(false);
        setSuccessMessage(null);
        setSelectedTemplateId(null);
        onClose();
        onSelectTrip(newTripId);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      alert('Gagal mengimpor template: ' + (err?.message || 'Terjadi kesalahan'));
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative border border-card-pink max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-soft-pink text-primary-pink">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-dark">Katalog Template Publik</h2>
              <p className="text-xs text-gray-500 font-medium">
                Pilih rencana perjalanan favorit dari komunitas untuk digunakan di Project Saya.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="py-6 overflow-y-auto space-y-6 flex-1 pr-1">
          {successMessage && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-2xl text-xs font-bold flex items-center gap-2 animate-bounce">
              <Check className="w-5 h-5 text-green-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {!selectedTemplateId ? (
            /* Grid of Public Templates */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {publicTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-50/70 hover:bg-white rounded-2xl p-4 border border-gray-100 hover:border-primary-pink/30 hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer"
                  onClick={() => handleSelectTemplate(template.id, template.name, template.startDate)}
                >
                  <div className="space-y-3">
                    <div className="relative h-36 rounded-xl overflow-hidden">
                      <img
                        src={template.coverImage}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 right-2 bg-primary-pink text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                        <Bookmark className="w-3 h-3" /> Template
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-dark text-base group-hover:text-primary-pink transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{template.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-pink" /> {template.destination}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-primary-pink" /> {formatCurrency(template.budget, template.currency)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400">
                      {formatDateRange(template.startDate, template.endDate)}
                    </span>
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-soft-pink text-primary-pink group-hover:bg-primary-pink group-hover:text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <span>Gunakan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Selected Template Form */
            <form onSubmit={handleImportSubmit} className="space-y-5 bg-soft-pink/30 p-6 rounded-2xl border border-primary-pink/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-primary-pink uppercase tracking-wider flex items-center gap-1.5">
                  <Copy className="w-4 h-4" /> Kustomisasi Rencana
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId(null)}
                  className="text-xs font-bold text-gray-500 hover:text-dark underline"
                >
                  Kembali ke Katalog
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Nama Project Baru Kamu</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-pink text-sm font-semibold bg-white"
                  placeholder="Contoh: Liburan Keluarga Banyuwangi"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-dark mb-1">Tanggal Mulai Perjalanan</label>
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-pink text-sm font-semibold bg-white"
                />
                <p className="text-[10px] text-gray-500 mt-1">
                  Tanggal semua aktivitas akan otomatis disesuaikan dengan durasi template.
                </p>
              </div>

              <div className="pt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTemplateId(null)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isImporting}
                  className="flex-1 py-2.5 px-4 bg-primary-pink hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isImporting ? (
                    <span>Memproses Impor...</span>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Impor ke Project Saya</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
