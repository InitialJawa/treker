const fs = require('fs');

let content = fs.readFileSync('src/components/ExploreView.tsx', 'utf-8');

// Replace the hero header
content = content.replace(
  /<div className="bg-primary-gradient p-8 md:p-10 rounded-\[40px\] text-white space-y-4 shadow-lg relative overflow-hidden">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/,
  `<div className="mb-8">
        <h1 className="text-3xl font-bold text-dark">Eksplorasi Destinasi & Template Trip</h1>
        <p className="text-gray-custom mt-1 text-sm font-medium">
          Temukan destinasi wisata populer dan gunakan template perjalanan siap pakai.
        </p>
        <div className="mt-4 relative max-w-xl">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari tempat wisata, Kawah Ijen, Bali, Kuliner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary-pink focus:ring-1 focus:ring-primary-pink transition-all shadow-sm"
          />
        </div>
      </div>`
);

fs.writeFileSync('src/components/ExploreView.tsx', content);
