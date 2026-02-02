import { UserManagementTable } from "@/features/admin/components/user-management-table";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage users, monitor statuses, and moderate the platform.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-muted rounded-full">
            <Users className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </div>

      <UserManagementTable />
    </div>
  );
}
