import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Unhandled Error]', err);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    errorResponse(res, 'Validation Error', 400, messages);
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    errorResponse(res, `Duplicate entry. A record with this ${field} already exists.`, 409);
    return;
  }

  if (err.name === 'CastError') {
    errorResponse(res, `Invalid ID format for ${err.path}`, 400);
    return;
  }

  errorResponse(res, err.message || 'Internal Server Error', err.statusCode || 500);
}
