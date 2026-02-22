import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface Props {
    children: ReactNode;
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
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex items-center justify-center p-6">
                    <Card className="max-w-md w-full">
                        <CardHeader className="text-center">
                            <div className="mx-auto rounded-full bg-red-100 p-3 mb-4 w-fit">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <CardTitle>حدث خطأ غير متوقع</CardTitle>
                            <CardDescription>
                                نعتذر، حدث خطأ أثناء تحميل هذا الجزء من الصفحة
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="bg-muted p-3 rounded text-left text-sm overflow-auto max-h-32">
                                    <code className="text-red-600">{this.state.error.message}</code>
                                </div>
                            )}
                            <Button onClick={this.handleRetry} variant="outline">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                إعادة المحاولة
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

// Functional wrapper for convenience
export function withErrorBoundary<P extends object>(
    WrappedComponent: React.ComponentType<P>,
    fallback?: ReactNode
) {
    return function WithErrorBoundary(props: P) {
        return (
            <ErrorBoundary fallback={fallback}>
                <WrappedComponent {...props} />
            </ErrorBoundary>
        );
    };
}

export default ErrorBoundary;
