import * as cron from 'node-cron';
import { SubscriptionService } from '../services/subscriptionService';

export class BillingJobService {
  private subscriptionService: SubscriptionService;
  private job: cron.ScheduledTask | null = null;

  constructor() {
    this.subscriptionService = new SubscriptionService();
  }

  public start(): void {
    console.log('Starting billing job service...');

    // Run every minute for demo purposes (in production, this might be hourly or daily)
    // running it every 3 hours for testing purpose
    this.job = cron.schedule('0 */3 * * *', async () => {
      await this.processDueSubscriptions();
    }, {
      scheduled: true,
      name: 'billing-job'
    });

    console.log('Billing job scheduled to run every minute');
  }

  public stop(): void {
    if (this.job) {
      // this.job.distroy();
      this.job = null;
      console.log('Billing job stopped');
    }
  }

  private async processDueSubscriptions(): Promise<void> {
    try {
      const dueSubscriptions = await this.subscriptionService.getDueSubscriptions();

      if (dueSubscriptions.length === 0) {
        return;
      }

      console.log(`Processing ${dueSubscriptions.length} due subscription(s)...`);

      for (const subscription of dueSubscriptions) {
        try {
          const transaction = await this.subscriptionService.processRecurringPayment(subscription);

          console.log(`✅ Processed payment for donor ${subscription.donorId}: $${subscription.amount / 100} ${subscription.currency} (Transaction ID: ${transaction.id})`);
        } catch (error) {
          console.error(`❌ Failed to process payment for donor ${subscription.donorId}:`, error);
        }
      }

      console.log('Billing job completed');
    } catch (error) {
      console.error('Error in billing job:', error);
    }
  }
}