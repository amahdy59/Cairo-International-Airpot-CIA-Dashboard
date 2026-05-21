import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full min-h-[200px] w-full flex-col items-center justify-center gap-4 rounded-xl border border-border/50 bg-secondary/30 p-6 text-center text-muted-foreground">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-status-crit/10">
            <AlertTriangle className="h-6 w-6 text-status-crit" />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">Failed to load component</h3>
            <p className="text-xs">
              {this.state.error?.message || "An unexpected error occurred while rendering this module."}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
