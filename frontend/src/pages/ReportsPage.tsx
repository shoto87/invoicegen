import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Calendar, TrendingUp, Users, MessageSquare, Star } from 'lucide-react';
import { apiClient } from '../api/client';
import { DashboardData } from '../types';
import { Badge } from '../components/common/Badge';

export const ReportsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState('last_30_days');

  const { data } = useQuery<{ data: DashboardData }>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/stats');
      return res.data;
    },
  });

  const summary = data?.data?.summary;

  const handleExport = (type: 'csv' | 'pdf') => {
    alert(`Exporting ${type.toUpperCase()} report with live database records will be generated in Phase 5!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Financial trends, invoice audit data, WhatsApp delivery ratios, and customer retention metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold bg-burgundy-900 hover:bg-burgundy-950 text-white rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-gold-400" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/90 shadow-sm flex items-center gap-3">
        <Calendar className="w-4 h-4 text-stone-400" />
        <span className="text-xs font-semibold text-stone-600">Reporting Window:</span>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="text-xs sm:text-sm bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-800 focus:outline-none"
        >
          <option value="last_7_days">Last 7 Days</option>
          <option value="last_30_days">Last 30 Days</option>
          <option value="last_quarter">Last Quarter (90 Days)</option>
          <option value="financial_year">Current Financial Year (FY 2026-27)</option>
        </select>
      </div>

      {/* Report Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-xs text-stone-500 uppercase font-semibold">Invoices Generated</span>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {summary?.totalInvoices || 0}
          </div>
          <span className="text-xs text-emerald-600">Live DB Count</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-xs text-stone-500 uppercase font-semibold">Total Revenue</span>
          <div className="text-2xl font-bold font-serif text-stone-900 mt-1">
            ₹{(summary?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-emerald-600">Aggregated Sales</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-xs text-stone-500 uppercase font-semibold">WhatsApp Delivery Rate</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">
            {summary?.whatsapp?.total
              ? `${Math.round(((summary.whatsapp.delivered + summary.whatsapp.read) / summary.whatsapp.total) * 100)}%`
              : '100%'}
          </div>
          <span className="text-xs text-stone-500">{summary?.whatsapp?.delivered || 0} Delivered</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-sm">
          <span className="text-xs text-stone-500 uppercase font-semibold">Customer CSAT</span>
          <div className="text-2xl font-bold text-stone-900 mt-1">
            {summary?.feedback?.averageRating || '0.0'} / 5.0
          </div>
          <span className="text-xs text-amber-600">⭐ Star Score</span>
        </div>
      </div>
    </div>
  );
};
