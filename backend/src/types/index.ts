import { Request } from 'express';
import { Types } from 'mongoose';

export type UserRole = 'super_admin' | 'shop_owner' | 'staff';

export interface AuthUserPayload {
  userId: string;
  shopId?: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
  shopId?: Types.ObjectId | string;
}
