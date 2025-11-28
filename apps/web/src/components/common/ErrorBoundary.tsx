import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);

        // Send to analytics/monitoring
        if (window.gtag) {
            window.gtag('event', 'exception', {
                description: error.message,
                fatal: true
            });
        }
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    private handleClearData = () => {
        if (window.confirm('Are you sure you want to reset all app data? This will clear your local storage and log you out.')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-linear-to-br from-gray-50 to-white flex items-center justify-center px-6">
                    <div className="max-w-md w-full text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={32} className="text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">Something went wrong</h1>
                        <p className="text-gray-600 mb-6">
                            We're sorry for the inconvenience. The error has been logged and we'll fix it soon.
                        </p>
                        {this.state.error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
                                <p className="text-xs font-mono text-red-800 break-all">
                                    {this.state.error.message}
                                </p>
                                <p className="text-xs font-mono text-red-600 mt-2 break-all">
                                    {this.state.error.stack?.split('\n').slice(0, 3).join('\n')}
                                </p>
                            </div>
                        )}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
                            >
                                <RefreshCw size={18} />
                                Reload Page
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-all"
                            >
                                <Home size={18} />
                                Go Home
                            </button>
                            <button
                                onClick={this.handleClearData}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-all"
                            >
                                <Trash2 size={18} />
                                Reset App Data
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
