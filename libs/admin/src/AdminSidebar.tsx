import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck,
  Users,
  Home,
  DollarSign,
  AlertTriangle,
  ChevronLeft,
  ChevronDown,
  Settings,
  HelpCircle,
  Menu,
  X,
  ListChecks,
  Wrench,
  LayoutDashboard,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: string;
  kycCount: number;
  listingsCount: number;
  disputesCount: number;
  seriesCount: number;
  isCollapsed: boolean;
  onCollapseChange: (collapsed: boolean) => void;
}

interface NavItem {
  id: string;
  icon: React.ElementType;
  label: string;
  count?: number;
  children?: { id: string; label: string }[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  kycCount,
  listingsCount,
  disputesCount,
  seriesCount,
  isCollapsed,
  onCollapseChange,
}) => {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['financials']);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [activeTab]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const toggleSection = (sectionId: string) => {
    if (isCollapsed) {
      onCollapseChange(false);
      setExpandedSections([sectionId]);
    } else {
      setExpandedSections(prev =>
        prev.includes(sectionId)
          ? prev.filter(id => id !== sectionId)
          : [...prev, sectionId]
      );
    }
  };

  const mainNavItems: NavItem[] = [
    { 
      id: 'overview', 
      icon: LayoutDashboard, 
      label: 'Overview',
    },
    { 
      id: 'kyc', 
      icon: UserCheck, 
      label: 'KYC Verification',
      count: kycCount > 0 ? kycCount : undefined,
    },
    { 
      id: 'hosts', 
      icon: Users, 
      label: 'Hosts',
    },
    { 
      id: 'financials', 
      icon: DollarSign, 
      label: 'Financials',
      children: [
        { id: 'financials', label: 'Overview' },
        { id: 'escrow', label: 'Escrow Manager' },
      ],
    },
    { 
      id: 'listings', 
      icon: Home, 
      label: 'Listings',
      count: listingsCount > 0 ? listingsCount : undefined,
    },
    { 
      id: 'disputes', 
      icon: AlertTriangle, 
      label: 'Disputes',
      count: disputesCount > 0 ? disputesCount : undefined,
    },
    { 
      id: 'tasks', 
      icon: ListChecks, 
      label: 'Tasks',
    },
  ];

  const bottomNavItems: NavItem[] = [
    { id: 'settings', icon: Settings, label: 'Settings' },
    { id: 'help', icon: HelpCircle, label: 'Help & Support' },
  ];

  const devToolsItems: NavItem[] = [
    { id: 'series-debug', icon: Wrench, label: 'Dev Tools', count: seriesCount > 0 ? seriesCount : undefined },
  ];

  const NavButton = ({ item }: { item: NavItem }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id || (item.children?.some(child => activeTab === child.id));
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.includes(item.id);

    const handleClick = () => {
      if (hasChildren) {
        toggleSection(item.id);
      } else {
        navigate(`/admin/${item.id}`);
      }
    };

    return (
      <div>
        <button
          onClick={handleClick}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
            ${isActive && !hasChildren
              ? 'bg-gray-100 text-gray-900 font-medium'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title={isCollapsed ? item.label : undefined}
        >
          <div className={`flex-shrink-0 ${isActive && !hasChildren ? 'text-gray-900' : 'text-gray-500'}`}>
            <Icon size={20} strokeWidth={1.75} />
          </div>
          
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left text-[15px]">{item.label}</span>
              
              {item.count !== undefined && item.count > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-lime-400 text-gray-900">
                  {item.count}
                </span>
              )}
              
              {hasChildren && (
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`}
                />
              )}
            </>
          )}
        </button>

        {/* Children */}
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-1 ml-4 pl-4 border-l border-gray-200 space-y-1">
            {item.children?.map(child => {
              const isChildActive = activeTab === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => navigate(`/admin/${child.id}`)}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-[14px]
                    ${isChildActive
                      ? 'text-gray-900 font-medium bg-gray-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {child.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="h-full flex flex-col">
      {/* Logo Header - Clickable to go home */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center justify-center h-16 px-4 border-b border-gray-200 flex-shrink-0 hover:bg-gray-50 transition-colors"
        title="Go to Homepage"
        aria-label="Go to Homepage"
      >
        {(isCollapsed && !isMobile) ? (
          <img 
            src="/assets/fiilar-icon.png" 
            alt="Fiilar - Go to Homepage" 
            className="w-7 h-7 object-contain"
          />
        ) : (
          <img 
            src="/assets/logo.png" 
            alt="Fiilar - Go to Homepage" 
            className="h-6 object-contain"
          />
        )}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {mainNavItems.map(item => (
          <NavButton key={item.id} item={item} />
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1 flex-shrink-0">
        {bottomNavItems.map(item => (
          <NavButton key={item.id} item={item} />
        ))}
        
        {/* Developer Tools - collapsed label */}
        {!isCollapsed && (
          <div className="pt-3 mt-2 border-t border-gray-100">
            <span className="px-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
              Developer
            </span>
          </div>
        )}
        {devToolsItems.map(item => (
          <NavButton key={item.id} item={item} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl text-gray-700 shadow-lg border border-gray-200"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`
          lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 bg-white shadow-2xl
          transform transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
        <SidebarContent isMobile={true} />
      </div>

      {/* Desktop Sidebar */}
      <div
        className={`
          hidden lg:flex flex-col flex-shrink-0 h-screen bg-white border-r border-gray-200
          transition-all duration-300 ease-out relative overflow-visible
          ${isCollapsed ? 'w-[72px]' : 'w-64'}
        `}
      >
        <SidebarContent />
        
        {/* Collapse button container - positioned on right edge, centered with header */}
        <div className="absolute top-0 right-0 h-16 flex items-center translate-x-1/2 z-[100]">
          <button
            onClick={() => onCollapseChange(!isCollapsed)}
            className="w-6 h-6 bg-white border border-gray-300 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={14} strokeWidth={2} className={`transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
    </>
  );
};
