"use client";
import {useMutation, useQuery} from "@apollo/client/react";
import {
    DeleteUserDocument,
    GetUserDocument,
    GetUsersWithoutGroupDocument,
    UpdateProfileInput,
    UpdateUserDocument,
    User,
    UsersDocument
} from "@/generated/graphql";

export function useAdminUsers() {
    const { data } = useQuery(UsersDocument);
    if (data?.users == undefined) {
        return [];
    }
    return data.users;
}

export function useAdminUpdateUser() {
    const [adminUpdateUserMutation, { loading, error }] = useMutation(UpdateUserDocument)
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
        loading,
        error,
    };
}

export function useAdminUser(id: string) {
    const {data, loading} = useQuery(GetUserDocument, {
        variables: {id: id},
    })
    
    return  {data, loading};
 }
 export function useAdminDeleteUser() {
    const [adminDeleteUserMutation] = useMutation(DeleteUserDocument)
     const adminDeleteUser = async (input: {
         id: string;
     }) => {

         const result = await adminDeleteUserMutation({
             variables: { id: input.id},
         });
         return result.data?.deleteUser;
     };

     return {
         adminDeleteUser,
     };
 }
