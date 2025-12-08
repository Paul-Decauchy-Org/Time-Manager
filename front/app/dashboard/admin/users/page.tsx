"use client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Role, User } from "@/generated/graphql";
import {useAdminUsers} from "@/hooks/admin/users";

export default function AdminUsers() {
  const data = useAdminUsers();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
