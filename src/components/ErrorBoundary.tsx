import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      localStorage.removeItem('rx_reader_chat_history');
      localStorage.removeItem('rx_reader_language');
    } catch (e) {
      console.error(e);
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="font-sora font-extrabold text-xl text-white">
                Something unexpected happened
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                The application encountered a temporary rendering issue on this view. Don't worry, your data is safe.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900/80 rounded-xl p-3 text-left border border-slate-700 overflow-x-auto max-h-32">
                <p className="text-[11px] font-mono text-red-400 break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleClearAndReset}
                className="w-full py-3 px-4 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Reset View</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
