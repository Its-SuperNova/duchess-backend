"use client";

import { Component, ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class CategoryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Category Error Boundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full px-4 py-8">
          <div className="max-w-[1200px] mx-auto md:px-4">
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>
                Something went wrong while loading the category. Please try
                again.
              </AlertDescription>
            </Alert>
            <div className="text-center py-8">
              <Button onClick={this.handleRetry} className="mb-4">
                Try Again
              </Button>
              <p className="text-sm text-gray-600">
                If the problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
