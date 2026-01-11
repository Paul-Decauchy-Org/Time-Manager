"use client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Role, User } from "@/generated/graphql";
import {useAdminUsers} from "@/hooks/admin/users";

async function getData(): Promise<User[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      phone: "100",
      firstName: "test",
      email: "m@example.com",
      lastName: "test",
      password: "",
      role: Role.Admin,
    },
    {
      id: "728ed52f332",
      phone: "10022",
      firstName: "test2",
      email: "m2@example.com",
      lastName: "test2",
      password: "",
      role: Role.Admin,
    },
    {
      id: "728ed52f332",
      phone: "10022",
      firstName: "test2",
      email: "m2@example.com",
      lastName: "test2",
      password: "",
      role: Role.User,
    },
      {
          id: "1",
          phone: "10022",
          firstName: "test2",
          email: "m2@example.com",
          lastName: "test2",
          password: "",
          role: Role.User,
      },
  ];
}

export default function AdminUsers() {
  const users = useAdminUsers()
  // const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={users} />
    </div>
  );
}
