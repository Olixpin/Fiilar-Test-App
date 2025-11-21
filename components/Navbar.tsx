
import React, { useState } from 'react';
import { User, Role, View } from '../types';
import { Menu, X, LogOut, UserCircle, Search, Globe } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: View) => void;
  onLogout: () => void;
  onSearch?: (term: string) => void;
  searchTerm?: string;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNavigate, onLogout, onSearch, searchTerm }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const NavItem = ({ label, view, icon: Icon }: any) => (
    <button
      onClick={() => { onNavigate(view); setIsMobileOpen(false); }}
      className="flex items-center space-x-2 text-gray-600 hover:text-black font-medium px-3 py-2 rounded-full hover:bg-gray-50 transition-colors text-sm"
    >
      {Icon && <Icon size={18} />}
      <span>{label}</span>
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 h-20 flex items-center">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8">
        <div className="flex justify-between items-center gap-4">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer flex-shrink-0" onClick={() => onNavigate('home')}>
            <img 
              src="https://drive.google.com/thumbnail?id=11AM3I7DLtyDpwgduNdtbUaZXJUYpvruC&sz=w400" 
              alt="Fiilar" 
              className="h-8 md:h-10 object-contain" 
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Search Pill (Desktop) */}
          <div className="hidden md:flex items-center bg-white border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow py-2.5 px-4 divide-x divide-gray-300 w-full max-w-md cursor-pointer">
            <input 
                type="text" 
                placeholder="Start your search" 
                className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-600 font-medium px-2 w-full truncate"
                value={searchTerm || ''}
                onChange={(e) => onSearch && onSearch(e.target.value)}
            />
            <div className="pl-2">
                <div className="bg-brand-600 text-white p-1.5 rounded-full">
                    <Search size={14} strokeWidth={3} />
                </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            {!user && (
              <button onClick={() => onNavigate('login-host')} className="text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-full text-sm font-semibold transition-colors">
                Become a host
              </button>
            )}
            
            <button className="p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
               <Globe size={18} />
            </button>
            
            <div className="flex items-center space-x-1 ml-1 border border-gray-200 rounded-full p-1 pl-3 hover:shadow-md transition-shadow cursor-pointer bg-white">
                <div onClick={() => !user ? onNavigate('login') : null} className="flex items-center gap-3">
                    <Menu size={18} className="text-gray-500" />
                    {!user ? (
                         <div className="bg-gray-500 text-white rounded-full p-1">
                           <UserCircle size={24} className="fill-current" />
                         </div>
                    ) : (
                         <img 
                            src={user.avatar || "https://picsum.photos/40/40"} 
                            alt="Profile" 
                            className="h-8 w-8 rounded-full object-cover"
                        />
                    )}
                </div>
            </div>

            {user && (
                <div className="flex items-center gap-1 ml-2">
                   {user.role === Role.HOST && (
                    <button onClick={() => onNavigate('dashboard-host')} className="text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-full">Dashboard</button>
                  )}
                   {user.role === Role.USER && (
                    <button onClick={() => onNavigate('dashboard-user')} className="text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-full">Trips</button>
                  )}
                   {user.role === Role.ADMIN && (
                    <button onClick={() => onNavigate('dashboard-admin')} className="text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-full">Admin</button>
                  )}
                  <button onClick={onLogout} title="Logout" className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-gray-100">
                      <LogOut size={18} />
                  </button>
                </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden gap-4">
             <button className="p-2 text-gray-900">
                 <Search size={20} />
             </button>
            <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-gray-900 p-2 border border-gray-200 rounded-full">
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-4 space-y-2 shadow-xl md:hidden z-40 animate-in slide-in-from-top-5">
           <NavItem label="Explore" view="home" />
           {!user ? (
             <>
               <NavItem label="Become a host" view="login-host" />
               <hr className="my-2"/>
               <NavItem label="Sign In" view="login" />
             </>
           ) : (
             <>
               {user.role === Role.HOST && <NavItem label="Dashboard" view="dashboard-host" />}
               {user.role === Role.USER && <NavItem label="My Bookings" view="dashboard-user" />}
               {user.role === Role.ADMIN && <NavItem label="Admin Panel" view="dashboard-admin" />}
               <button onClick={onLogout} className="flex w-full items-center space-x-2 text-red-600 font-medium px-3 py-2">
                 <LogOut size={18} /> <span>Log Out</span>
               </button>
             </>
           )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
