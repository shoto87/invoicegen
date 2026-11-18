import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Users,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Star,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Database,
  Clock,
  Send,
  Building,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { apiClient } from '../api/client';
import { DashboardData } from '../types';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch Live Metrics from MongoDB
  const { data, isLoading, isError, refetch } = useQuery<{ data: DashboardData }>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/stats');
      return res.data;
    },
  });

  // Seed Realistic Jewellery Records Mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      const res = await apiClient.post('/dashboard/seed-sample');
      return res.data;
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setNotification(res.message || 'Sample jewellery records seeded into MongoDB!');
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (err: any) => {
      setNotification(`Failed to seed data: ${err.response?.data?.error || err.message}`);
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const dashboard = data?.data;
  const summary = dashboard?.summary;
  const charts = dashboard?.charts;
  const recentInvoices = dashboard?.recentInvoices || [];
  const recentFeedback = dashboard?.recentFeedback || [];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 bg-rose-50 border border-rose-200 rounded-2xl text-center">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-rose-900 mb-1">Failed to Load Dashboard Metrics</h3>
        <p className="text-sm text-rose-700 mb-4">
          Could not communicate with the backend database. Please ensure backend is running.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl text-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const hasData = (summary?.totalInvoices || 0) > 0 || (summary?.totalCustomers || 0) > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Jewellery Performance Hub
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Real-time multi-tenant database analytics, invoices, customer outreach & feedback.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl text-stone-700 shadow-sm transition-all"
            title="Refresh database metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-burgundy-950 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-600 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <Database className="w-4 h-4 text-burgundy-900" />
            <span>{seedMutation.isPending ? 'Seeding MongoDB...' : 'Seed Demo Jewellery Data'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-sm flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Stat Cards Grid (Live DB values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury hover:shadow-luxury-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total Invoiced Revenue
            </span>
            <div className="w-9 h-9 rounded-xl bg-gold-50 text-gold-700 flex items-center justify-center border border-gold-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-serif text-stone-900">
            {formatCurrency(summary?.totalRevenue || 0)}
          </div>
          <p className="text-xs text-stone-500 mt-2 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">{summary?.totalInvoices || 0}</span> invoices processed
          </p>
        </div>

        {/* Card 2: Customers */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury hover:shadow-luxury-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Registered Clients
            </span>
            <div className="w-9 h-9 rounded-xl bg-burgundy-50 text-burgundy-900 flex items-center justify-center border border-burgundy-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {summary?.totalCustomers || 0}
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Isolated customer profiles in this shop
          </p>
        </div>

        {/* Card 3: WhatsApp Sent & Delivered */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury hover:shadow-luxury-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              WhatsApp Outreach
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-stone-900">
            {summary?.whatsapp.delivered || 0} <span className="text-xs text-stone-500 font-normal">delivered</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-500 mt-2">
            <span className="text-emerald-600 font-medium">✓ {summary?.whatsapp.read || 0} read</span>
            <span className="text-rose-600 font-medium">✕ {summary?.whatsapp.failed || 0} failed</span>
          </div>
        </div>

        {/* Card 4: Customer Feedback Rating */}
        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury hover:shadow-luxury-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Customer Satisfaction
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">
              {summary?.feedback.averageRating || '0.0'}
            </span>
            <span className="text-xs text-stone-500">/ 5.0</span>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Based on <span className="font-semibold text-stone-700">{summary?.feedback.total || 0}</span> verified buyer reviews
          </p>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Building}
          title="Your Jewellery Shop is Ready"
          description="You are currently viewing live database tables with zero records. Click below to seed realistic jewellery sales, diamond ring invoices, WhatsApp message statuses, and reviews directly into MongoDB!"
          actionText="Seed Demo Jewellery Data"
          onAction={() => seedMutation.mutate()}
        />
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Sales Revenue Chart */}
            <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    Monthly Invoiced Sales
                  </h3>
                  <p className="text-xs text-stone-500">Live sales totals aggregated from your database</p>
                </div>
                <Badge variant="gold">INR (₹)</Badge>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={charts?.monthlySales || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="burgundyGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3F0E18" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3F0E18" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
                    <XAxis dataKey="month" stroke="#78716C" fontSize={11} tickLine={false} />
                    <YAxis
                      stroke="#78716C"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `₹${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']}
                      contentStyle={{
                        backgroundColor: '#26070E',
                        borderRadius: '12px',
                        color: '#FAF7F2',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3F0E18"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#burgundyGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* WhatsApp Delivery Breakdown Chart */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    WhatsApp Delivery
                  </h3>
                  <Badge variant="success">Cloud API</Badge>
                </div>
                <p className="text-xs text-stone-500 mb-6">Dispatch pipeline status breakdown</p>

                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts?.deliveryChart || []} layout="vertical" margin={{ left: 10, right: 20 }}>
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="status"
                        stroke="#78716C"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        width={70}
                      />
                      <Tooltip />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                        {(charts?.deliveryChart || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Rating Distribution Progress */}
              <div className="pt-4 border-t border-stone-100">
                <span className="text-xs font-semibold text-stone-600 block mb-2">Rating Distribution</span>
                <div className="space-y-1.5">
                  {(charts?.ratingDistribution || []).map((item) => (
                    <div key={item.star} className="flex items-center gap-2 text-xs">
                      <span className="w-12 text-stone-500 shrink-0">{item.star}</span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gold-400 rounded-full"
                          style={{
                            width: `${
                              summary?.feedback.total
                                ? (item.count / summary.feedback.total) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-stone-700 font-medium w-4 text-right">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row: Recent Invoices & Recent Feedback */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Invoices Table (2 Cols) */}
            <div className="lg:col-span-2 p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    Recent Customer Invoices
                  </h3>
                  <p className="text-xs text-stone-500">Live invoices saved in your shop database</p>
                </div>
                <a
                  href="/invoices"
                  className="text-xs font-semibold text-burgundy-900 hover:text-burgundy-950 flex items-center gap-1"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 text-stone-500 font-semibold text-xs uppercase tracking-wider">
                      <th className="py-3 px-2">Invoice #</th>
                      <th className="py-3 px-2">Customer</th>
                      <th className="py-3 px-2">Date</th>
                      <th className="py-3 px-2 text-right">Amount</th>
                      <th className="py-3 px-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {recentInvoices.map((inv) => (
                      <tr key={inv._id} className="hover:bg-ivory-50/70 transition-colors">
                        <td className="py-3 px-2 font-mono font-medium text-stone-900">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-3 px-2 text-stone-800 font-medium">
                          {inv.customerId?.name || 'Walk-in Client'}
                        </td>
                        <td className="py-3 px-2 text-stone-500">
                          {new Date(inv.invoiceDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-stone-900">
                          {formatCurrency(inv.totalAmount)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge
                            variant={
                              inv.status === 'verified'
                                ? 'success'
                                : inv.status === 'pending_verification'
                                ? 'warning'
                                : 'neutral'
                            }
                          >
                            {inv.status.replace('_', ' ')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Customer Feedback (1 Col) */}
            <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                    Buyer Feedback
                  </h3>
                  <a
                    href="/feedback"
                    className="text-xs font-semibold text-burgundy-900 hover:text-burgundy-950 flex items-center gap-1"
                  >
                    All <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-4">
                  {recentFeedback.map((fb) => (
                    <div key={fb._id} className="p-3 bg-ivory-50 rounded-xl border border-stone-200/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-xs text-stone-900">
                          {fb.customerId?.name || 'Customer'}
                        </span>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: fb.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2 italic mb-2">
                        "{fb.comment || 'No comment provided'}"
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-stone-400">
                        <span>Inv: {fb.invoiceId?.invoiceNumber || 'N/A'}</span>
                        <span>{new Date(fb.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrations Placeholder Info */}
              <div className="mt-4 pt-4 border-t border-stone-100 bg-stone-50/70 p-3 rounded-xl">
                <span className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Integrations Status
                </span>
                <div className="flex items-center justify-between text-[11px] text-stone-500">
                  <span>Meta WhatsApp: Pending API setup</span>
                  <Badge variant="neutral">Phase 3</Badge>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
