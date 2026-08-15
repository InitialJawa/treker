import React, { useState } from 'react';
import { Plus, Car, Navigation, Clock, DollarSign, Trash2, ArrowRight } from 'lucide-react';
import { Trip, TransportLeg, TransportType } from '../../types/travel';
import { useTripContext } from '../../context/TripContext';
import { formatCurrency } from '../../utils/formatters';

interface TabTransportProps {
  trip: Trip;
  transports: TransportLeg[];
}

export const TabTransport: React.FC<TabTransportProps> = ({ trip, transports }) => {
  const { addTransport, deleteTransport } = useTripContext();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [origin, setOrigin] = useState('Ketapang Indah Hotel');
  const [destination, setDestination] = useState('Kawah Ijen');
  const [type, setType] = useState<TransportType>('Car');
  const [distance, setDistance] = useState('28 km');
  const [duration, setDuration] = useState('45 min');
  const [estimatedCost, setEstimatedCost] = useState(150000);
  const [notes, setNotes] = useState('');

  const tripTransports = transports.filter(t => t.tripId === trip.id);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

    addTransport({
      tripId: trip.id,
      origin,
      destination,
      type,
      distance,
      duration,
      estimatedCost,
      notes,
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-[24px] border border-card-pink flex items-center justify-between gap-4 shadow-sm">
        <div>
          <span className="text-xs font-extrabold text-primary-pink tracking-wider uppercase">Route Flow</span>
          <h2 className="text-xl font-extrabold text-dark">Transport Planner</h2>
          <p className="text-xs text-gray-custom mt-0.5">
            Rute perjalanan antar lokasi di {trip.destination}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-pink hover:bg-opacity-90 text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transport Leg</span>
        </button>
      </div>

      {/* Visual Route Diagram Flow */}
      {tripTransports.length > 0 && (
        <div className="bg-white p-6 rounded-[32px] border border-card-pink shadow-sm">
          <h3 className="font-extrabold text-sm text-dark mb-4">Route Sequential Flow</h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar">
            {tripTransports.map((leg, idx) => (
              <React.Fragment key={leg.id}>
                <div className="bg-soft-pink/50 border border-card-pink p-4 rounded-[20px] shrink-0 text-center min-w-[130px]">
                  <span className="text-[10px] font-bold text-primary-pink uppercase">Point {idx + 1}</span>
                  <p className="font-bold text-xs text-dark truncate">{leg.origin}</p>
                </div>

                <div className="flex flex-col items-center shrink-0 px-2 text-center">
                  <span className="text-[10px] font-bold text-primary-pink bg-offwhite border border-card-pink px-3 py-1 rounded-full whitespace-nowrap">
                    ↓ {leg.duration} ({leg.distance})
                  </span>
                  <ArrowRight className="w-4 h-4 text-primary-pink my-1" />
                  <span className="text-[10px] text-gray-custom font-semibold">{leg.type}</span>
                </div>

                {idx === tripTransports.length - 1 && (
                  <div className="bg-soft-pink/50 border border-card-pink p-4 rounded-[20px] shrink-0 text-center min-w-[130px]">
                    <span className="text-[10px] font-bold text-primary-pink uppercase">Point {idx + 2}</span>
                    <p className="font-bold text-xs text-dark truncate">{leg.destination}</p>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Detailed List */}
      <div className="bg-white rounded-[32px] border border-card-pink overflow-hidden shadow-sm">
        <div className="p-5 border-b border-card-pink font-extrabold text-sm text-dark">
          Transport Legs Details ({tripTransports.length})
        </div>

        {tripTransports.length === 0 ? (
          <div className="p-8 text-center text-gray-custom">
            <Car className="w-10 h-10 mx-auto mb-2 text-soft-pink" />
            <p className="text-sm font-medium">Belum ada rute transportasi tercatat.</p>
          </div>
        ) : (
          <div className="divide-y divide-card-pink text-xs">
            {tripTransports.map((leg) => (
              <div key={leg.id} className="p-4 hover:bg-offwhite flex items-center justify-between gap-4 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-dark">
                    <span>{leg.origin}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary-pink" />
                    <span>{leg.destination}</span>
                  </div>

                  <p className="text-gray-custom">
                    Mode: <span className="font-bold text-dark">{leg.type}</span> • Waktu: {leg.duration} • Jarak: {leg.distance}
                  </p>

                  {leg.notes && <p className="text-[11px] text-gray-custom italic">" {leg.notes} "</p>}
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-dark">
                    {formatCurrency(leg.estimatedCost, trip.currency)}
                  </span>
                  <button
                    onClick={() => deleteTransport(leg.id)}
                    className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E8EBEF]">
            <h3 className="font-bold text-base text-[#20263D] mb-4">Add Transport Leg</h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Origin Location</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Ketapang Indah Hotel"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#20263D] mb-1">Destination Location</label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Kawah Ijen"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Transport Mode</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TransportType)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                  >
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Walking">Walking</option>
                    <option value="Taxi">Taxi</option>
                    <option value="Bus">Bus</option>
                    <option value="Train">Train</option>
                    <option value="Plane">Plane</option>
                    <option value="Boat">Boat</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Estimated Cost ({trip.currency})</label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Distance</label>
                  <input
                    type="text"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    placeholder="e.g. 28 km"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20263D] mb-1">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 45 min"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8EBEF] bg-[#F7F8FA]"
                  />
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
                  className="px-5 py-2.5 rounded-full bg-primary-pink text-white font-bold hover:bg-opacity-90 transition-all"
                >
                  Save Leg
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
