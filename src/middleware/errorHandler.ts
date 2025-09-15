import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/errors';

export interface ICustomError extends Error {
  statusCode?: number;
  code?: string;
}

export class CustomError extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'CustomError';
    this.statusCode = statusCode;
  }
}

export function errorHandler(err: ICustomError, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  // Database constraint violation
  if (err.code === '23505') {
    return res.status(HTTP_STATUS.CONFLICT).json({
      success: false,
      error: ERROR_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS
    });
  }

  // Database connection error
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      error: ERROR_MESSAGES.DATABASE_ERROR,
      message: 'Database connection failed'
    });
  }

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: 'Route not found',
    message: `${req.method} ${req.path} not found`
  });
}