import { useRouter } from "next/router";
import {UserModal} from "./user-modal";
import { useAdminUser } from "@/hooks/admin/users";
import { UserWithAllData } from "@/generated/graphql";

export default async function Modal() {
 const id = useRouter().query.id as string
 const user = useAdminUser({id}) as UserWithAllData
  return (
      <>
          <UserModal
          user={user}
          />
      </>
  )
}
