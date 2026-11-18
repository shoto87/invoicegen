import { Schema, model, Document, Types } from 'mongoose';

export type IntegrationProvider = 'whatsapp_cloud' | 'google_business' | 'aws_s3';

export interface IIntegration extends Document {
  shopId: Types.ObjectId;
  provider: IntegrationProvider;
  status: 'connected' | 'disconnected' | 'error';
  credentials: Record<string, any>;
  lastSyncAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const integrationSchema = new Schema<IIntegration>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['whatsapp_cloud', 'google_business', 'aws_s3'],
      required: true,
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'error'],
      default: 'disconnected',
    },
    credentials: {
      type: Schema.Types.Mixed,
      default: {},
      select: false, // Protected credentials never leaked in casual queries
    },
    lastSyncAt: {
      type: Date,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

integrationSchema.index({ shopId: 1, provider: 1 }, { unique: true });

export const Integration = model<IIntegration>('Integration', integrationSchema);
