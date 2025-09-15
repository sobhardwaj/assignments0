import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants/errors';

const subscriptionSchema = Joi.object({
  donorId: Joi.string().required().min(1).max(255),
  amount: Joi.number().integer().positive().required(),
  currency: Joi.string().length(3).uppercase().default('USD'),
  interval: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').required(),
  campaignDescription: Joi.string().required().min(10).max(1000)
});

export function validateCreateSubscription(req: Request, res: Response, next: NextFunction) {
  const { error, value } = subscriptionSchema.validate(req.body);
  
  if (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: error.details[0].message
    });
  }
  
  req.body = value;
  next();
}

export function validateDonorId(req: Request, res: Response, next: NextFunction) {
  const donorIdSchema = Joi.string().required().min(1).max(255);
  const { error } = donorIdSchema.validate(req.params.donorId);
  
  if (error) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: ERROR_MESSAGES.VALIDATION_ERROR,
      message: 'Invalid donor ID format'
    });
  }
  
  next();
}