import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';

// Import routes
import subscriptionRoutes from './routes/subscriptions';
import transactionRoutes from './routes/transactions';
import healthRoutes from './routes/health';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import services
import { initializeDatabase } from './config/database';
import { BillingJobService } from './jobs/billingJob';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize billing job service
const billingJobService = new BillingJobService();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check route
app.use('/health', healthRoutes);

// API routes
app.use('/subscriptions', subscriptionRoutes);
app.use('/transactions', transactionRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Subscription Billing Simulator API',
    data: {
      version: '1.0.0',
      endpoints: {
        health: '/health',
        subscriptions: '/subscriptions',
        transactions: '/transactions'
      }
    }
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();

    console.log('Starting billing job service...');
    billingJobService.start();

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  billingJobService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  billingJobService.stop();
  process.exit(0);
});

startServer();

export default app;