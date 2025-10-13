"use client";

import { graphql } from "@/generated/gql";
import {SignUpMutation, SignUpMutationVariables, Role, SignUpDocument} from "@/generated/graphql";
import { useMutation } from "@apollo/client/react";

export function useSignUp() {
    const [signUpMutation, { data, loading, error }] = useMutation(SignUpDocument);

    const signUp = async (input: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
        role: Role;
    }) => {
        const result = await signUpMutation({
            variables: { input },
        });
        return result.data?.createUser;
    };

    return {
        signUp,
        data,
        loading,
        error,
    };
}