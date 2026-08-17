import React from 'react';
import { MapPin, Calendar, Users, Lock, Heart, Copy } from 'lucide-react';
import { Trip } from '../types/travel';
import { getBadgeData, getTripTimeStatus, getTripStatusLabel, isTemplateReadOnly, TripUserLike } from '../utils/tripBadges';
import { formatDateRange } from '../utils/formatters';

interface TripCardProps {
  trip: Trip;
  user: TripUserLike | null;
  onOpen: (tripId: string) => void;
  onToggleFavorite: (tripId: string) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, user, onOpen, onToggleFavorite }) => {
  const badge = getBadgeData(trip, user);
  const status = getTripTimeStatus(trip);
  const readOnly = isTemplateReadOnly(trip, user);
  const collabCount = trip.collaborators?.length || 0;

  const statusClass =
    status === 'current'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : status === 'upcoming'
      ? 'text-blue-600 bg-blue-50 border-blue-200'
      : 'text-gray-custom bg-surface-muted border-card-pink';

  return (
    <div
      onClick={() => onOpen(trip.id)}
      className="group bg-card-pink rounded-3xl border border-card-pink overflow-hidden shadow-sm hover:shadow-lg hover:border-primary-pink transition-all cursor-pointer active:scale-[0.99] flex flex-col"
    >
      <div className="relative h-36 overflow-hidden">
        <img
          src={trip.coverImage}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.bgClass} ${badge.textClass}`}>
            {badge.label}
          </span>
          {readOnly && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-bold">
              <Lock className="w-3 h-3" /> Hanya Bisa Dikopi
            </span>
          )}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(trip.id); }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full bg-card-pink/90 shadow-sm transition-all hover:scale-110 active:scale-95 ${trip.isFavorite ? 'text-primary-pink' : 'text-gray-custom/70 hover:text-primary-pink'}`}
          title="Sukai project ini"
        >
          <Heart className={`w-4 h-4 ${trip.isFavorite ? 'fill-primary-pink' : ''}`} />
        </button>
      </div>

      <div className="p-3.5 flex-1 flex flex-col gap-1.5">
        <h3 className="font-extrabold text-sm text-dark leading-snug line-clamp-2">{trip.name}</h3>
        <p className="text-[11px] text-gray-custom flex items-center gap-1">
          <MapPin className="w-3 h-3 text-primary-pink shrink-0" />
          <span className="truncate">{trip.destination}</span>
        </p>
        <p className="text-[11px] text-gray-custom/70 flex items-center gap-1">
          <Calendar className="w-3 h-3 shrink-0" />
          {formatDateRange(trip.startDate, trip.endDate)}
        </p>

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusClass}`}>
            {getTripStatusLabel(status)}
          </span>
          <div className="flex items-center gap-1.5">
            {collabCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                <Users className="w-3 h-3" /> {collabCount}
              </span>
            )}
            {trip.isTemplate && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-custom bg-surface-muted px-2 py-0.5 rounded-full">
                <Copy className="w-3 h-3" /> Kopi
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};