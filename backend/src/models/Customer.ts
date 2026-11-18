import { Schema, model, Document, Types } from 'mongoose';

export interface ICustomer extends Document {
  shopId: Types.ObjectId;
  name: string;
  mobileNumber: string;
  whatsappNumber: string;
  email?: string;
  consentStatus: 'granted' | 'pending' | 'revoked';
  consentDate: Date;
  totalInvoicesCount: number;
  totalSpent: number;
  lastInvoiceDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    consentStatus: {
      type: String,
      enum: ['granted', 'pending', 'revoked'],
      default: 'granted',
    },
    consentDate: {
      type: Date,
      default: Date.now,
    },
    totalInvoicesCount: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    lastInvoiceDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate customer phone records within the same jewellery shop
customerSchema.index({ shopId: 1, mobileNumber: 1 }, { unique: true });

export const Customer = model<ICustomer>('Customer', customerSchema);
