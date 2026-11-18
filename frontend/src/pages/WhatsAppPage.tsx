import React from 'react';
import { MessageSquare, ShieldCheck, Send, CheckCircle2, AlertTriangle, Key, Sparkles } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const WhatsAppPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            WhatsApp Dispatch & Messaging
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Meta WhatsApp Cloud API integration, template approval, delivery webhooks and automated review invitations.
          </p>
        </div>
      </div>

      {/* Integration Status Notice */}
      <div className="p-6 bg-white border border-stone-200/90 rounded-2xl shadow-luxury space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">Meta WhatsApp Cloud API Gateway</h3>
              <p className="text-xs text-stone-500">Official Business Platform Integration</p>
            </div>
          </div>
          <Badge variant="warning">Setup Required</Badge>
        </div>

        <p className="text-sm text-stone-600 leading-relaxed">
          The WhatsApp messaging engine uses official Meta Cloud API webhooks with background worker retry mechanisms (BullMQ) to prevent duplicate deliveries and maintain customer consent safeguards.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-ivory-50 rounded-xl border border-stone-200">
            <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 mb-1">
              <Key className="w-4 h-4 text-burgundy-900" /> WABA Credentials Vault
            </div>
            <p className="text-xs text-stone-500">
              Encrypted API tokens, Phone Number ID, and WhatsApp Business Account ID.
            </p>
          </div>

          <div className="p-4 bg-ivory-50 rounded-xl border border-stone-200">
            <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-4 h-4 text-gold-600" /> Approved Templates
            </div>
            <p className="text-xs text-stone-500">
              Personalized invoice notification with dynamic customer name, amount and feedback link.
            </p>
          </div>

          <div className="p-4 bg-ivory-50 rounded-xl border border-stone-200">
            <div className="text-xs font-semibold text-stone-700 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Delivery Webhook
            </div>
            <p className="text-xs text-stone-500">
              Live tracking for Queued, Sent, Delivered, and Read receipts.
            </p>
          </div>
        </div>
      </div>

      {/* Message Preview Template Card */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-luxury p-6 max-w-xl">
        <h4 className="font-serif font-bold text-base text-stone-900 mb-3">
          Customer Message Preview
        </h4>
        <div className="bg-[#EFEAE2] p-4 rounded-2xl border border-stone-300/80 font-sans text-xs sm:text-sm text-stone-800 space-y-3">
          <div className="bg-white p-3.5 rounded-xl shadow-sm border border-stone-200 space-y-2">
            <p className="font-semibold text-stone-900">
              Dear Priya Sharma,
            </p>
            <p>
              Thank you for choosing <strong>AuraJewel House</strong> for your jewellery purchase! ✨
            </p>
            <p>
              Your tax invoice <strong>#INV-2026-001</strong> for <strong>₹1,85,000</strong> is attached as a PDF.
            </p>
            <div className="p-2.5 bg-ivory-100 rounded-lg border border-gold-200 text-stone-700 text-xs">
              ⭐ We would love to hear your feedback! Tap below to rate your experience:
              <span className="block font-mono text-burgundy-900 font-semibold mt-1">
                https://aurajewel.com/feedback/fb-token-001
              </span>
            </div>
            <p className="text-[11px] text-stone-400 text-right">
              Delivered • 12:45 PM ✓✓
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
