import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';
import { Subscription, CreateSubscriptionRequest, Transaction } from '../types';
import { LLMService } from './llmService';
import { CustomError } from '../middleware/errorHandler';
import { ERROR_MESSAGES, HTTP_STATUS } from '../constants/errors';

export class SubscriptionService {
  private llmService: LLMService;

  constructor() {
    this.llmService = LLMService.getInstance();
  }

  private calculateNextBillingDate(interval: string): Date {
    const now = new Date();
    const nextBilling = new Date(now);

    switch (interval) {
      case 'daily':
        nextBilling.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        nextBilling.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        nextBilling.setMonth(now.getMonth() + 1);
        break;
      case 'yearly':
        nextBilling.setFullYear(now.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid interval');
    }

    return nextBilling;
  }

  public async createSubscription(data: CreateSubscriptionRequest): Promise<Subscription> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if subscription already exists for this donor
      const existingResult = await client.query(
        'SELECT id FROM subscriptions WHERE donor_id = $1 AND is_active = true',
        [data.donorId]
      );

      if (existingResult.rows.length > 0) {
        const error = new CustomError(ERROR_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS);
        error.statusCode = HTTP_STATUS.CONFLICT;
        throw error;
      }

      // Generate tags and summary using LLM
      const llmResponse = await this.llmService.generateTagsAndSummary(data.campaignDescription);

      const nextBillingDate = this.calculateNextBillingDate(data.interval);

      // Insert subscription
      const result = await client.query(
        `INSERT INTO subscriptions 
         (donor_id, amount, currency, interval, campaign_description, tags, summary, next_billing_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.donorId,
          data.amount,
          data.currency,
          data.interval,
          data.campaignDescription,
          llmResponse.tags,
          llmResponse.summary,
          nextBillingDate
        ]
      );

      await client.query('COMMIT');

      return this.mapDbRowToSubscription(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async cancelSubscription(donorId: string): Promise<void> {
    const result = await pool.query(
      'UPDATE subscriptions SET is_active = false, updated_at = NOW() WHERE donor_id = $1 AND is_active = true RETURNING id',
      [donorId]
    );

    if (result.rows.length === 0) {
      const error = new CustomError(ERROR_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      error.statusCode = HTTP_STATUS.NOT_FOUND;
      throw error;
    }
  }

  public async getAllSubscriptions(): Promise<Subscription[]> {
    const result = await pool.query(
      `SELECT * FROM subscriptions WHERE is_active = true ORDER BY created_at DESC`
    );

    return result.rows.map(row => this.mapDbRowToSubscription(row));
  }

  public async getSubscriptionsByDonorId(donorId: string): Promise<Subscription[]> {
    const result = await pool.query(
      'SELECT * FROM subscriptions WHERE donor_id = $1 ORDER BY created_at DESC',
      [donorId]
    );

    return result.rows.map(row => this.mapDbRowToSubscription(row));
  }

  public async getDueSubscriptions(): Promise<Subscription[]> {
    const result = await pool.query(
      `SELECT * FROM subscriptions 
       WHERE is_active = true AND next_billing_date <= NOW()
       ORDER BY next_billing_date ASC`
    );

    return result.rows.map(row => this.mapDbRowToSubscription(row));
  }

  public async processRecurringPayment(subscription: Subscription): Promise<Transaction> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Create transaction record
      const transactionResult = await client.query(
        `INSERT INTO transactions 
         (subscription_id, donor_id, amount, currency, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          subscription.id,
          subscription.donorId,
          subscription.amount,
          subscription.currency,
          `Recurring ${subscription.interval} donation - ${subscription.summary}`
        ]
      );

      // Update next billing date
      const nextBillingDate = this.calculateNextBillingDate(subscription.interval);
      await client.query(
        'UPDATE subscriptions SET next_billing_date = $1, updated_at = NOW() WHERE id = $2',
        [nextBillingDate, subscription.id]
      );

      await client.query('COMMIT');

      return this.mapDbRowToTransaction(transactionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async getAllTransactions(): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions ORDER BY transaction_date DESC'
    );

    return result.rows.map(row => this.mapDbRowToTransaction(row));
  }

  public async getTransactionsByDonorId(donorId: string): Promise<Transaction[]> {
    const result = await pool.query(
      'SELECT * FROM transactions WHERE donor_id = $1 ORDER BY transaction_date DESC',
      [donorId]
    );

    return result.rows.map(row => this.mapDbRowToTransaction(row));
  }

  private mapDbRowToSubscription(row: any): Subscription {
    return {
      id: row.id,
      donorId: row.donor_id,
      amount: row.amount,
      currency: row.currency,
      interval: row.interval,
      campaignDescription: row.campaign_description,
      tags: row.tags || [],
      summary: row.summary,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      nextBillingDate: row.next_billing_date
    };
  }

  private mapDbRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      subscriptionId: row.subscription_id,
      donorId: row.donor_id,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      transactionDate: row.transaction_date,
      description: row.description
    };
  }
}