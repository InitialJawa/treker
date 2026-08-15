import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider, useTripContext } from './context/TripContext';
import { TopNav } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { MyTripsView } from './components/MyTripsView';
import { ExploreView } from './components/ExploreView';
import { FavoritesView } from './components/FavoritesView';
import { AccountView } from './components/AccountView';
import { HelpView } from './components/HelpView';
import { TripWorkspaceView } from './components/TripWorkspaceView';
import { CreateTripModal } from './components/CreateTripModal';
import { LoginView } from './components/LoginView';
import { Compass } from 'lucide-react';

function MainApp() {
  const { trips, activeTripId, setActiveTripId } = useTripContext();
  const [currentView, setCurrentView] = useState<string>('Dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const selectedTrip = trips.find((t) => t.id === activeTripId) || trips[0];

  const handleNavigateView = (view: string, query?: string) => {
    if (query !== undefined) {
      setSearchQuery(query);
    }
    if (view === 'Favourites') {
      setCurrentView('Favorites');
    } else {
      setCurrentView(view);
    }
  };

  const handleSelectTrip = (tripId: string) => {
    setActiveTripId(tripId);
    setCurrentView('TripWorkspace');
  };

  return (
    <div className={`flex flex-col min-h-screen font-sans antialiased transition-colors duration-300 ${
      'bg-screen-pink text-dark'
    }`}>
      <TopNav
        currentView={currentView}
        onNavigate={handleNavigateView}
        openCreateTripModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        {currentView === 'Dashboard' && (
          <DashboardView
            onSelectTrip={handleSelectTrip}
            openCreateTripModal={() => setIsCreateModalOpen(true)}
            onNavigateView={handleNavigateView}
          />
        )}

        {currentView === 'MyTrips' && (
          <MyTripsView
            onSelectTrip={handleSelectTrip}
            openCreateTripModal={() => setIsCreateModalOpen(true)}
          />
        )}

        {currentView === 'PastTrips' && (
          <MyTripsView
            onSelectTrip={handleSelectTrip}
            openCreateTripModal={() => setIsCreateModalOpen(true)}
            filterPastOnly
          />
        )}

        {currentView === 'Explore' && (
          <ExploreView 
            onSelectTrip={handleSelectTrip} 
            initialSearchQuery={searchQuery}
          />
        )}

        {(currentView === 'Favorites' || currentView === 'Favourites') && (
          <FavoritesView onSelectTrip={handleSelectTrip} />
        )}

        {currentView === 'Account' && (
          <AccountView />
        )}

        {currentView === 'Help' && (
          <HelpView />
        )}

        {currentView === 'TripWorkspace' && selectedTrip && (
          <TripWorkspaceView
            trip={selectedTrip}
            onBackToDashboard={() => setCurrentView('Dashboard')}
          />
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
      <AppGuard />
    </AuthProvider>
  );
}
