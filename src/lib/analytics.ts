// Analytics and tracking system for production

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp?: number;
  userId?: string;
}

interface UserProperties {
  userId: string;
  plan: "free" | "pro";
  signupDate: string;
  lastActive: string;
  totalQuizzes: number;
  totalQuestions: number;
  averageScore: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties | null = null;
  private isEnabled: boolean = true;

  constructor() {
    // Load analytics settings from localStorage
    this.isEnabled =
      localStorage.getItem("studyai_analytics_enabled") !== "false";

    // Load existing events
    const savedEvents = localStorage.getItem("studyai_analytics_events");
    if (savedEvents) {
      this.events = JSON.parse(savedEvents);
    }
  }

  // Track user events
  track(event: string, properties: Record<string, unknown> = {}) {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      userId: this.userProperties?.userId,
    };

    this.events.push(analyticsEvent);
    this.saveEvents();

    // In production, this would send to analytics service
    console.log("Analytics Event:", analyticsEvent);
  }

  // Set user properties
  setUser(userId: string, plan: "free" | "pro" = "free") {
    this.userProperties = {
      userId,
      plan,
      signupDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      totalQuizzes: 0,
      totalQuestions: 0,
      averageScore: 0,
    };

    localStorage.setItem(
      "studyai_user_properties",
      JSON.stringify(this.userProperties)
    );
  }

  // Update user properties
  updateUser(updates: Partial<UserProperties>) {
    if (this.userProperties) {
      this.userProperties = { ...this.userProperties, ...updates };
      localStorage.setItem(
        "studyai_user_properties",
        JSON.stringify(this.userProperties)
      );
    }
  }

  // Track quiz generation
  trackQuizGeneration(
    questionCount: number,
    difficulty: string,
    model: string
  ) {
    this.track("quiz_generated", {
      questionCount,
      difficulty,
      model,
      isPro: this.userProperties?.plan === "pro",
    });

    if (this.userProperties) {
      this.updateUser({
        totalQuizzes: this.userProperties.totalQuizzes + 1,
        totalQuestions: this.userProperties.totalQuestions + questionCount,
        lastActive: new Date().toISOString(),
      });
    }
  }

  // Track quiz completion
  trackQuizCompletion(
    score: number,
    totalQuestions: number,
    timeSpent: number
  ) {
    this.track("quiz_completed", {
      score,
      totalQuestions,
      timeSpent,
      percentage: (score / totalQuestions) * 100,
      isPro: this.userProperties?.plan === "pro",
    });

    if (this.userProperties) {
      const newTotal = this.userProperties.totalQuizzes + 1;
      const newAverage =
        (this.userProperties.averageScore * this.userProperties.totalQuizzes +
          score) /
        newTotal;

      this.updateUser({
        totalQuizzes: newTotal,
        averageScore: newAverage,
        lastActive: new Date().toISOString(),
      });
    }
  }

  // Track payment events
  trackPayment(plan: string, amount: number, method: string) {
    this.track("payment_completed", {
      plan,
      amount,
      method,
      currency: "USD",
    });
  }

  // Track feature usage
  trackFeatureUsage(feature: string) {
    this.track("feature_used", {
      feature,
      isPro: this.userProperties?.plan === "pro",
    });
  }

  // Track errors
  trackError(error: string, context: string) {
    this.track("error_occurred", {
      error,
      context,
      isPro: this.userProperties?.plan === "pro",
    });
  }

  // Track page views
  trackPageView(page: string) {
    this.track("page_viewed", {
      page,
      isPro: this.userProperties?.plan === "pro",
    });
  }

  // Enable/disable analytics
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem("studyai_analytics_enabled", enabled.toString());
  }

  // Get analytics data
  getAnalyticsData() {
    return {
      events: this.events,
      userProperties: this.userProperties,
      isEnabled: this.isEnabled,
    };
  }

  // Clear analytics data
  clearData() {
    this.events = [];
    this.userProperties = null;
    localStorage.removeItem("studyai_analytics_events");
    localStorage.removeItem("studyai_user_properties");
  }

  // Save events to localStorage
  private saveEvents() {
    // Keep only last 100 events to prevent localStorage overflow
    if (this.events.length > 100) {
      this.events = this.events.slice(-100);
    }
    localStorage.setItem(
      "studyai_analytics_events",
      JSON.stringify(this.events)
    );
  }

  // Export analytics data
  exportData() {
    return {
      events: this.events,
      userProperties: this.userProperties,
      exportDate: new Date().toISOString(),
    };
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (
  event: string,
  properties?: Record<string, unknown>
) => {
  analytics.track(event, properties);
};

export const trackQuizGen = (
  questionCount: number,
  difficulty: string,
  model: string
) => {
  analytics.trackQuizGeneration(questionCount, difficulty, model);
};

export const trackQuizComplete = (
  score: number,
  totalQuestions: number,
  timeSpent: number
) => {
  analytics.trackQuizCompletion(score, totalQuestions, timeSpent);
};

export const trackPayment = (plan: string, amount: number, method: string) => {
  analytics.trackPayment(plan, amount, method);
};

export const trackFeature = (feature: string) => {
  analytics.trackFeatureUsage(feature);
};

export const trackError = (error: string, context: string) => {
  analytics.trackError(error, context);
};

export const trackPage = (page: string) => {
  analytics.trackPageView(page);
};
