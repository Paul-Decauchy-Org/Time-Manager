import UpdateForm from "@/components/user/update";
import { User, UserWithAllData } from "@/generated/graphql";
import { useAdminUser } from "@/hooks/admin/users";
import { useRouter } from "next/router";
import { use } from "react";

export default function Page() {
    const id = useRouter().query.id as string

    const user = useAdminUser({id}) as UserWithAllData
    return <>  
    <UpdateForm user={user} />
     </>;
}
