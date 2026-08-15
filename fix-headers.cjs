const fs = require('fs');

const views = [
  'src/components/MyTripsView.tsx',
  'src/components/FavoritesView.tsx',
  'src/components/HelpView.tsx',
  'src/components/ExploreView.tsx'
];

views.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace the crazy gradient headers with clean, functional text headers
  // We'll use a regex to match the <div className="bg-primary-gradient... "> ... </div> block at the top
  const headerRegex = /<div className="bg-primary-gradient[^>]*>[\s\S]*?(?:<\/div>\s*<\/div>|<\/div>\s*<\/div>\s*<\/div>|<\/div>)\s*<\/div>/;
  
  if (file.includes('ExploreView.tsx')) {
    // We'll just replace the specific hero in ExploreView manually
  } else if (file.includes('MyTripsView.tsx')) {
    content = content.replace(/<div className="bg-primary-gradient p-8 md:p-10 rounded-\[40px\] text-white space-y-4 shadow-lg relative overflow-hidden mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `<div className="mb-8">\n        <h1 className="text-3xl font-bold text-dark">{filterPastOnly ? 'History' : 'My Trips'}</h1>\n        <p className="text-gray-custom mt-1 text-sm">{filterPastOnly ? 'Your past adventures' : 'Manage your upcoming trips'}</p>\n      </div>`);
  } else if (file.includes('FavoritesView.tsx')) {
    content = content.replace(/<div className="bg-primary-gradient p-8 md:p-10 rounded-\[40px\] text-white space-y-4 shadow-lg relative overflow-hidden mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `<div className="mb-8">\n        <h1 className="text-3xl font-bold text-dark">Favorites</h1>\n        <p className="text-gray-custom mt-1 text-sm">Your saved places and inspiration</p>\n      </div>`);
  } else if (file.includes('HelpView.tsx')) {
    content = content.replace(/<div className="bg-primary-gradient p-8 md:p-10 rounded-\[40px\] text-white space-y-4 shadow-lg relative overflow-hidden mb-6 text-center">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, `<div className="mb-8">\n        <h1 className="text-3xl font-bold text-dark">Help & Support</h1>\n        <p className="text-gray-custom mt-1 text-sm">How can we help you today?</p>\n      </div>`);
  }
  
  fs.writeFileSync(file, content);
});
