import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : { rejectUnauthorized: true }
});

// Initialize database tables
export async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        donor_id VARCHAR(255) UNIQUE NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        interval VARCHAR(20) NOT NULL,
        campaign_description TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        summary TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        next_billing_date TIMESTAMP WITH TIME ZONE NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
        donor_id VARCHAR(255) NOT NULL,
        amount INTEGER NOT NULL,
        currency VARCHAR(10) NOT NULL DEFAULT 'USD',
        status VARCHAR(20) DEFAULT 'completed',
        transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        description TEXT
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_subscriptions_donor_id ON subscriptions(donor_id);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_is_active ON subscriptions(is_active);
      CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);
      CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id ON transactions(subscription_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_donor_id ON transactions(donor_id);
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export default pool;