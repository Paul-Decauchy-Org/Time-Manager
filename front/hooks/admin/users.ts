
import {useSuspenseQuery} from "@apollo/client/react";
import {GetUserDocument, UsersDocument} from "@/generated/graphql";

export function useAdminUsers() {
    const { data } = useSuspenseQuery(UsersDocument);
    return data.users;
}

export function useAdminUser({id}: {id: string}) {
    const {data} = useSuspenseQuery(GetUserDocument, {
        variables: {id}
    })
    return data.getUser
}