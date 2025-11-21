
import React, { useState, useEffect } from 'react';
import { User, Listing } from '../types';
import { getSpaceRecommendations } from '../services/geminiService';
import ListingCard from './ListingCard';
import { Sparkles, Search } from 'lucide-react';

interface UserDashboardProps {
  user: User;
  listings: Listing[];
  onListingClick: (listing: Listing) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, listings, onListingClick }) => {
  const [preference, setPreference] = useState('');
  const [recommendations, setRecommendations] = useState<{listing: Listing, reason: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!preference.trim()) return;
    setIsLoading(true);
    try {
      const recs = await getSpaceRecommendations(preference, listings);
      
      // Map IDs back to full objects
      const fullRecs = recs.map(r => {
        const found = listings.find(l => l.id === r.listingId);
        return found ? { listing: found, reason: r.reason } : null;
      }).filter(Boolean) as {listing: Listing, reason: string}[];

      setRecommendations(fullRecs);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}</h1>
        <p className="text-gray-500">Find your next space.</p>
      </div>

      {/* AI Search */}
      <div className="bg-gradient-to-r from-brand-900 to-brand-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
           <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
             <Sparkles className="text-yellow-300" />
             AI Concierge
           </h2>
           <p className="mb-6 text-brand-100">Tell us what you need. We'll find the perfect spot.</p>
           
           <div className="flex gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
             <input 
               type="text"
               value={preference}
               onChange={(e) => setPreference(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
               placeholder="e.g. A quiet studio with natural light for a 3-hour photoshoot..."
               className="w-full bg-transparent text-white placeholder-brand-200 px-4 outline-none"
             />
             <button 
               onClick={handleSearch}
               disabled={isLoading}
               className="bg-white text-brand-900 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2"
             >
               {isLoading ? 'Thinking...' : <><Search size={18}/> Find</>}
             </button>
           </div>
        </div>
        {/* Abstract bg circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h3 className="text-xl font-bold text-gray-900">Recommended for you</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {recommendations.map(item => (
               <div key={item.listing.id} className="flex flex-col h-full">
                 <ListingCard listing={item.listing} onClick={() => onListingClick(item.listing)} />
                 <div className="mt-2 bg-brand-50 text-brand-800 p-3 rounded-lg text-sm">
                   <span className="font-bold">Why:</span> {item.reason}
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}

      {/* Standard Listing Grid (Fallback or Browse) */}
      {!isLoading && recommendations.length === 0 && (
        <div>
           <h3 className="text-xl font-bold text-gray-900 mb-4">Trending Spaces</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, 3).map(l => (
                <ListingCard key={l.id} listing={l} onClick={() => onListingClick(l)} />
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
