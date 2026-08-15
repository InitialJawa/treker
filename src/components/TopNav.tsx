import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, PlusCircle } from 'lucide-react';

interface TopNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  openCreateTripModal: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ currentView, onNavigate, openCreateTripModal }) => {
  const { logout } = useAuth();
  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* 1. Brand Zone */}
      <div 
        className="flex items-center gap-2 cursor-pointer shrink-0" 
        onClick={() => onNavigate('Dashboard')}
      >
        <Compass className="w-6 h-6 text-primary-pink" />
        <span className="font-bold text-xl tracking-tight text-dark">TREKER</span>
      </div>

      {/* 2. Nav Links Zone */}
      <nav className="hidden lg:flex items-center gap-8">
        {[
          { id: 'Dashboard', label: 'Dashboard' },
          { id: 'Explore', label: 'Explore' },
          { id: 'MyTrips', label: 'My Trips' },
          { id: 'PastTrips', label: 'History' },
          { id: 'Favorites', label: 'Favorites' }
        ].map(nav => (
          <button
            key={nav.id}
            onClick={() => onNavigate(nav.id)}
            className={`text-sm font-semibold transition-colors whitespace-nowrap ${
              currentView === nav.id ? 'text-primary-pink' : 'text-gray-custom hover:text-dark'
            }`}
          >
            {nav.label}
          </button>
        ))}
      </nav>

      {/* 3. Primary Actions Zone */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={openCreateTripModal}
          className="bg-primary-pink text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-colors whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Trip</span>
        </button>
        <button
          onClick={() => logout()}
          className="text-gray-custom hover:text-dark p-2 rounded-lg transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
