import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { errorResponse } from '../utils/apiResponse';
import { Types } from 'mongoose';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      errorResponse(res, 'Authentication required. Please log in.', 401);
      return;
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;

    if (decoded.shopId) {
      req.shopId = new Types.ObjectId(decoded.shopId);
    }

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      errorResponse(res, 'Token expired. Please refresh your session.', 401);
      return;
    }
    errorResponse(res, 'Invalid token. Authorization failed.', 401);
  }
}
