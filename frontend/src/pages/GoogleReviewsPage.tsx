import React, { useState } from 'react';
import { Globe, RefreshCw, Star, ExternalLink, CheckCircle, ShieldAlert } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const GoogleReviewsPage: React.FC = () => {
  const [googleUrl, setGoogleUrl] = useState('https://g.page/r/aurajewel-boutique/review');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Google Reviews Integration
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Official Google Business Profile API OAuth 2.0 synchronisation and verified location reviews.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API OAuth Card */}
        <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900">Google Business Profile API</h3>
                <p className="text-xs text-stone-500">Official OAuth 2.0 Integration</p>
              </div>
            </div>
            <Badge variant="neutral">Phase 4</Badge>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            Connect your verified Google Maps location to automatically synchronize public customer reviews, star ratings, and reply directly from your AuraJewel dashboard.
          </p>

          <div className="pt-2">
            <button
              onClick={() => alert('Official Google Business Profile OAuth will be connected in Phase 4!')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Connect Google Business Account</span>
            </button>
          </div>
        </div>

        {/* Manual Fallback Review URL */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury">
          <h4 className="font-serif font-bold text-base text-stone-900 mb-2">
            Manual Review Link
          </h4>
          <p className="text-xs text-stone-500 mb-4">
            If Google API access is unavailable, configure your direct Google Review URL so customers are redirected seamlessly.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Google Review URL
              </label>
              <input
                type="url"
                value={googleUrl}
                onChange={(e) => setGoogleUrl(e.target.value)}
                placeholder="https://g.page/r/your-shop/review"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-burgundy-900 hover:bg-burgundy-950 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all"
            >
              {saved ? 'Saved Successfully ✓' : 'Save Review URL'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
