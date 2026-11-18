import { Schema, model, Document, Types } from 'mongoose';

export interface IGoogleReview extends Document {
  shopId: Types.ObjectId;
  googleReviewId: string;
  reviewerName: string;
  reviewerPhotoUrl?: string;
  starRating: number;
  comment?: string;
  reviewCreatedAt: Date;
  replyComment?: string;
  repliedAt?: Date;
  syncTimestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const googleReviewSchema = new Schema<IGoogleReview>(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    googleReviewId: {
      type: String,
      required: true,
    },
    reviewerName: {
      type: String,
      required: true,
    },
    reviewerPhotoUrl: {
      type: String,
    },
    starRating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    reviewCreatedAt: {
      type: Date,
      required: true,
    },
    replyComment: {
      type: String,
    },
    repliedAt: {
      type: Date,
    },
    syncTimestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

googleReviewSchema.index({ shopId: 1, googleReviewId: 1 }, { unique: true });

export const GoogleReview = model<IGoogleReview>('GoogleReview', googleReviewSchema);
