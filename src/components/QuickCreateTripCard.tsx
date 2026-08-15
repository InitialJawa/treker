import React, { useState } from 'react';
import { Plus, X, Image as ImageIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useTripContext } from '../context/TripContext';

interface QuickCreateTripCardProps {
  onTripCreated?: (tripId: string) => void;
}

const PRESET_IMAGES = [
  { label: 'Tropical Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { label: 'Italian Coast', url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80' },
  { label: 'Bali Temple', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
  { label: 'Nordic Fjords', url: 'https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?auto=format&fit=crop&w=800&q=80' },
  { label: 'Swiss Alps', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80' },
  { label: 'Japan Lanterns', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
];

export const QuickCreateTripCard: React.FC<QuickCreateTripCardProps> = ({ onTripCreated }) => {
  const { createNewTrip } = useTripContext();
  const [tripName, setTripName] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  const [locations, setLocations] = useState<string[]>(['Thailand', 'Vietnam']);
  
  // Dynamic Start and End Days for Feb 2026 (13 to 19 by default)
  const [selectedStartDay, setSelectedStartDay] = useState<number>(13);
  const [selectedEndDay, setSelectedEndDay] = useState<number>(19);
  
  const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0].url);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddLocationTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && destinationInput.trim()) {
      e.preventDefault();
      if (!locations.includes(destinationInput.trim())) {
        setLocations([...locations, destinationInput.trim()]);
      }
      setDestinationInput('');
    }
  };

  const removeLocationTag = (tagToRemove: string) => {
    setLocations(locations.filter(loc => loc !== tagToRemove));
  };

  const handleDayClick = (dayNum: number) => {
    if (!selectedStartDay || (selectedStartDay && selectedEndDay)) {
      setSelectedStartDay(dayNum);
      setSelectedEndDay(dayNum);
    } else if (dayNum < selectedStartDay) {
      setSelectedStartDay(dayNum);
    } else {
      setSelectedEndDay(dayNum);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripName.trim()) {
      setErrorMsg('Masukkan nama trip.');
      return;
    }
    const dest = locations.length > 0 ? locations.join(', ') : 'Thailand';
    setIsSubmitting(true);
    setErrorMsg(null);

    const formattedStart = `2026-02-${selectedStartDay < 10 ? '0' + selectedStartDay : selectedStartDay}`;
    const formattedEnd = `2026-02-${selectedEndDay < 10 ? '0' + selectedEndDay : selectedEndDay}`;

    try {
      const newTripId = await createNewTrip({
        name: tripName,
        destination: dest,
        startDate: formattedStart,
        endDate: formattedEnd,
        travelersCount: 2,
        currency: 'USD',
        budget: 2500,
        description: `Trip ${tripName} in ${dest}`,
        coverImage: imageUrl,
      }, true);

      setTripName('');
      setIsSubmitting(false);
      if (onTripCreated) {
        onTripCreated(newTripId);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Gagal membuat trip.');
    }
  };

  // Generate 28 days for Feb 2026 grid (plus trailing/leading overflow)
  const calendarDays = [
    { day: '30', num: 30, current: false },
    { day: '31', num: 31, current: false },
    ...Array.from({ length: 28 }, (_, i) => ({
      day: (i + 1 < 10 ? '0' : '') + (i + 1),
      num: i + 1,
      current: true,
    })),
    { day: '01', num: 1, current: false },
    { day: '02', num: 2, current: false },
    { day: '03', num: 3, current: false },
    { day: '04', num: 4, current: false },
    { day: '05', num: 5, current: false },
  ];

  return (
    <div className="bg-white rounded-3xl border border-card-pink p-6 shadow-sm flex flex-col justify-between relative">
      {/* Pink Badge Plus Icon */}
      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary-pink text-white flex items-center justify-center shadow-md border-2 border-white">
        <Plus className="w-5 h-5 stroke-[3]" />
      </div>

      <div className="mt-3 text-center mb-4">
        <h3 className="font-extrabold text-lg text-dark">Create New Trip</h3>
      </div>

      {errorMsg && (
        <div className="mb-3 p-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[11px] font-bold animate-pulse text-center">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
        {/* Enter Trip Name */}
        <div>
          <input
            type="text"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            placeholder="Enter trip name"
            className="w-full px-4 py-3 rounded-full border border-card-pink bg-offwhite font-semibold text-dark placeholder:text-gray-custom focus:outline-none focus:border-primary-pink focus:bg-white transition-all shadow-sm"
          />
        </div>

        {/* Add Trip Image + Browse Selector */}
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-2.5 rounded-full border border-card-pink bg-offwhite text-gray-custom font-semibold text-xs flex items-center gap-2 shadow-sm">
              <img src={imageUrl} alt="preview" className="w-5 h-5 rounded-full object-cover shrink-0" />
              <input 
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste Cover Image URL"
                className="w-full bg-transparent border-none focus:outline-none text-dark font-semibold placeholder:text-gray-400"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="px-4 py-2.5 rounded-full bg-primary-pink hover:bg-opacity-90 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
            >
              Browse
            </button>
          </div>

          {/* Preset Image Selector Popover */}
          {showImagePicker && (
            <div className="absolute top-12 right-0 left-0 bg-white border border-card-pink rounded-3xl p-3 shadow-xl z-20 space-y-2 animate-scale-up">
              <p className="font-bold text-[11px] text-dark">Pilih Cover Trip:</p>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_IMAGES.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      setImageUrl(img.url);
                      setShowImagePicker(false);
                    }}
                    className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all ${
                      imageUrl === img.url ? 'border-primary-pink scale-95' : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    {imageUrl === img.url && (
                      <div className="absolute inset-0 bg-primary-pink/40 flex items-center justify-center text-white">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Location(s) & Tag Pills */}
        <div>
          <input
            type="text"
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            onKeyDown={handleAddLocationTag}
            placeholder="Add location(s) and press Enter"
            className="w-full px-4 py-2.5 rounded-full border border-card-pink bg-offwhite font-semibold text-dark placeholder:text-gray-custom focus:outline-none focus:border-primary-pink focus:bg-white transition-all shadow-sm"
          />

          {/* Location Pills */}
          {locations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {locations.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-soft-pink text-primary-pink font-bold text-[11px]"
                >
                  {loc}
                  <button
                    type="button"
                    onClick={() => removeLocationTag(loc)}
                    className="hover:text-red-500 rounded-full"
                  >
                    <X className="w-3 h-3 text-primary-pink" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* TREKER Interactive Calendar Widget */}
        <div className="bg-offwhite p-3.5 rounded-3xl border border-card-pink shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-dark mb-2 px-1">
            <ChevronLeft className="w-4 h-4 text-gray-custom cursor-pointer hover:text-dark" />
            <span className="font-extrabold text-sm">Feb 2026</span>
            <ChevronRight className="w-4 h-4 text-gray-custom cursor-pointer hover:text-dark" />
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-custom mb-1">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
            {calendarDays.map((item, idx) => {
              let bgStyle = 'text-dark font-medium hover:bg-soft-pink/60 hover:text-primary-pink';
              if (!item.current) {
                bgStyle = 'text-gray-300 font-normal cursor-default';
              } else {
                if (item.num === selectedStartDay || item.num === selectedEndDay) {
                  bgStyle = 'bg-primary-pink text-white font-black rounded-full shadow-sm';
                } else if (item.num > selectedStartDay && item.num < selectedEndDay) {
                  bgStyle = 'bg-soft-pink text-primary-pink font-bold rounded-md';
                }
              }

              return (
                <div
                  key={idx}
                  onClick={() => item.current && handleDayClick(item.num)}
                  className={`py-1 rounded-md cursor-pointer transition-all select-none ${bgStyle}`}
                >
                  {item.day}
                </div>
              );
            })}
          </div>

          <div className="text-[10px] text-gray-custom text-center font-semibold mt-2">
            Selected: Feb {selectedStartDay} – Feb {selectedEndDay}, 2026
          </div>
        </div>

        {/* Get Started Primary Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-pink text-white py-3.5 rounded-full font-bold text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 mt-2 border-2 border-white"
        >
          {isSubmitting ? 'Creating Trip...' : 'Get Started'}
        </button>
      </form>
    </div>
  );
};
