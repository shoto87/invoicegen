import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  MessageSquare,
  Star,
  Globe,
  BarChart3,
  Settings,
  Gem,
  X,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { shop, user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'WhatsApp Messages', path: '/whatsapp', icon: MessageSquare },
    { name: 'Customer Feedback', path: '/feedback', icon: Star },
    { name: 'Google Reviews', path: '/google-reviews', icon: Globe },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-burgundy-950 text-stone-200 border-r border-burgundy-900/60 shadow-xl select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-burgundy-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 flex items-center justify-center text-burgundy-950 shadow-md">
            <Gem className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-serif font-bold text-lg text-ivory-50 tracking-wide truncate">
              {shop?.name || 'AuraJewel'}
            </h1>
            <p className="text-[11px] font-medium text-gold-400 tracking-wider uppercase">
              Jewellery SaaS
            </p>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-stone-400 hover:text-white p-1 rounded-lg"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation (8 Specific Items) */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-widest uppercase text-stone-400/80">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-burgundy-900 text-gold-300 font-semibold shadow-inner border-l-4 border-gold-400'
                    : 'text-stone-300 hover:bg-burgundy-900/40 hover:text-ivory-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-gold-400' : 'text-stone-400 group-hover:text-gold-300'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User / Shop Footer */}
      <div className="p-4 border-t border-burgundy-900/60 bg-burgundy-950/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-burgundy-800 border border-gold-500/40 flex items-center justify-center text-xs font-bold text-gold-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-ivory-50 truncate">{user?.name}</p>
              <p className="text-[10px] text-stone-400 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Sign out"
            className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-burgundy-900/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        <div className="pt-2 border-t border-burgundy-900/30 flex items-center justify-between text-[10px] text-stone-500">
          <span>Tenant: {shop?.slug || 'isolated'}</span>
          <span className="text-gold-500/80 font-mono">v1.0.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onCloseMobile}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-full z-50 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
