import React, { useState } from 'react';
import { 
  LayoutDashboard, PlusCircle, MapPin, Clock, Heart, 
  Compass, User, HelpCircle, LogOut, X, AlertCircle, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onNavigate?: (view: string) => void;
  setCurrentView?: (view: string) => void;
  openCreateTripModal: () => void;
  openSettingsModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  setCurrentView,
  openCreateTripModal,
}) => {
  const { logout, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleNavClick = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    } else if (setCurrentView) {
      setCurrentView(view);
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-card-pink h-screen fixed top-0 left-0 z-30 select-none shadow-sm">
        {/* TREKER Brand Header */}
        <div 
          onClick={() => handleNavClick('Dashboard')}
          className="p-7 flex items-center gap-2.5 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-1 text-primary-pink">
            <svg className="w-7 h-7 text-primary-pink" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="4" cy="18" r="2" fill="#F0407A" stroke="none" />
              <path d="M5 16 C 8 8, 14 14, 18 6" strokeDasharray="2 3" />
              <circle cx="19" cy="5" r="2" fill="#EC1E63" stroke="none" />
            </svg>
          </div>
          <span className="font-black text-2xl tracking-wider text-dark font-sans uppercase">
            TREKER
          </span>
        </div>

        {/* Primary Navigation Items */}
        <div className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
          <button
            onClick={() => handleNavClick('Dashboard')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-bold transition-all ${
              currentView === 'Dashboard'
                ? 'bg-primary-pink text-white shadow-md'
                : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={openCreateTripModal}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-bold text-gray-custom hover:bg-soft-pink hover:text-primary-pink transition-all group"
          >
            <PlusCircle className="w-5 h-5 shrink-0" />
            <span>Create Trip</span>
          </button>

          <button
            onClick={() => handleNavClick('MyTrips')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-bold transition-all ${
              currentView === 'MyTrips'
                ? 'bg-primary-pink text-white shadow-md'
                : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
            }`}
          >
            <MapPin className="w-5 h-5 shrink-0" />
            <span>Current Trips</span>
          </button>

          <button
            onClick={() => handleNavClick('PastTrips')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-bold transition-all ${
              currentView === 'PastTrips'
                ? 'bg-primary-pink text-white shadow-md'
                : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
            }`}
          >
            <Clock className="w-5 h-5 shrink-0" />
            <span>Past Trips</span>
          </button>

          <button
            onClick={() => handleNavClick('Favorites')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-bold transition-all ${
              currentView === 'Favorites' || currentView === 'Favourites'
                ? 'bg-primary-pink text-white shadow-md'
                : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
            }`}
          >
            <Heart className="w-5 h-5 shrink-0" />
            <span>Favourites</span>
          </button>

          <button
            onClick={() => handleNavClick('Explore')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-full text-sm font-bold transition-all ${
              currentView === 'Explore'
                ? 'bg-primary-pink text-white shadow-md'
                : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
            }`}
          >
            <Compass className="w-5 h-5 shrink-0" />
            <span>Browse</span>
          </button>
        </div>

        {/* Secondary Bottom Navigation */}
        <div className="p-4 border-t border-card-pink space-y-1">
          <button
            onClick={() => handleNavClick('Account')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
              currentView === 'Account' ? 'bg-primary-pink text-white shadow-md' : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
            }`}
          >
            <User className="w-4 h-4 shrink-0" />
            <span>Account</span>
          </button>

          <button
            onClick={() => handleNavClick('Help')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-bold transition-all ${
              currentView === 'Help' ? 'bg-primary-pink text-white shadow-md' : 'text-gray-custom hover:bg-soft-pink hover:text-primary-pink'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Help</span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-bold text-gray-custom hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-card-pink z-40 px-3 py-2 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => handleNavClick('Dashboard')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-bold ${
            currentView === 'Dashboard' ? 'text-primary-pink' : 'text-gray-custom'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => handleNavClick('MyTrips')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-bold ${
            currentView === 'MyTrips' || currentView === 'TripWorkspace' ? 'text-primary-pink' : 'text-gray-custom'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Trips</span>
        </button>

        <button
          onClick={openCreateTripModal}
          className="w-12 h-12 bg-primary-pink text-white rounded-full flex items-center justify-center -mt-6 shadow-lg shadow-pink-500/30 active:scale-95 transition-transform"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleNavClick('Favorites')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-bold ${
            currentView === 'Favorites' || currentView === 'Favourites' ? 'text-primary-pink' : 'text-gray-custom'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span>Saved</span>
        </button>

        <button
          onClick={() => handleNavClick('Explore')}
          className={`flex flex-col items-center gap-1 p-2 text-xs font-bold ${
            currentView === 'Explore' ? 'text-primary-pink' : 'text-gray-custom'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Browse</span>
        </button>
      </nav>

      {/* Sleek Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center space-y-4 animate-scale-up">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-dark">Keluar dari TREKER?</h3>
              <p className="text-xs text-gray-500">Anda akan keluar dari sesi akun saat ini.</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20"
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
