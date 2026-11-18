import React from 'react';
import { Menu, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { shop, user } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-serif font-semibold text-stone-900 tracking-tight text-base sm:text-lg">
            {shop?.name || 'AuraJewel'}
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-gold-100/70 text-gold-900 border border-gold-300/60">
            <Sparkles className="w-3 h-3 text-gold-600" />
            Jewellery Suite
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Public Feedback Link Preview */}
        <a
          href="/feedback/demo-preview"
          target="_blank"
          rel="noreferrer"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-burgundy-900 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Customer Review Page</span>
        </a>

        {/* Role Badge */}
        <Badge variant="burgundy" className="capitalize">
          <ShieldCheck className="w-3 h-3 mr-1 text-burgundy-700" />
          {user?.role?.replace('_', ' ')}
        </Badge>
      </div>
    </header>
  );
};
