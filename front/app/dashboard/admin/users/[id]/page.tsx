"use client";
import UpdateForm from "@/components/user/update";
import { User, UserWithAllData } from "@/generated/graphql";
import { useAdminUser } from "@/hooks/admin/users";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

export default function Page() {
    const  { id }  = useParams()
     const id2 = id as string
     const {data, loading }= useAdminUser(id2) 

 console.log("User ID from params:", id2);
console.log("Fetched user:", id);
 if (loading) return null;
  console.log("User in modal:", data?.getUser!);
    return <>  
    <UpdateForm user={data?.getUser! as UserWithAllData} />
     </>;
}
