import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  userRole?: string;
}

export const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Traveler';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl font-bold text-dark">Welcome back, {userName}</h1>
        <p className="text-gray-custom mt-1 text-sm">Where are you planning to go next?</p>
      </div>
      
      <form onSubmit={handleSearchSubmit} className="w-full md:w-96 shrink-0">
        <div className="relative w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search destinations..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-dark placeholder:text-gray-400 focus:outline-none focus:border-primary-pink focus:ring-1 focus:ring-primary-pink transition-all shadow-sm"
          />
        </div>
      </form>
    </div>
  );
};
