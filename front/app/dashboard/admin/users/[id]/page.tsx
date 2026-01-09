"use client";
import UpdateForm from "@/components/user/update";
import { User, UserWithAllData } from "@/generated/graphql";
import { useAdminUser } from "@/hooks/admin/users";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

export default function Page() {
    const  { id }  = useParams()
     const id2 = id as string
     const user = useAdminUser({id: id2}) as UserWithAllData
    return <>  
    <UpdateForm user={user} />
     </>;
}
