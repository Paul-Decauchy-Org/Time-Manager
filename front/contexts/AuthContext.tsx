'use client';
import { createContext, useContext, ReactNode } from 'react';
import {useFragment, useQuery, useSuspenseQuery} from '@apollo/client/react';
import {MeDocument, Role, User} from "@/generated/graphql";

interface AuthContextType {
    user: User| null;
    loading: boolean;
    isAuthenticated: boolean;
    hasRole: (roles: Role | Role[]) => boolean;
    isAdmin: boolean;
    isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
    const { data, loading, error } = useQuery(MeDocument, {
        // Don't show errors for unauthenticated users
        errorPolicy: 'ignore',
    });

    const user = data?.me || null;

    const hasRole = (roles: Role | Role[]): boolean => {
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
    };


    const value: AuthContextType = {
        user,
        loading,
        isAuthenticated: !!user,
        hasRole,
        isAdmin: user?.role === Role.Admin,
        isManager: user?.role === Role.Manager|| user?.role === Role.Admin,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}