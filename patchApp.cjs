const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf-8');

file = file.replace("import { Sidebar } from './components/Sidebar';", "import { TopNav } from './components/TopNav';");

// Replace the div wrapper class and the sidebar usage
const oldLayout = `<div className={\`flex min-h-screen font-sans antialiased transition-colors duration-300 \${
      currentView === 'TripWorkspace' ? 'bg-screen-pink text-dark' : 'bg-white text-dark'
    }\`}>
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigateView}
        setCurrentView={handleNavigateView}
        openCreateTripModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full lg:ml-60 overflow-x-hidden">`;

const newLayout = `<div className={\`flex flex-col min-h-screen font-sans antialiased transition-colors duration-300 \${
      currentView === 'TripWorkspace' ? 'bg-screen-pink text-dark' : 'bg-white text-dark'
    }\`}>
      <TopNav
        currentView={currentView}
        onNavigate={handleNavigateView}
        openCreateTripModal={() => setIsCreateModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">`;

file = file.replace(oldLayout, newLayout);
fs.writeFileSync('src/App.tsx', file);
