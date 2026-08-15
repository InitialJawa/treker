import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider, useTripContext } from './context/TripContext';
import { ThemeProvider } from './context/ThemeContext';
import { TopNav } from './components/TopNav';
import { AccountView } from './components/AccountView';
import { TripWorkspaceView } from './components/TripWorkspaceView';
import { CreateTripModal } from './components/CreateTripModal';
import { LoginView } from './components/LoginView';
import { Compass, PlusCircle } from 'lucide-react';

function MainApp() {
  const { trips, activeTripId, setActiveTripId } = useTripContext();
  const [currentView, setCurrentView] = useState<string>('Workspace');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // If there are no trips, we shouldn't fail.
  const selectedTrip = trips.find((t) => t.id === activeTripId) || trips[0];

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
        trips={trips}
        activeTripId={selectedTrip?.id || ''}
        onSelectTrip={handleSelectTrip}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-[1400px] mx-auto w-full overflow-x-hidden flex flex-col">
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
             <h2 className="text-2xl font-black text-dark mb-2">Belum Ada Project Trip</h2>
             <p className="text-sm text-gray-custom mb-6 max-w-md">Mulai rencanakan liburan Anda. Buat project baru dan kumpulkan inspirasi, jadwal, hingga budget di satu tempat.</p>
             <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-primary-pink text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95"
             >
                <PlusCircle className="w-5 h-5" />
                Buat Project Trip Pertama
             </button>
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
    </div>
  );
}

function AppGuard() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-soft-pink flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-soft-pink text-primary-pink rounded-2xl animate-bounce">
          <Compass className="w-10 h-10" />
        </div>
        <p className="text-xs font-bold text-gray-custom tracking-wider uppercase">Memuat Aplikasi Traveler...</p>
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
