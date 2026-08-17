import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider, useTripContext } from './context/TripContext';
import { ThemeProvider } from './context/ThemeContext';
import { TopNav } from './components/TopNav';
import { AccountView } from './components/AccountView';
import { TripWorkspaceView } from './components/TripWorkspaceView';
import { CreateTripModal } from './components/CreateTripModal';
import { PublicTemplatesModal } from './components/PublicTemplatesModal';
import { DashboardView } from './components/DashboardView';
import { LoginView } from './components/LoginView';
import { Compass, PlusCircle, BookOpen } from 'lucide-react';

function MainApp() {
  const { trips, activeTripId, setActiveTripId } = useTripContext();
  const [currentView, setCurrentView] = useState<string>('Dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPublicTemplatesModalOpen, setIsPublicTemplatesModalOpen] = useState(false);

  // Safely match active trip, or sync first available trip if activeTripId is unassigned
  React.useEffect(() => {
    if (trips.length > 0) {
      const exists = trips.some(t => t.id === activeTripId);
      if (!activeTripId || !exists) {
        setActiveTripId(trips[0].id);
      }
    }
  }, [trips, activeTripId, setActiveTripId]);

  const selectedTrip = trips.find((t) => t.id === activeTripId) || (trips.length > 0 ? trips[0] : null);

  const handleNavigateView = (view: string) => {
    setCurrentView(view);
  };

  const handleSelectTrip = (tripId: string) => {
    setActiveTripId(tripId);
    setCurrentView('Workspace');
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans antialiased transition-colors duration-300 bg-screen-pink text-dark`}>
      <TopNav
        currentView={currentView}
        onNavigate={handleNavigateView}
        openCreateTripModal={() => setIsCreateModalOpen(true)}
        openPublicTemplatesModal={() => setIsPublicTemplatesModalOpen(true)}
        trips={trips}
        activeTripId={selectedTrip?.id || ''}
        onSelectTrip={handleSelectTrip}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full overflow-x-hidden flex flex-col">
        {currentView === 'Dashboard' && (
          <div className="p-4 md:p-8">
            <DashboardView
              onSelectTrip={handleSelectTrip}
              onCreateTrip={() => setIsCreateModalOpen(true)}
              onOpenTemplates={() => setIsPublicTemplatesModalOpen(true)}
            />
          </div>
        )}

        {currentView === 'Workspace' && selectedTrip && (
          <div className="p-4 md:p-8">
            <TripWorkspaceView
              trip={selectedTrip}
              onBackToDashboard={() => {}}
            />
          </div>
        )}
        
        {currentView === 'Workspace' && trips.length === 0 && (
           <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
             <Compass className="w-16 h-16 text-primary-pink mb-4 opacity-50" />
             <h2 className="text-2xl font-black text-dark mb-2">Belum Ada Project Trip Aktif</h2>
             <p className="text-sm text-gray-custom mb-6 max-w-md">Mulai rencanakan liburan Anda atau buka paket lengkap Explore Banyuwangi 4H3M.</p>
             <div className="flex flex-wrap items-center justify-center gap-3">
               <button 
                  onClick={() => {
                    handleSelectTrip('template-banyuwangi-explore-3d2n');
                    window.location.reload();
                  }}
                  className="bg-emerald-600 text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-md active:scale-95 cursor-pointer"
               >
                  <span>⚡ Buka Trip Banyuwangi 4H3M</span>
               </button>
               <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-primary-pink text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 cursor-pointer"
               >
                  <PlusCircle className="w-5 h-5" />
                  Buat Project Baru
               </button>
               <button 
                  onClick={() => setIsPublicTemplatesModalOpen(true)}
                  className="bg-soft-pink text-primary-pink px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-pink-100 transition-all shadow-xs active:scale-95 border border-primary-pink/10 cursor-pointer"
               >
                  <BookOpen className="w-5 h-5 text-primary-pink" />
                  Template Publik
               </button>
             </div>
           </div>
        )}

        {currentView === 'Account' && (
          <div className="p-4 md:p-8">
            <AccountView />
          </div>
        )}
      </main>

      {/* Global Create New Trip Modal */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTripCreated={(newTripId) => {
          handleSelectTrip(newTripId);
        }}
      />

      {/* Public Templates Catalog Modal */}
      <PublicTemplatesModal
        isOpen={isPublicTemplatesModalOpen}
        onClose={() => setIsPublicTemplatesModalOpen(false)}
        onSelectTrip={(newTripId) => {
          handleSelectTrip(newTripId);
        }}
      />
    </div>
  );
}

function AppGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-pink flex flex-col items-center justify-center space-y-4">
        <div className="p-2 bg-white rounded-2xl shadow-sm animate-bounce">
          <img src="/logo.svg" alt="Treker Logo" className="w-12 h-12 rounded-xl object-contain" />
        </div>
        <p className="text-xs font-bold text-gray-custom tracking-wider uppercase">Memuat TREKER...</p>
      </div>
    );
  }

  // Mandatory Login Screen
  if (!user) {
    return <LoginView />;
  }

  return (
    <TripProvider>
      <MainApp />
    </TripProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppGuard />
      </ThemeProvider>
    </AuthProvider>
  );
}
