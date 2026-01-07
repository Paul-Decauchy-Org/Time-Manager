"use client";
import {useMutation, useQuery} from "@apollo/client/react";
import {
    GetUsersWithoutGroupDocument,
    UpdateProfileInput,
    UpdateUserDocument,
    User,
    UsersDocument
} from "@/generated/graphql";

export function useAdminUsers() {
    const { data } = useQuery(UsersDocument);
    return data?.users;
}

export function useAdminUpdateUser() {
    const [adminUpdateUserMutation] = useMutation(UpdateUserDocument)
    const adminUpdateUser = async (input: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }) => {

        const variables: UpdateProfileInput = {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.email,
            phone: input.phone,
        };


        const result = await adminUpdateUserMutation({
            variables: { id: input.id, input: variables },
        });
        return result.data?.updateUser;
    };

    return {
        adminUpdateUser,
    };
}

export function useAdminUser({id}: {id: string}) {
    const {data} = useQuery(UserDocument, {
        variables: {id}
    })
    return data.getUser
 }