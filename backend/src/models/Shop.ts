import { Schema, model, Document, Types } from 'mongoose';

export interface IShopBranding {
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  invoiceFooterNote?: string;
}

export interface IShopSettings {
  currency: string;
  timezone: string;
  invoicePrefix: string;
  feedbackAutoRequest: boolean;
}

export interface IShopAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IShop extends Document {
  name: string;
  slug: string;
  ownerId?: Types.ObjectId;
  gstin?: string;
  phone?: string;
  email?: string;
  address?: IShopAddress;
  branding?: IShopBranding;
  settings: IShopSettings;
  status: 'active' | 'suspended' | 'trial';
  googleReviewUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const shopSchema = new Schema<IShop>(
  {
    name: {
      type: String,
      required: [true, 'Shop name is required'],
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: [true, 'Shop slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    branding: {
      logoUrl: { type: String, default: '' },
      primaryColor: { type: String, default: '#4A0E17' }, // Deep burgundy
      accentColor: { type: String, default: '#D4AF37' },  // Gold accent
      invoiceFooterNote: { type: String, default: 'Thank you for choosing us for your jewellery purchase!' },
    },
    settings: {
      currency: { type: String, default: 'INR' },
      timezone: { type: String, default: 'Asia/Kolkata' },
      invoicePrefix: { type: String, default: 'INV-' },
      feedbackAutoRequest: { type: Boolean, default: true },
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial'],
      default: 'active',
      index: true,
    },
    googleReviewUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const Shop = model<IShop>('Shop', shopSchema);
