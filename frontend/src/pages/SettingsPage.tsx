import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { Building, Save, CheckCircle, ShieldCheck, Palette, FileText } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { shop, user, updateShop } = useAuth();

  const [shopName, setShopName] = useState(shop?.name || '');
  const [phone, setPhone] = useState(shop?.phone || '');
  const [email, setEmail] = useState(shop?.email || '');
  const [gstin, setGstin] = useState(shop?.gstin || '');
  const [street, setStreet] = useState(shop?.address?.street || '');
  const [city, setCity] = useState(shop?.address?.city || '');
  const [state, setState] = useState(shop?.address?.state || '');
  const [postalCode, setPostalCode] = useState(shop?.address?.postalCode || '');
  const [invoicePrefix, setInvoicePrefix] = useState(shop?.settings?.invoicePrefix || 'INV-');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        name: shopName,
        phone,
        email,
        gstin,
        address: {
          street,
          city,
          state,
          postalCode,
          country: 'India',
        },
        settings: {
          invoicePrefix,
        },
      };

      const res = await apiClient.patch('/shops/profile', payload);
      if (res.data.success) {
        updateShop(res.data.data);
        setMessage('Shop profile updated successfully.');
        setTimeout(() => setMessage(null), 4000);
      }
    } catch (err: any) {
      setMessage(`Update failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      <div className="pb-2 border-b border-stone-200">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Shop Settings & Configuration
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Manage your jewellery boutique profile, GST compliance, invoice formatting, and brand appearance.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Details */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-luxury space-y-4">
          <div className="flex items-center gap-2 font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            <Building className="w-4 h-4 text-burgundy-900" />
            <span>Jewellery Business Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Shop / Brand Name
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                GSTIN (Tax Identification)
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                placeholder="27AABCU9603R1ZM"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Store Contact Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>
          </div>
        </div>

        {/* Location & Invoicing */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/90 shadow-luxury space-y-4">
          <div className="flex items-center gap-2 font-serif font-bold text-base text-stone-900 border-b border-stone-100 pb-3">
            <FileText className="w-4 h-4 text-burgundy-900" />
            <span>Store Address & Invoicing Setup</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Shop No. 12, Gold Souk Market, Zaveri Bazaar"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Invoice Serial Prefix
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="INV-"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
              />
            </div>
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-burgundy-900 hover:bg-burgundy-950 text-white font-semibold text-sm rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-gold-400" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
