import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, MapPin, Calendar, Users, DollarSign, Sparkles, Check, Compass } from 'lucide-react';
import { useTripContext } from '../context/TripContext';
import { CurrencyCode } from '../types/travel';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripCreated: (tripId: string) => void;
}

export const CreateTripModal: React.FC<CreateTripModalProps> = ({
  isOpen,
  onClose,
  onTripCreated,
}) => {
  const { createNewTrip } = useTripContext();
  const [step, setStep] = useState(1);

  // Form State
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('2026-10-04');
  const [endDate, setEndDate] = useState('2026-10-08');
  const [adults, setAdults] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [budget, setBudget] = useState(5000000);
  const [currency, setCurrency] = useState<CurrencyCode>('IDR');
  const [tripName, setTripName] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80');
  const [generateAI, setGenerateAI] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const popularDestinations = [
    { name: 'Banyuwangi, Indonesia', img: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=300&q=80' },
    { name: 'Bali, Indonesia', img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=300&q=80' },
    { name: 'Rome, Italy', img: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=300&q=80' },
    { name: 'Kyoto, Japan', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=300&q=80' },
  ];

  const handleNextStep = () => {
    if (step === 1 && !destination.trim()) {
      alert('Silakan tentukan destinasi terlebih dahulu.');
      return;
    }
    if (step === 1 && !tripName) {
      setTripName(`${destination} Vacation`);
    }
    setStep(prev => Math.min(prev + 1, 5));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    if (!tripName.trim()) {
      setErrorMessage('Silakan beri nama trip kamu.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newId = await createNewTrip({
        name: tripName,
        destination,
        startDate,
        endDate,
        travelersCount: adults + childrenCount,
        currency,
        budget,
        description: description || `Perjalanan ke ${destination} selama 5 hari.`,
        coverImage,
      }, generateAI);

      setIsSubmitting(false);
      onClose();
      onTripCreated(newId);
    } catch (err: any) {
      setIsSubmitting(false);
      if (err?.message === 'DUPLICATE_TRIP_NAME') {
        setErrorMessage(`⚠️ Trip dengan nama "${tripName}" sudah ada! Gunakan nama yang berbeda agar tidak terjadi duplikasi trip.`);
      } else {
        setErrorMessage(err?.message || 'Gagal membuat trip. Silakan coba lagi.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-[#E8EBEF]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Steps Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs font-bold text-primary-pink tracking-wider uppercase">Step {step} of 5</span>
            <h2 className="text-xl md:text-2xl font-bold text-dark">
              {step === 1 && 'Where are you going?'}
              {step === 2 && 'When are you going?'}
              {step === 3 && "Who's coming along?"}
              {step === 4 && "What's your budget?"}
              {step === 5 && 'Finalize your trip details'}
            </h2>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step
                    ? 'w-6 bg-primary-pink'
                    : s < step
                    ? 'w-2 bg-primary-pink/40'
                    : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold animate-pulse flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: DESTINATION */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Search or Enter Destination
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Banyuwangi, Bali, Tokyo, Paris..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-dark focus:outline-none focus:border-primary-pink"
                />
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-[#6F7787] mb-3">Or choose popular picks:</p>
              <div className="grid grid-cols-2 gap-3">
                {popularDestinations.map((dest) => (
                  <div
                    key={dest.name}
                    onClick={() => {
                      setDestination(dest.name);
                      setCoverImage(dest.img);
                      setTripName(`${dest.name.split(',')[0]} Escape`);
                    }}
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                      destination === dest.name
                        ? 'border-primary-pink bg-soft-pink/50 ring-2 ring-[#EC4899]/20'
                        : 'border-[#E8EBEF] hover:border-gray-300 bg-white'
                    }`}
                  >
                    <img src={dest.img} alt={dest.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <span className="text-xs font-bold text-dark">{dest.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DATES */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">Start Date</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-dark focus:outline-none focus:border-primary-pink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">End Date</label>
                <div className="relative">
                  <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E8EBEF] bg-[#F7F8FA] font-medium text-dark focus:outline-none focus:border-primary-pink"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-soft-pink border border-pink-200 text-xs text-primary-pink flex items-center gap-3 font-semibold">
              <Compass className="w-5 h-5 shrink-0" />
              <span>Sistem akan otomatis menghitung durasi hari dan membaginya ke dalam timeline itinerary.</span>
            </div>
          </div>
        )}

        {/* STEP 3: TRAVELERS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E8EBEF] bg-[#F7F8FA]">
              <div>
                <h4 className="font-bold text-sm text-dark">Adults</h4>
                <p className="text-xs text-[#6F7787]">Age 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdults(Math.max(1, adults - 1))}
                  className="w-9 h-9 rounded-xl border border-gray-300 bg-white font-bold text-base hover:bg-gray-100 flex items-center justify-center"
                >
                  −
                </button>
                <span className="font-bold text-base w-4 text-center">{adults}</span>
                <button
                  type="button"
                  onClick={() => setAdults(adults + 1)}
                  className="w-9 h-9 rounded-xl border border-gray-300 bg-white font-bold text-base hover:bg-gray-100 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E8EBEF] bg-[#F7F8FA]">
              <div>
                <h4 className="font-bold text-sm text-dark">Children</h4>
                <p className="text-xs text-[#6F7787]">Age 0 - 12</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                  className="w-9 h-9 rounded-xl border border-gray-300 bg-white font-bold text-base hover:bg-gray-100 flex items-center justify-center"
                >
                  −
                </button>
                <span className="font-bold text-base w-4 text-center">{childrenCount}</span>
                <button
                  type="button"
                  onClick={() => setChildrenCount(childrenCount + 1)}
                  className="w-9 h-9 rounded-xl border border-gray-300 bg-white font-bold text-base hover:bg-gray-100 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: BUDGET */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="flex gap-2 mb-2">
              {(['IDR', 'USD', 'EUR', 'SGD'] as CurrencyCode[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    currency === c
                      ? 'bg-primary-pink text-white shadow-xs'
                      : 'bg-gray-100 text-[#6F7787] hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Estimated Total Budget</label>
              <div className="relative">
                <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  step={currency === 'IDR' ? 100000 : 50}
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E8EBEF] bg-[#F7F8FA] font-bold text-lg text-dark focus:outline-none focus:border-primary-pink"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: TRIP NAME & AI SETTINGS */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Trip Name</label>
              <input
                type="text"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                placeholder="e.g. Banyuwangi Trip 2026"
                className="w-full px-4 py-3 rounded-2xl border border-[#E8EBEF] bg-[#F7F8FA] font-semibold text-dark focus:outline-none focus:border-primary-pink"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Description / Notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional notes or trip goals..."
                className="w-full px-4 py-2.5 rounded-2xl border border-[#E8EBEF] bg-[#F7F8FA] text-xs font-medium text-dark focus:outline-none focus:border-primary-pink"
              />
            </div>

            {/* AI Auto-generate Toggle */}
            <div 
              onClick={() => setGenerateAI(!generateAI)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                generateAI ? 'border-primary-pink bg-soft-pink/60' : 'border-[#E8EBEF] bg-[#F7F8FA]'
              }`}
            >
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                generateAI ? 'bg-primary-pink text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-dark">Generate Starter Itinerary with AI</h4>
                <p className="text-xs text-[#6F7787] mt-0.5">
                  Otomatis membuat rekomendasi aktivitas per hari, estimasi biaya, dan packing list untuk {destination}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="px-5 py-3 rounded-xl border border-gray-300 font-bold text-xs text-dark hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={handleNextStep}
              className="bg-primary-pink hover:bg-[#DB2777] text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-md"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-primary-pink hover:bg-[#DB2777] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Building Workspace...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Trip
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
