export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: 'USD' | 'GHS';
  interval: 'monthly' | 'yearly';
  features: string[];
  limits: {
    questionsPerDay: number;
    documentsPerMonth: number;
    maxQuestionsPerQuiz: number;
    advancedFeatures: boolean;
    prioritySupport: boolean;
  };
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'momo';
  provider: 'stripe' | 'paystack' | 'flutterwave' | 'momo';
  last4?: string;
  brand?: string;
  phoneNumber?: string;
  isDefault: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  paymentMethodId: string;
  usage: {
    questionsToday: number;
    documentsThisMonth: number;
    totalQuizzes: number;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: 'USD' | 'GHS';
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'failed';
  clientSecret: string;
  paymentMethod?: PaymentMethod;
}
