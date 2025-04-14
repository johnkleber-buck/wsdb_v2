"use client";

import { useState, useEffect } from "react";
import { User, UserFilters } from "@/app/types";
import { userService } from "@/app/services/user-service";
import { Button } from "@/app/components/ui/button";
import { User as UserIcon, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

interface UsersListProps {
  onSelectUser: (user: User) => void;
  selectedUser?: User | null;
  filters?: UserFilters;
}

export function UsersList({
  onSelectUser,
  selectedUser,
  filters = {},
}: UsersListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>(filters);

  // Function to load users data
  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await userService.getUsers(page, 10, appliedFilters);
      setUsers(result.data);
      setTotalPages(Math.ceil(result.total / result.pageSize));
      setError(null);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when page or filters change
  useEffect(() => {
    loadUsers();
  }, [page, appliedFilters]);

  // Update filters when prop changes
  useEffect(() => {
    setAppliedFilters(filters);
  }, [filters]);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = () => {
      switch (status.toLowerCase()) {
        case "active":
          return "bg-green-500 text-white";
        case "inactive":
          return "bg-gray-500 text-white";
        case "on-project":
          return "bg-blue-500 text-white";
        default:
          return "bg-gray-300 text-gray-800";
      }
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="rounded-md border">
      <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800 border-b">
        <h2 className="text-lg font-semibold">Users</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadUsers()}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 flex items-center gap-2 border-b">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      ) : (
        <>
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow
                      key={user.username}
                      className={`cursor-pointer ${selectedUser?.username === user.username ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                      onClick={() => onSelectUser(user)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <UserIcon size={16} />
                          {user.username}
                        </div>
                      </TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>{user.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={user.status} />
                      </TableCell>
                      <TableCell>
                        {user.projectAssignment || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
