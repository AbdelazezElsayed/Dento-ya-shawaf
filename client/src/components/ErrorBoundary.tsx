import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors in child components
 * 
 * Prevents the entire app from crashing when a single component fails.
 * Displays a user-friendly error message with recovery options.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({ errorInfo });

        // You could also log to an error reporting service here
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex items-center justify-center min-h-[400px] p-4">
                    <Card className="max-w-lg w-full">
                        <CardHeader className="text-center">
                            <div className="flex justify-center mb-4">
                                <AlertTriangle className="h-16 w-16 text-destructive" />
                            </div>
                            <CardTitle className="text-2xl text-destructive">
                                حدث خطأ غير متوقع
                            </CardTitle>
                            <CardDescription>
                                An unexpected error occurred. Please try again.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted rounded-lg p-4 text-sm font-mono overflow-auto max-h-32">
                                {this.state.error?.message || 'Unknown error'}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center gap-4">
                            <Button variant="outline" onClick={this.handleReset}>
                                <RefreshCcw className="h-4 w-4 mr-2" />
                                حاول مرة أخرى
                            </Button>
                            <Button onClick={this.handleReload}>
                                إعادة تحميل الصفحة
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
