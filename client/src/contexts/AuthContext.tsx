import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
    id: string;
    username: string;
    fullName: string;
    email?: string;
    phone?: string;
    userType: 'patient' | 'doctor' | 'student' | 'graduate' | 'admin';
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    userType: string;
    userId: string;
    userName: string;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    refetchUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUser(): Promise<User | null> {
    const response = await fetch('/api/auth/me', {
        credentials: 'include',
    });

    if (response.status === 401) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`${response.status}: ${response.statusText}`);
    }

    return response.json();
}

async function logoutUser(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Logout failed');
    }

    localStorage.removeItem('dentoRememberedUser');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    const { data: user, isLoading, refetch } = useQuery<User | null>({
        queryKey: ['/api/auth/me'],
        queryFn: fetchUser,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: true, // Re-check session when user returns to tab
        refetchOnReconnect: true, // Re-check when internet reconnects
    });

    // Login: Wait for server to confirm, then refetch user
    const login = useCallback(async () => {
        // After successful login API call, refetch to get updated user
        await refetch();
    }, [refetch]);

    const logout = useCallback(async () => {
        await logoutUser();
        queryClient.setQueryData(['/api/auth/me'], null);
        queryClient.invalidateQueries();
    }, [queryClient]);

    const value: AuthContextType = {
        user: user ?? null,
        isLoading,
        isAuthenticated: !!user, // SINGLE SOURCE OF TRUTH: server session only
        userType: user?.userType || '',
        userId: user?.id || '',
        userName: user?.fullName || user?.username || '',
        login,
        logout,
        refetchUser: refetch,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Helper hooks for role checks
export function useIsAdmin() {
    const { userType } = useAuth();
    return userType === 'admin';
}

export function useIsDoctor() {
    const { userType } = useAuth();
    return userType === 'doctor' || userType === 'graduate';
}

export function useIsPatient() {
    const { userType } = useAuth();
    return userType === 'patient' || userType === 'student';
}

export function useIsMedicalStaff() {
    const { userType } = useAuth();
    return ['doctor', 'graduate', 'student'].includes(userType);
}
