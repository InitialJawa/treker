const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf-8');

// The line: <div className={`flex flex-col min-h-screen font-sans antialiased transition-colors duration-300 ${ currentView === 'TripWorkspace' ? 'bg-screen-pink text-dark' : 'bg-white text-dark' }`}>
file = file.replace(
  "currentView === 'TripWorkspace' ? 'bg-screen-pink text-dark' : 'bg-white text-dark'",
  "'bg-screen-pink text-dark'"
);

fs.writeFileSync('src/App.tsx', file);
