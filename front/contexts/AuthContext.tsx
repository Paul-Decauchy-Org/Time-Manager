"use client";
import { createContext, useContext, ReactNode } from "react";
import { useBackgroundQuery, useReadQuery, QueryRef } from "@apollo/client/react";
import { MeDocument, MeQuery, Role, User} from "@/generated/graphql";

interface AuthContextType {
    user: User;
    hasRole: (roles: Role | Role[]) => boolean;
    isAdmin: boolean;
    isManager: boolean;
}

const AuthContext = createContext<QueryRef<MeQuery>| undefined>(undefined);

// Provider component - starts fetching immediately
export function AuthProvider({ children }: { children: ReactNode }) {
    const [queryRef] = useBackgroundQuery(MeDocument);

    return <AuthContext.Provider value={queryRef}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth(): AuthContextType {
    const queryRef = useContext(AuthContext);
    if (queryRef === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    // Read the prefetched data
    const { data } = useReadQuery(queryRef);
    const user = data.me;

    const hasRole = (roles: Role | Role[]): boolean => {
        if (!user) return false;
        const roleArray = Array.isArray(roles) ? roles : [roles];
        return roleArray.includes(user.role);
    };

    return {
        user,
        hasRole,
        isAdmin: user?.role === Role.Admin,
        isManager: user?.role === Role.Manager || user?.role === Role.Admin,
    };
}