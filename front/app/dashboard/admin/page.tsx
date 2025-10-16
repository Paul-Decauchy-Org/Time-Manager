import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Role, User } from "@/generated/graphql";

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
    // ...
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
