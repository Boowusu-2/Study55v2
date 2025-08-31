// Error handling system for production

interface ErrorInfo {
  message: string;
  context: string;
  timestamp: number;
  severity: "low" | "medium" | "high" | "critical";
}

class ErrorHandler {
  private errors: ErrorInfo[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.setupGlobalErrorHandling();
  }

  private setupGlobalErrorHandling() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.captureError(
        new Error(event.reason),
        "unhandled_promise_rejection",
        "high"
      );
    });

    // Handle JavaScript errors
    window.addEventListener("error", (event) => {
      this.captureError(
        event.error || new Error(event.message),
        "javascript_error",
        "high"
      );
    });
  }

  captureError(
    error: Error,
    context: string,
    severity: "low" | "medium" | "high" | "critical" = "medium"
  ) {
    if (!this.isEnabled) return;

    const errorInfo: ErrorInfo = {
      message: error.message,
      context,
      timestamp: Date.now(),
      severity,
    };

    this.errors.push(errorInfo);
    this.saveErrors();

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error captured:", errorInfo);
    }

    // In production, this would send to error monitoring service
    console.log("Error captured:", errorInfo);
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  getErrors() {
    return this.errors;
  }

  clearErrors() {
    this.errors = [];
    this.saveErrors();
  }

  private saveErrors() {
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
    localStorage.setItem("studyai_errors", JSON.stringify(this.errors));
  }
}

export const errorHandler = new ErrorHandler();

export const captureError = (
  error: Error,
  context: string,
  severity?: "low" | "medium" | "high" | "critical"
) => {
  errorHandler.captureError(error, context, severity);
};
