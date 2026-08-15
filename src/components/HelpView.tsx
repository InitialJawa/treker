import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare, BookOpen, MapPin, Compass, Shield, Mail, CheckCircle2 } from 'lucide-react';

export const HelpView: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const faqs = [
    {
      question: 'Bagaimana cara membuat rencana perjalanan (trip) baru?',
      answer: 'Klik menu "Create Trip" di sidebar atau isi widget "Create New Trip" di halaman Dashboard. Masukkan nama trip, destinasi, pilih tanggal keberangkatan pada kalender interaktif, lalu klik "Get Started".'
    },
    {
      question: 'Bagaimana cara menambahkan tempat wisata ke dalam itinerary?',
      answer: 'Anda bisa menjelajahi tempat wisata di menu "Browse" atau "Popular Places" di Dashboard. Klik tombol "Add to Trip" pada tempat pilihan Anda untuk langsung memasukkannya ke dalam jadwal perjalanan.'
    },
    {
      question: 'Apakah jadwal dan anggaran biaya otomatis dihitung?',
      answer: 'Ya! Setiap kali Anda menambahkan aktivitas, tiket, atau catatan pengeluaran di workspace trip, sistem TREKER akan otomatis mengalkulasi total anggaran, sisa budget, dan grafik pengeluaran.'
    },
    {
      question: 'Bagaimana cara mengunduh atau mencetak dokumen itinerary (PDF)?',
      answer: 'Buka trip pilihan Anda di Trip Workspace, lalu klik tombol "Export PDF / Share" di pojok kanan atas. Anda dapat mencetak langsung atau menyimpannya sebagai file PDF.'
    },
    {
      question: 'Bagaimana cara menandai tempat wisata favorit?',
      answer: 'Klik ikon hati (Heart) pada kartu destinasi di Dashboard atau halaman Browse. Tempat tersebut akan otomatis tersimpan di menu "Favourites/Saved".'
    }
  ];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackText.trim()) {
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSubmitted(false), 4000);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Help Header */}
      <div className="bg-primary-pink p-8 md:p-10 rounded-[40px] text-white space-y-4 shadow-lg relative overflow-hidden mb-6 text-center">
        <div className="relative z-10 space-y-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl text-white flex items-center justify-center mx-auto shadow-2xs border border-card-pink/30">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white">Pusat Bantuan TREKER</h1>
          <p className="text-xs md:text-sm text-soft-pink max-w-lg mx-auto font-medium">
            Temukan jawaban atas pertanyaan umum dan panduan penggunaan aplikasi perencanaan liburan TREKER.
          </p>
        </div>
      </div>

      {/* FAQ List */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAEFF5] shadow-xs space-y-4">
        <h2 className="text-lg font-black text-dark mb-2 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-pink" /> FAQ - Pertanyaan Sering Diajukan
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="border border-gray-100 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left font-bold text-xs md:text-sm text-dark hover:bg-soft-pink transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-primary-pink' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-gray-600 border-t border-gray-50 leading-relaxed bg-soft-pink">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Contact Support & Feedback */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#EAEFF5] shadow-xs space-y-4">
        <h2 className="text-lg font-black text-dark flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#2563EB]" /> Butuh Bantuan Tambahan?
        </h2>
        <p className="text-xs text-gray-500">
          Kirimkan tanggapan, kendala, atau saran perbaikan aplikasi langsung kepada tim pengembang TREKER.
        </p>

        {feedbackSubmitted ? (
          <div className="bg-soft-pink border border-card-pink text-primary-pink p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Terima kasih! Pesan dan feedback Anda berhasil dikirim ke tim bantuan TREKER.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-3">
            <textarea
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Tuliskan saran atau pertanyaan Anda di sini..."
              className="w-full p-4 rounded-2xl border border-gray-200 text-xs font-semibold text-dark placeholder:text-gray-400 focus:outline-none focus:border-[#2563EB] bg-soft-pink"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95"
              >
                Kirim Pesan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
