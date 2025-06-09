

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onRetry?: () => void;
  onNavigateHome?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Call optional onError handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // In production, you would send this to your error tracking service
    // Example: Sentry.captureException(error);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-700 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <div className="flex flex-col space-y-3">
              <Button 
                variant="primary" 
                onClick={() => {
                  // React Native equivalent of page reload
                  if (this.props.onRetry) {
                    this.props.onRetry();
                  }
                }}
                className="w-full"
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                onClick={this.handleReset}
                className="w-full"
              >
                Try Again
              </Button>
              <Button 
                variant="text" 
                onClick={() => {
                  // React Native navigation to home
                  if (this.props.onNavigateHome) {
                    this.props.onNavigateHome();
                  }
                }}
                className="w-full"
              >
                Go to Home Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 