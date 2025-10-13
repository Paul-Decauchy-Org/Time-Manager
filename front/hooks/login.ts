"use client";

import {useMutation} from "@apollo/client/react";
import {LoginDocument, Role} from "@/generated/graphql";

export function useLogin() {
    const [loginMutation, { data, loading, error }] = useMutation(LoginDocument);

    const login = async (email: string, password: string) => {
        const result = await loginMutation({
            variables: { email: email, password:password},
        });
        return result.data?.login;
    };

    return {
        login,
        data,
        loading,
        error,
    };
}