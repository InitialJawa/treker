import React from 'react';
import { FolderKanban, Users, BookOpen, PlusCircle, Compass } from 'lucide-react';
import { TripCard } from './TripCard';
import { useAuth } from '../context/AuthContext';
import { useTripContext } from '../context/TripContext';
import { INITIAL_TRIPS } from '../data/mockData';
import { Trip } from '../types/travel';
import { Skeleton } from './ui';

interface DashboardViewProps {
  onSelectTrip: (tripId: string) => void;
  onCreateTrip: () => void;
  onOpenTemplates: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onSelectTrip, onCreateTrip, onOpenTemplates }) => {
  const { user } = useAuth();
  const { trips, toggleTripFavorite, loading } = useTripContext();

  const myTrips = trips.filter(t => !t.userId || (user && t.userId === user.uid));
  const sharedTrips = trips.filter(t => user && t.userId && t.userId !== user.uid);
  const publicTemplates = INITIAL_TRIPS.filter(t => t.isTemplate && !trips.some(tr => tr.id === t.id));

  const renderSkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-3xl border border-card-pink overflow-hidden shadow-sm">
          <Skeleton className="h-36 w-full rounded-none" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderSection = (
    icon: React.ReactNode,
    title: string,
    colorClass: string,
    list: Trip[]
  ) => {
    if (list.length === 0) return null;
    return (
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-xl ${colorClass}`}>{icon}</span>
          <h2 className="text-sm font-extrabold text-dark">{title}</h2>
          <span className="text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-full">{list.length}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map(trip => (
            <TripCard
              key={trip.id}
              trip={trip}
              user={user}
              onOpen={onSelectTrip}
              onToggleFavorite={toggleTripFavorite}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-dark">Dashboard Project</h1>
          <p className="text-xs text-gray-custom mt-1">Kelola semua project perjalananmu dalam satu tempat.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTemplates}
            className="bg-white border border-gray-200 hover:border-primary-pink text-primary-pink px-3 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <BookOpen className="w-4 h-4" /> Template Publik
          </button>
          <button
            onClick={onCreateTrip}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-3 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Buat Project
          </button>
        </div>
      </div>

      {loading && (
        <div className="space-y-8">
          <section className="space-y-3">
            <Skeleton className="h-5 w-40" />
            {renderSkeletonGrid()}
          </section>
          <section className="space-y-3">
            <Skeleton className="h-5 w-40" />
            {renderSkeletonGrid()}
          </section>
          <section className="space-y-3">
            <Skeleton className="h-5 w-40" />
            {renderSkeletonGrid()}
          </section>
        </div>
      )}

      {!loading && myTrips.length === 0 && sharedTrips.length === 0 && publicTemplates.length === 0 && (
        <div className="bg-white rounded-3xl border border-card-pink p-12 text-center shadow-sm">
          <Compass className="w-12 h-12 text-soft-pink mx-auto mb-3" />
          <h3 className="font-bold text-sm md:text-base text-dark">Belum ada project</h3>
          <p className="text-xs text-gray-custom mt-1 mb-4">Buat project baru atau gunakan template publik untuk memulai.</p>
          <button
            onClick={onCreateTrip}
            className="bg-primary-pink hover:bg-opacity-90 text-white px-4 py-2.5 rounded-full font-bold text-xs inline-flex items-center gap-2 shadow-sm active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Buat Project Baru
          </button>
        </div>
      )}

      {!loading && renderSection(
        <FolderKanban className="w-4 h-4 text-primary-pink" />,
        'Project Saya',
        'bg-soft-pink text-primary-pink',
        myTrips
      )}

      {!loading && renderSection(
        <Users className="w-4 h-4 text-purple-600" />,
        'Di-share dengan Saya',
        'bg-purple-100 text-purple-700',
        sharedTrips
      )}

      {!loading && renderSection(
        <BookOpen className="w-4 h-4 text-amber-600" />,
        'Template Publik',
        'bg-amber-100 text-amber-700',
        publicTemplates
      )}
    </div>
  );
};