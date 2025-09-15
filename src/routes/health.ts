import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { HTTP_STATUS } from '../constants/errors';

const router = Router();

// GET /health - Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Service is healthy',
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
      success: false,
      message: 'Service is unhealthy',
      data: {
        status: 'ERROR',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed'
      }
    });
  }
});

export default router;