import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
    requireAuth?: boolean;
}

/**
 * ProtectedRoute - Role-based access control for routes
 * 
 * @param children - The component to render if access is granted
 * @param allowedRoles - Array of user types allowed to access this route
 * @param requireAuth - If true, requires any authenticated user (default: true)
 */
export function ProtectedRoute({
    children,
    allowedRoles,
    requireAuth = true
}: ProtectedRouteProps) {
    const { isAuthenticated, userType, isLoading } = useAuth();

    // Show loading while checking auth status
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                    <p className="text-muted-foreground">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    // Check authentication
    if (requireAuth && !isAuthenticated) {
        return <Redirect to="/" />;
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(userType)) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                    <div className="text-6xl">🚫</div>
                    <h2 className="text-2xl font-bold text-destructive">غير مصرح</h2>
                    <p className="text-muted-foreground text-center max-w-md">
                        لا تملك صلاحية للوصول لهذه الصفحة. يرجى التواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        You do not have permission to access this page.
                    </p>
                </div>
            );
        }
    }

    return <>{children}</>;
}

/**
 * Helper component for admin-only routes
 */
export function AdminRoute({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            {children}
        </ProtectedRoute>
    );
}

/**
 * Helper component for doctor routes (doctor + graduate)
 */
export function DoctorRoute({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['doctor', 'graduate', 'admin']}>
            {children}
        </ProtectedRoute>
    );
}

/**
 * Helper component for medical staff routes (doctor, graduate, student)
 */
export function MedicalStaffRoute({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['doctor', 'graduate', 'student', 'admin']}>
            {children}
        </ProtectedRoute>
    );
}

export default ProtectedRoute;
