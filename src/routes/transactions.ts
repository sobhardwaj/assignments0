import { Router, Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../services/subscriptionService';
import { validateDonorId } from '../middleware/validation';
import { HTTP_STATUS } from '../constants/errors';
import { ApiResponse } from '../types';

const router = Router();
const subscriptionService = new SubscriptionService();

// GET /transactions - Get all transactions
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await subscriptionService.getAllTransactions();
    
    const response: ApiResponse = {
      success: true,
      data: {
        transactions,
        count: transactions.length
      },
      message: 'Transactions retrieved successfully'
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    next(error);
  }
});

// GET /transactions/:donorId - Get transactions for a specific donor
router.get('/:donorId', validateDonorId, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transactions = await subscriptionService.getTransactionsByDonorId(req.params.donorId);
    
    const response: ApiResponse = {
      success: true,
      data: {
        donorId: req.params.donorId,
        transactions,
        count: transactions.length
      },
      message: 'Donor transactions retrieved successfully'
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    next(error);
  }
});

export default router;