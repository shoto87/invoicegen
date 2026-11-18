import { Schema, model, Document, Types } from 'mongoose';

export type WhatsAppDeliveryStatus = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

export interface IWhatsAppMessage extends Document {
  shopId: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  customerId: Types.ObjectId;
  recipientPhone: string;
  templateName: string;
  messageContent: string;
  status: WhatsAppDeliveryStatus;
  metaMessageId?: string;
  failureReason?: string;
  feedbackToken?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const whatsAppMessageSchema = new Schema<IWhatsAppMessage>(
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
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    recipientPhone: {
      type: String,
      required: true,
    },
    templateName: {
      type: String,
      default: 'jewellery_invoice_notification',
    },
    messageContent: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
      default: 'queued',
      index: true,
    },
    metaMessageId: {
      type: String,
      index: true,
    },
    failureReason: {
      type: String,
    },
    feedbackToken: {
      type: String,
      index: true,
    },
    sentAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
    retryCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

whatsAppMessageSchema.index({ shopId: 1, createdAt: -1 });

export const WhatsAppMessage = model<IWhatsAppMessage>('WhatsAppMessage', whatsAppMessageSchema);
