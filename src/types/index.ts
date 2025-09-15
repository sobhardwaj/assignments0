export interface Subscription {
  id: string;
  donorId: string;
  amount: number;
  currency: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  campaignDescription: string;
  tags: string[];
  summary: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  nextBillingDate: Date;
}

export interface Transaction {
  id: string;
  subscriptionId: string;
  donorId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  transactionDate: Date;
  description: string;
}

export interface CreateSubscriptionRequest {
  donorId: string;
  amount: number;
  currency: string;
  interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
  campaignDescription: string;
}

export interface LLMResponse {
  tags: string[];
  summary: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}