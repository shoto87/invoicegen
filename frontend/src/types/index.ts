export type UserRole = 'super_admin' | 'shop_owner' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  shopId?: string;
}

export interface ShopBranding {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  invoiceFooterNote?: string;
}

export interface ShopSettings {
  currency: string;
  timezone: string;
  invoicePrefix: string;
  feedbackAutoRequest: boolean;
}

export interface ShopAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  phone?: string;
  email?: string;
  gstin?: string;
  address?: ShopAddress;
  branding?: ShopBranding;
  settings?: ShopSettings;
  googleReviewUrl?: string;
}

export interface AuthResponse {
  user: User;
  shop: Shop | null;
  accessToken: string;
}

export interface DashboardSummary {
  totalInvoices: number;
  totalRevenue: number;
  totalCustomers: number;
  whatsapp: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };
  feedback: {
    total: number;
    averageRating: number;
  };
}

export interface MonthlySaleItem {
  month: string;
  revenue: number;
  count: number;
}

export interface DeliveryChartItem {
  status: string;
  count: number;
  fill: string;
}

export interface RatingDistributionItem {
  star: string;
  count: number;
}

export interface InvoiceItem {
  description: string;
  grossWeight?: number;
  netWeight?: number;
  purity?: string;
  metalRate?: number;
  makingCharges?: number;
  stoneCharges?: number;
  total: number;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  invoiceDate: string;
  totalAmount: number;
  taxAmount: number;
  status: 'pending_verification' | 'verified' | 'processed' | 'cancelled';
  extractionConfidence: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  items?: InvoiceItem[];
  customerId?: {
    _id: string;
    name: string;
    mobileNumber: string;
    whatsappNumber: string;
  };
  createdAt: string;
}

export interface Customer {
  _id: string;
  name: string;
  mobileNumber: string;
  whatsappNumber: string;
  email?: string;
  consentStatus: 'granted' | 'pending' | 'revoked';
  consentDate: string;
  totalInvoicesCount: number;
  totalSpent: number;
  lastInvoiceDate?: string;
  notes?: string;
  createdAt: string;
}

export interface FeedbackItem {
  _id: string;
  rating: number;
  comment?: string;
  submittedAt: string;
  customerId?: {
    _id: string;
    name: string;
  };
  invoiceId?: {
    _id: string;
    invoiceNumber: string;
    totalAmount: number;
  };
}

export interface DashboardData {
  summary: DashboardSummary;
  charts: {
    monthlySales: MonthlySaleItem[];
    deliveryChart: DeliveryChartItem[];
    ratingDistribution: RatingDistributionItem[];
  };
  recentInvoices: Invoice[];
  recentFeedback: FeedbackItem[];
}
