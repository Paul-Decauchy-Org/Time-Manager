import { GetUserDocument, GetUserQuery } from "@/generated/graphql";
import { query } from "./RSC/Client";

export async function getUser(id: number) : Promise<GetUserQuery['user'] | undefined> {
    let res = await query({
       query: GetUserDocument,
       variables: { id: id.toString() },
    }) as { data?: GetUserQuery };
    return res.data?.user;
}