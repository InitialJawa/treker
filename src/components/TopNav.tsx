import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, PlusCircle, Settings, User, ChevronDown, Check } from 'lucide-react';
import { Trip } from '../types/travel';

interface TopNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  openCreateTripModal: () => void;
  trips: Trip[];
  activeTripId: string;
  onSelectTrip: (id: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ 
  currentView, 
  onNavigate, 
  openCreateTripModal,
  trips,
  activeTripId,
  onSelectTrip
}) => {
  const { logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0];

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <header className="bg-white border-b border-[#EAEFF5] px-3 md:px-6 py-1.5 md:py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      
      {/* 1. Left: Brand & Project Switcher */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0" ref={dropdownRef}>
        <div 
          className="flex items-center gap-2 shrink-0 pr-2 md:pr-4 border-r border-gray-100 cursor-pointer"
          onClick={() => onNavigate('Workspace')}
        >
          <img src="/logo.svg" alt="Treker Logo" className="w-7 h-7 md:w-8 md:h-8 rounded-xl object-contain shadow-2xs hover:scale-105 transition-transform" />
          <span className="font-black text-lg md:text-xl tracking-tight text-dark hidden sm:inline-block">TREKER</span>
        </div>
        
        {/* Project Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-2 py-1 md:px-3 md:py-2 rounded-xl hover:bg-soft-pink transition-colors group text-left"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:block">Current Project</span>
              <span className="text-[11px] md:text-sm font-extrabold text-dark group-hover:text-primary-pink transition-colors max-w-[100px] sm:max-w-[200px] truncate">
                {activeTrip ? activeTrip.name : 'Pilih Project'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-50 mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Daftar Project</span>
                <span className="text-[10px] font-bold bg-soft-pink text-primary-pink px-2 py-0.5 rounded-full">{trips.length}</span>
              </div>
              
              <div className="max-h-[300px] overflow-y-auto">
                {trips.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-gray-500 italic text-center">Belum ada project</div>
                ) : (
                  trips.map(trip => (
                    <button
                      key={trip.id}
                      onClick={() => {
                        onSelectTrip(trip.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-soft-pink flex items-center justify-between group transition-colors"
                    >
                      <div className="flex flex-col overflow-hidden pr-3">
                         <span className={`text-xs font-extrabold truncate ${activeTripId === trip.id ? 'text-primary-pink' : 'text-dark group-hover:text-primary-pink'}`}>
                           {trip.name}
                         </span>
                         <span className="text-[10px] text-gray-400 font-medium truncate">{trip.destination}</span>
                      </div>
                      {activeTripId === trip.id && <Check className="w-4 h-4 text-primary-pink shrink-0" />}
                    </button>
                  ))
                )}
              </div>
              
              <div className="px-3 pt-2 mt-2 border-t border-gray-50">
                <button
                  onClick={() => {
                    openCreateTripModal();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-primary-pink bg-soft-pink hover:bg-pink-100 rounded-xl transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Buat Project Baru
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Right: Nav Links & Actions Zone */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-auto">
        <nav className="hidden md:flex items-center gap-2">
          {[
            { id: 'Workspace', label: 'Tracker', icon: Compass },
            { id: 'Account', label: 'Account & Settings', icon: Settings }
          ].map(nav => (
            <button
              key={nav.id}
              onClick={() => onNavigate(nav.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                currentView === nav.id 
                  ? 'bg-soft-pink text-primary-pink' 
                  : 'text-gray-custom hover:bg-gray-50 hover:text-dark'
              }`}
            >
              <nav.icon className="w-4 h-4" />
              {nav.label}
            </button>
          ))}
        </nav>

        {/* Mobile quick nav */}
        <button
          onClick={() => onNavigate('Workspace')}
          className={`md:hidden p-2 rounded-xl ${currentView === 'Workspace' ? 'bg-soft-pink text-primary-pink' : 'text-gray-400'}`}
        >
          <Compass className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button
          onClick={() => onNavigate('Account')}
          className={`md:hidden p-2 rounded-xl ${currentView === 'Account' ? 'bg-soft-pink text-primary-pink' : 'text-gray-400'}`}
        >
          <Settings className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        <div className="w-px h-6 bg-gray-200 hidden md:block mx-1"></div>

        <button
          onClick={() => logout()}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>
    </header>
  );
}
