import { SubscriptionPlan } from '@/types/subscription';

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '5 questions per day',
      'Basic quiz features',
      'Community support',
      'Standard AI models'
    ],
    limits: {
      questionsPerDay: 5,
      documentsPerMonth: 2,
      maxQuestionsPerQuiz: 10,
      advancedFeatures: false,
      prioritySupport: false
    }
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      '50 questions per day',
      'Quiz history',
      'Priority support',
      'Basic analytics',
      'Advanced AI models',
      'Custom focus areas'
    ],
    limits: {
      questionsPerDay: 50,
      documentsPerMonth: 10,
      maxQuestionsPerQuiz: 50,
      advancedFeatures: false,
      prioritySupport: true
    },
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Unlimited questions',
      'Advanced analytics',
      'Custom quiz creation',
      'API access',
      'Priority support',
      'Study reminders',
      'Progress tracking',
      'Export reports'
    ],
    limits: {
      questionsPerDay: -1, // Unlimited
      documentsPerMonth: 50,
      maxQuestionsPerQuiz: 200,
      advancedFeatures: true,
      prioritySupport: true
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    currency: 'USD',
    interval: 'monthly',
    features: [
      'Team management',
      'Advanced integrations',
      'White-label options',
      'Dedicated support',
      'Custom branding',
      'Bulk user management',
      'Advanced security',
      'SLA guarantee'
    ],
    limits: {
      questionsPerDay: -1, // Unlimited
      documentsPerMonth: -1, // Unlimited
      maxQuestionsPerQuiz: 500,
      advancedFeatures: true,
      prioritySupport: true
    }
  }
];

// Ghana-specific plans with MoMo pricing
export const ghanaSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free-gh',
    name: 'Free',
    price: 0,
    currency: 'GHS',
    interval: 'monthly',
    features: [
      '5 questions per day',
      'Basic quiz features',
      'Community support',
      'Standard AI models'
    ],
    limits: {
      questionsPerDay: 5,
      documentsPerMonth: 2,
      maxQuestionsPerQuiz: 10,
      advancedFeatures: false,
      prioritySupport: false
    }
  },
  {
    id: 'basic-gh',
    name: 'Basic',
    price: 59.99,
    currency: 'GHS',
    interval: 'monthly',
    features: [
      '50 questions per day',
      'Quiz history',
      'Priority support',
      'Basic analytics',
      'Advanced AI models',
      'Custom focus areas',
      'MoMo payment support'
    ],
    limits: {
      questionsPerDay: 50,
      documentsPerMonth: 10,
      maxQuestionsPerQuiz: 50,
      advancedFeatures: false,
      prioritySupport: true
    },
    popular: true
  },
  {
    id: 'pro-gh',
    name: 'Pro',
    price: 119.99,
    currency: 'GHS',
    interval: 'monthly',
    features: [
      'Unlimited questions',
      'Advanced analytics',
      'Custom quiz creation',
      'API access',
      'Priority support',
      'Study reminders',
      'Progress tracking',
      'Export reports',
      'MoMo payment support'
    ],
    limits: {
      questionsPerDay: -1, // Unlimited
      documentsPerMonth: 50,
      maxQuestionsPerQuiz: 200,
      advancedFeatures: true,
      prioritySupport: true
    }
  }
];

export const getPlansByCurrency = (currency: 'USD' | 'GHS'): SubscriptionPlan[] => {
  return currency === 'GHS' ? ghanaSubscriptionPlans : subscriptionPlans;
};

export const getPlanById = (id: string): SubscriptionPlan | undefined => {
  return [...subscriptionPlans, ...ghanaSubscriptionPlans].find(plan => plan.id === id);
};
