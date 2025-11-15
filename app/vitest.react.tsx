import type { RenderResult } from "@testing-library/react";
import type { ErrorInfo, ReactElement, ReactNode } from "react";

import { render } from "@testing-library/react";
import { Component } from "react";

import userEvent from "@testing-library/user-event";

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  hasError: boolean;
}

interface SetupResult extends RenderResult {
  user: ReturnType<typeof userEvent.setup>;
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null, errorInfo: null, hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, errorInfo: null, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo, hasError: true });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <div data-testid="error">Error: {this.state.error.message}</div>;
    }

    return this.props.children;
  }
}

export function setup(jsx: ReactElement): SetupResult {
  return {
    user: userEvent.setup(),
    ...render(jsx),
  };
}
