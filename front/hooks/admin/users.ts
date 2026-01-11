"use client";
import { useMutation, useQuery } from "@apollo/client/react";
import {
    CreateUserDocument,
    CreateUserInput,
    DeleteUserDocument,
    GetUserDocument,
    GetUsersWithoutGroupDocument,
    Role,
    UpdateProfileInput,
    UpdateUserDocument,
    UpdateUserInput,
    User,
    UsersDocument
} from "@/generated/graphql";
import { email } from "zod";

export function useAdminUsers() {
    const { data, refetch } = useQuery(UsersDocument);
    if (data?.users == undefined) {
        return [];
    }
    return data.users;
}

export function useAdminCreateUser() {
const { refetch } = useQuery(UsersDocument)
    const [adminCreateUserMutation, { loading, error }] = useMutation(CreateUserDocument, {
        onCompleted: () => refetch()
    },
    )
    const adminCreateUser = async (input: {
        firstName: string;
        lastName: string;
        password: string;
        email: string;
        phone: string;
        role: Role
    }) => {

        const variables: CreateUserInput = {
            firstName: input.firstName,
            lastName: input.lastName,
            password: input.password,
            email: input.email,
            phone: input.phone,
            role: input.role
        };

        const result = await adminCreateUserMutation({
            variables: { input: variables },

        });
        return result.data?.createUser;
    };

    return {
        adminCreateUser,
        loading,
        error,
    };
}

export function useAdminUpdateUser() {
    const { refetch } = useQuery(UsersDocument)
    const [adminUpdateUserMutation, { loading, error }] = useMutation(UpdateUserDocument, {
        onCompleted: () => refetch()
    },
    )
    const adminUpdateUser = async (input: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        role: Role
    }) => {

        const variables: UpdateUserInput = {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
            role: input.role
        };

        console.log("ID", input.id)
        const result = await adminUpdateUserMutation({
            variables: { id: input.id, input: variables },

        });
        return result.data?.updateUser;
    };

    return {
        adminUpdateUser,
        loading,
        error,
    };
}

export function useAdminUser(id: string) {
    const { data, loading } = useQuery(GetUserDocument, {
        variables: { id: id },
    })

    return { data, loading };
}
export function useAdminDeleteUser() {
    const { refetch } = useQuery(UsersDocument)
    const [adminDeleteUserMutation] = useMutation(DeleteUserDocument, {
        onCompleted: () => refetch()
    },)
    const adminDeleteUser = async (input: {
        id: string;
    }) => {

        const result = await adminDeleteUserMutation({
            variables: { id: input.id },
        });
        return result.data?.deleteUser;
    };

    return {
        adminDeleteUser,
    };
}
