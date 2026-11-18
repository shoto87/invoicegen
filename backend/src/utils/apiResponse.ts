import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function successResponse<T>(
  res: Response,
  data?: T,
  message = 'Operation successful',
  statusCode = 200,
  pagination?: ApiResponse['pagination']
): Response {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(responseBody);
}

export function errorResponse(
  res: Response,
  error = 'Internal server error',
  statusCode = 500,
  details?: any
): Response {
  return res.status(statusCode).json({
    success: false,
    error,
    ...(details && { details }),
  });
}
