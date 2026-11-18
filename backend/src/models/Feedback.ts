import { Schema, model, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
  shopId: Types.ObjectId;
  invoiceId: Types.ObjectId;
  customerId: Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  uniqueToken: string;
  submittedAt?: Date;
  status: 'submitted' | 'acknowledged';
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
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
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    uniqueToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'acknowledged'],
      default: 'submitted',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate feedback submissions for the same invoice within the shop
feedbackSchema.index({ shopId: 1, invoiceId: 1 }, { unique: true });

export const Feedback = model<IFeedback>('Feedback', feedbackSchema);
