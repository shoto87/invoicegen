import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoiceFile extends Document {
  shopId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  originalFileName: string;
  fileUrl: string;
  s3Key?: string;
  fileSize: number;
  mimeType: string;
  processingStatus: 'uploaded' | 'processing' | 'extracted' | 'verified' | 'failed';
  extractedData?: Record<string, any>;
  ocrConfidence?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceFileSchema = new Schema<IInvoiceFile>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      index: true,
    },
    originalFileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    s3Key: {
      type: String,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    processingStatus: {
      type: String,
      enum: ['uploaded', 'processing', 'extracted', 'verified', 'failed'],
      default: 'uploaded',
      index: true,
    },
    extractedData: {
      type: Schema.Types.Mixed,
    },
    ocrConfidence: {
      type: Number,
      default: 0,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const InvoiceFile = model<IInvoiceFile>('InvoiceFile', invoiceFileSchema);
