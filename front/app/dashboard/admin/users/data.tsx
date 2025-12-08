import { columns } from "./columns";
import { DataTable } from "./data-table";
import {useAdminUsers} from "@/hooks/admin/users";

export default function UsersData() {
  const data = useAdminUsers();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}