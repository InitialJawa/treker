import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Compass, LogOut, PlusCircle, Settings, User as UserIcon, ChevronDown, Check, Users, FolderKanban, BookOpen } from 'lucide-react';
import { Trip } from '../types/travel';

interface TopNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
  openCreateTripModal: () => void;
  trips: Trip[];
  activeTripId: string;
  onSelectTrip: (id: string) => void;
  openPublicTemplatesModal?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ 
  currentView, 
  onNavigate, 
  openCreateTripModal,
  trips,
  activeTripId,
  onSelectTrip,
  openPublicTemplatesModal
}) => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeTrip = trips.find(t => t.id === activeTripId) || trips[0];

  // Separate trips owned by user vs shared with user
  const myTrips = trips.filter(t => !user || !t.userId || t.userId === user.uid);
  const sharedTrips = trips.filter(t => user && t.userId && t.userId !== user.uid);

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
              <div className="flex items-center gap-1.5 max-w-[120px] sm:max-w-[220px]">
                <span className="text-[11px] md:text-sm font-extrabold text-dark group-hover:text-primary-pink transition-colors truncate">
                  {activeTrip ? activeTrip.name : 'Pilih Project'}
                </span>
                {activeTrip && activeTrip.userId && user && activeTrip.userId !== user.uid && (
                  <span className="bg-purple-100 text-purple-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shrink-0 flex items-center gap-0.5">
                    <Users className="w-2.5 h-2.5" /> Shared
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-50 mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Daftar Project</span>
                <span className="text-[10px] font-bold bg-soft-pink text-primary-pink px-2 py-0.5 rounded-full">{trips.length} Total</span>
              </div>
              
              <div className="max-h-[340px] overflow-y-auto space-y-1">
                {/* 1. Personal Projects */}
                <div className="px-3 py-1">
                  <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">
                    <FolderKanban className="w-3.5 h-3.5 text-primary-pink" />
                    <span>Project Saya ({myTrips.length})</span>
                  </div>
                  {myTrips.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-400 italic">Belum ada project pribadi</div>
                  ) : (
                    myTrips.map(trip => (
                      <button
                        key={trip.id}
                        onClick={() => {
                          onSelectTrip(trip.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-soft-pink flex items-center justify-between group transition-colors my-0.5 ${
                          activeTripId === trip.id ? 'bg-soft-pink/80 border border-primary-pink/20' : ''
                        }`}
                      >
                        <div className="flex flex-col overflow-hidden pr-2">
                           <div className="flex items-center gap-1.5">
                             <span className={`text-xs font-extrabold truncate ${activeTripId === trip.id ? 'text-primary-pink' : 'text-dark group-hover:text-primary-pink'}`}>
                               {trip.name}
                             </span>
                             {trip.isTemplate && (
                               <span className="bg-soft-pink text-primary-pink text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shrink-0 border border-primary-pink/20">
                                 Template
                               </span>
                             )}
                           </div>
                           <span className="text-[10px] text-gray-400 font-medium truncate">{trip.destination}</span>
                        </div>
                        {activeTripId === trip.id && <Check className="w-4 h-4 text-primary-pink shrink-0" />}
                      </button>
                    ))
                  )}
                </div>

                {/* 2. Shared Projects */}
                {sharedTrips.length > 0 && (
                  <div className="px-3 py-1 border-t border-gray-50 pt-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-extrabold text-purple-600 uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5" />
                      <span>Di-share dengan Saya ({sharedTrips.length})</span>
                    </div>
                    {sharedTrips.map(trip => (
                      <button
                        key={trip.id}
                        onClick={() => {
                          onSelectTrip(trip.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 flex items-center justify-between group transition-colors my-0.5 ${
                          activeTripId === trip.id ? 'bg-purple-50/80 border border-purple-200' : ''
                        }`}
                      >
                        <div className="flex flex-col overflow-hidden pr-2">
                           <div className="flex items-center gap-1.5">
                             <span className={`text-xs font-extrabold truncate ${activeTripId === trip.id ? 'text-purple-700' : 'text-dark group-hover:text-purple-700'}`}>
                               {trip.name}
                             </span>
                             <span className="bg-purple-100 text-purple-700 text-[9px] font-bold px-1.5 py-0.2 rounded-md shrink-0">
                               Shared
                             </span>
                           </div>
                           <span className="text-[10px] text-gray-400 font-medium truncate">{trip.destination}</span>
                        </div>
                        {activeTripId === trip.id && <Check className="w-4 h-4 text-purple-600 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="px-3 pt-2 mt-2 border-t border-gray-100 space-y-1.5">
                <button
                  onClick={() => {
                    openCreateTripModal();
                    setIsDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-primary-pink bg-soft-pink hover:bg-pink-100 rounded-xl transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Buat Project Baru
                </button>

                {openPublicTemplatesModal && (
                  <button
                    onClick={() => {
                      openPublicTemplatesModal();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-primary-pink bg-soft-pink hover:bg-pink-100 rounded-xl transition-colors border border-primary-pink/10"
                  >
                    <BookOpen className="w-4 h-4 text-primary-pink" /> Katalog Template Publik
                  </button>
                )}
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
