import { Router, Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptionService';
import { validateCreateSubscription, validateDonorId } from '../middleware/validation';
import { HTTP_STATUS } from '../constants/errors';
import { ApiResponse } from '../types';

const router = Router();
const subscriptionService = new SubscriptionService();

router.post('/', validateCreateSubscription, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.body);

    const response: ApiResponse = {
      success: true,
      data: subscription,
      message: 'Subscription created successfully'
    };

    res.status(HTTP_STATUS.CREATED).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();

    const response: ApiResponse = {
      success: true,
      data: {
        subscriptions,
        count: subscriptions.length
      },
      message: 'Subscriptions retrieved successfully'
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:donorId', validateDonorId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const subscriptions = await subscriptionService.getSubscriptionsByDonorId(req.params.donorId);

    const response: ApiResponse = {
      success: true,
      data: {
        donorId: req.params.donorId,
        subscriptions,
        count: subscriptions.length
      },
      message: 'Donor subscriptions retrieved successfully'
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    next(error);
  }
});

router.delete('/:donorId', validateDonorId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await subscriptionService.cancelSubscription(req.params.donorId);

    const response: ApiResponse = {
      success: true,
      message: 'Subscription cancelled successfully'
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;