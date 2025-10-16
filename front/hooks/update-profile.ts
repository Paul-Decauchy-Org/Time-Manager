"use client";

import { graphql } from "@/generated/gql";
import {
    SignUpMutation,
    SignUpMutationVariables,
    Role,
    SignUpDocument,
    UpdateProfileDocument
} from "@/generated/graphql";
import { useMutation } from "@apollo/client/react";

export function useUpdateProfile() {
    const [updateProfileMutation, { data, loading, error }] = useMutation(UpdateProfileDocument);

    const updateProfile = async (input: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        password: string;
    }) => {
        const variables: any = {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
        };

        if (input.password !== "") {
            variables.password = input.password;
        }
        const result = await updateProfileMutation({
            variables: { input },
        });
        return result.data?.updateProfile;
    };

    return {
        updateProfile,
        data,
        loading,
        error,
    };
}