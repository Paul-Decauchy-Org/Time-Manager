"use client";
import { useRouter } from "next/router";
import {UserModal} from "./user-modal";
import { useAdminUser } from "@/hooks/admin/users";
import { UserWithAllData } from "@/generated/graphql";
import { useParams } from "next/navigation";

export default function Modal() {
 const  { id }  = useParams()
 const id2 = id as string
 const user = useAdminUser({id: id2}) as UserWithAllData
  return (
      <>
          <UserModal
          user={user}
          />
      </>
  )
}
