"use client";
import { useRouter } from "next/router";
import {UserModal} from "./user-modal";
import { useAdminUser } from "@/hooks/admin/users";
import { UserWithAllData } from "@/generated/graphql";
import { useParams } from "next/navigation";
import { da } from "zod/v4/locales";

export default function Modal() {
 const  { id }  = useParams()
 const id2 = id as string
 const {data, loading }= useAdminUser(id2) 

 console.log("User ID from params:", id2);
console.log("Fetched user:", id);
 if (loading) return null;
  console.log("User in modal:", data?.getUser!);
  return (
      <>
          <UserModal
          user={data?.getUser! as UserWithAllData}
          />
      </>
  )
}
