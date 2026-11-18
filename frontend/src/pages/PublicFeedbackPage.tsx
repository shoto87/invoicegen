import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gem, Star, CheckCircle, ExternalLink, MessageSquare } from 'lucide-react';

export const PublicFeedbackPage: React.FC = () => {
  const { token } = useParams();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-ivory-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-md w-full mx-auto my-auto">
        {/* Brand Card */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-burgundy-950 text-gold-400 flex items-center justify-center mx-auto mb-3 shadow-md">
            <Gem className="w-8 h-8" />
          </div>
          <h1 className="font-serif font-bold text-2xl text-stone-900 tracking-tight">
            AuraJewel Luxury Retailers
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Customer Experience & Verification Portal
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-luxury p-6 sm:p-8">
          {submitted ? (
            <div className="text-center space-y-4 py-4 animate-in fade-in">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Thank You for Your Feedback!
              </h2>
              <p className="text-xs text-stone-600 leading-relaxed">
                Your rating of {rating} stars has been securely recorded for your purchase. We cherish your patronage.
              </p>

              {/* Direct Google Review Link (Non-gated, compliant) */}
              <div className="pt-4 border-t border-stone-100">
                <p className="text-xs text-stone-700 font-semibold mb-3">
                  Would you also like to share your review on Google?
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 bg-burgundy-900 hover:bg-burgundy-950 text-gold-300 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Post on Google Review Page</span>
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Rate Your Experience
                </h2>
                <p className="text-xs text-stone-500">
                  Ref: <span className="font-mono text-stone-700">{token || 'INV-2026-001'}</span>
                </p>
              </div>

              {/* Interactive Star Rating */}
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (hoverRating !== null ? star <= hoverRating : star <= rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Comment Field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Your Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about your jewellery design, billing or staff experience..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-900/20 resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-burgundy-900 hover:bg-burgundy-950 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
              >
                Submit Feedback
              </button>

              <p className="text-[10px] text-stone-400 text-center leading-normal">
                By submitting, your feedback is registered with the shop owner to enhance quality of service.
              </p>
            </form>
          )}
        </div>
      </div>

      <footer className="text-center text-[11px] text-stone-400 py-4">
        Powered by AuraJewel Multi-Tenant SaaS
      </footer>
    </div>
  );
};
