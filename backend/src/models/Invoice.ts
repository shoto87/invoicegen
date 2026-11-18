import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoiceItem {
  description: string;
  grossWeight?: number;
  netWeight?: number;
  purity?: string; // e.g., '22K', '18K', '916'
  metalRate?: number;
  makingCharges?: number;
  stoneCharges?: number;
  total: number;
}

export interface IInvoice extends Document {
  shopId: Types.ObjectId;
  customerId: Types.ObjectId;
  invoiceNumber: string;
  invoiceDate: Date;
  totalAmount: number;
  taxAmount: number;
  items: IInvoiceItem[];
  status: 'pending_verification' | 'verified' | 'processed' | 'cancelled';
  extractionConfidence: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  notes?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true },
    grossWeight: { type: Number, default: 0 },
    netWeight: { type: Number, default: 0 },
    purity: { type: String, default: '22K' },
    metalRate: { type: Number, default: 0 },
    makingCharges: { type: Number, default: 0 },
    stoneCharges: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: [true, 'Invoice number is required'],
      trim: true,
    },
    invoiceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
    },
    items: [invoiceItemSchema],
    status: {
      type: String,
      enum: ['pending_verification', 'verified', 'processed', 'cancelled'],
      default: 'verified',
      index: true,
    },
    extractionConfidence: {
      type: Number,
      default: 100,
    },
    paymentStatus: {
      type: String,
      enum: ['paid', 'partial', 'unpaid'],
      default: 'paid',
    },
    notes: {
      type: String,
    },
    pdfUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

invoiceSchema.index({ shopId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ shopId: 1, invoiceDate: -1 });

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
