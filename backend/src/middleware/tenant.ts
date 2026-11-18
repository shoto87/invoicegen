import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { errorResponse } from '../utils/apiResponse';

export function requireTenant(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // Super admins may bypass shop-level isolation if querying cross-shop admin endpoints
  if (req.user?.role === 'super_admin' && !req.shopId) {
    next();
    return;
  }

  if (!req.shopId) {
    errorResponse(res, 'Tenant context missing. Unable to identify jewellery shop.', 400);
    return;
  }

  next();
}
