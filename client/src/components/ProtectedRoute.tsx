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
            return <Redirect to="/unauthorized" />;
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
 * Supports custom role filtering for flexibility
 */
export function MedicalStaffRoute({
    children,
    allowedRoles
}: {
    children: React.ReactNode;
    allowedRoles?: string[];
}) {
    return (
        <ProtectedRoute allowedRoles={allowedRoles || ['doctor', 'graduate', 'student', 'admin']}>
            {children}
        </ProtectedRoute>
    );
}

/**
 * Helper component for patient-only routes
 */
export function PatientRoute({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['patient', 'admin']}>
            {children}
        </ProtectedRoute>
    );
}

/**
 * Helper component for doctor-only routes (e.g., pricing management)
 */
export function DoctorOnlyRoute({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute allowedRoles={['doctor', 'admin']}>
            {children}
        </ProtectedRoute>
    );
}

export default ProtectedRoute;
