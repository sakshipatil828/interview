import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('CareerCurve Application Render Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleResetHome = (): void => {
    try {
      // Clear potentially corrupt session keys while preserving app settings
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 select-text">
          <div className="max-w-xl w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Header Icon & Brand */}
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-base tracking-tight text-white">CareerCurve AI</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Error Shield
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Application Error Caught Gracefully
                  </p>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-white">
                  Something went wrong while rendering this view
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  CareerCurve encountered an unexpected UI render state. Your progress is saved. You can refresh the view or return to the main dashboard.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleReload}
                  className="w-full sm:w-auto flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reload Page</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleResetHome}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Home className="w-4 h-4" />
                  <span>Go to Home</span>
                </button>
              </div>

              {/* Error Details Accordion */}
              {this.state.error && (
                <div className="border-t border-slate-800/80 pt-4">
                  <button
                    type="button"
                    onClick={this.toggleDetails}
                    className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  >
                    <span className="font-mono text-[11px]">
                      {this.state.showDetails ? 'Hide error details' : 'Show technical error details'}
                    </span>
                    {this.state.showDetails ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-rose-300 overflow-x-auto max-h-48 scrollbar-thin">
                      <p className="font-bold text-rose-400 mb-1">
                        {this.state.error.name}: {this.state.error.message}
                      </p>
                      {this.state.error.stack && (
                        <pre className="text-[10px] text-slate-400 whitespace-pre-wrap">
                          {this.state.error.stack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
