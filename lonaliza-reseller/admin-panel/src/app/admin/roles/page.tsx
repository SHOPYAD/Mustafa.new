import { Roles } from "@/app/admin/dashboard/roles/_components/roles";
import { roles } from "@/app/admin/dashboard/roles/_components/roles-table/data";

export default function RolesRoute() {
  return <Roles roles={roles} />;
}
