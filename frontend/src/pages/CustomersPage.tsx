import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Search, Phone, ShieldCheck, Mail } from 'lucide-react';
import { apiClient } from '../api/client';
import { Customer } from '../types';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const CustomersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery<{ data: Customer[] }>({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await apiClient.get('/customers');
      return res.data;
    },
  });

  const customers = data?.data || [];
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mobileNumber.includes(searchTerm)
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Isolated customer profiles, verified communication consent, and lifetime purchase history.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-luxury p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search by client name or mobile number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Customers Found"
            description="No customer records found matching your query. Seed demo data from the dashboard to populate your customer directory."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-semibold uppercase text-xs">
                  <th className="py-3 px-3">Customer Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3 text-center">Consent Status</th>
                  <th className="py-3 px-3 text-center">Invoices</th>
                  <th className="py-3 px-3 text-right">Lifetime Value</th>
                  <th className="py-3 px-3">Preferences / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-ivory-50/70 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-stone-900">{c.name}</div>
                      {c.email && (
                        <div className="text-[11px] text-stone-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {c.email}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 text-stone-800 font-mono text-xs">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {c.mobileNumber}
                      </div>
                      <div className="text-[10px] text-stone-400">WhatsApp verified</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge
                        variant={c.consentStatus === 'granted' ? 'success' : 'warning'}
                        className="capitalize"
                      >
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        {c.consentStatus}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-stone-800">
                      {c.totalInvoicesCount}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-stone-900">
                      {formatCurrency(c.totalSpent)}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-stone-600 max-w-xs truncate">
                      {c.notes || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
