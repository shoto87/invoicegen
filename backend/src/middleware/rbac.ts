import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { errorResponse } from '../utils/apiResponse';

export function authorizeRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      errorResponse(res, 'Unauthorized. Please authenticate first.', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      errorResponse(
        res,
        `Access denied. Requires one of the following roles: [${allowedRoles.join(', ')}]`,
        403
      );
      return;
    }

    next();
  };
}
