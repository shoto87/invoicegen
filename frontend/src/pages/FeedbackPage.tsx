import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, MessageCircle, ExternalLink } from 'lucide-react';
import { apiClient } from '../api/client';
import { DashboardData } from '../types';
import { Badge } from '../components/common/Badge';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';

export const FeedbackPage: React.FC = () => {
  const { data, isLoading } = useQuery<{ data: DashboardData }>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const res = await apiClient.get('/dashboard/stats');
      return res.data;
    },
  });

  const feedbackList = data?.data?.recentFeedback || [];
  const averageRating = data?.data?.summary?.feedback?.averageRating || 0;
  const totalFeedback = data?.data?.summary?.feedback?.total || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Customer Feedback & Reviews
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Direct customer ratings collected via unique invoice tokens, preserving complete customer transparency.
          </p>
        </div>

        <a
          href="/feedback/demo-token"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-burgundy-950 bg-gold-400 hover:bg-gold-500 rounded-xl transition-all"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Preview Public Feedback Page</span>
        </a>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Overall Rating Score
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-serif text-stone-900">{averageRating}</span>
            <div className="flex items-center text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-2">
            Calculated across {totalFeedback} verified buyer responses
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200/90 shadow-luxury">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Policy & Review Integrity
          </span>
          <p className="text-xs text-stone-600 mt-2 leading-relaxed">
            All customers receive equal, non-gated access to your Google Review page. Feedback submissions are uniquely bound to invoice tokens to prevent fabrication.
          </p>
          <Badge variant="gold" className="mt-3">Unbiased Compliance</Badge>
        </div>
      </div>

      {/* Feedback Feed */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-luxury p-6">
        <h3 className="font-serif font-bold text-lg text-stone-900 mb-4">
          Recent Customer Feedback
        </h3>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : feedbackList.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No Feedback Received Yet"
            description="Seed demo jewellery data from the dashboard to view real customer ratings and review comments."
          />
        ) : (
          <div className="space-y-4">
            {feedbackList.map((fb) => (
              <div
                key={fb._id}
                className="p-4 bg-ivory-50/70 border border-stone-200/70 rounded-2xl flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-stone-900">
                      {fb.customerId?.name || 'Customer'}
                    </span>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: fb.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-700 italic">
                    "{fb.comment || 'Verified purchase with no written comment.'}"
                  </p>
                  <div className="text-[11px] text-stone-400">
                    Linked to Invoice: <span className="font-mono">{fb.invoiceId?.invoiceNumber || 'INV-REF'}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[11px] text-stone-400">
                    {new Date(fb.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
