"use client";

import { Users } from "lucide-react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useAdminUsers } from "@/hooks/admin/users";
import UsersData from "./data";

export default function AdminUsers() {
  return (
    <>
      <UsersData />
    </>
  );
}
