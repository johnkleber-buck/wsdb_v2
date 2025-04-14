"use client";

import { useState, useEffect } from "react";
import { User, UserFilters } from "@/app/types";
import { userService } from "@/app/services/user-service";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import {
  User as UserIcon,
  Users,
  AlertCircle,
  Search,
  Filter,
  RefreshCcw,
  Building2,
  Briefcase,
  MapPin
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

// Import mock data
import { mockUsers } from "@/app/mock/data";

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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState<UserFilters>(filters);

  // Function to load users data
  const loadUsers = async () => {
    setLoading(true);
    try {
      // In a real app, this would call the API
      // const result = await userService.getUsers(page, 10, appliedFilters);
      
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        // Filter mock data based on search term
        let filteredUsers = [...mockUsers];
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredUsers = filteredUsers.filter(
            user => 
              user.username.toLowerCase().includes(term) ||
              user.department.toLowerCase().includes(term) ||
              user.role.toLowerCase().includes(term) ||
              user.location.toLowerCase().includes(term) ||
              (user.projectAssignment?.toLowerCase().includes(term) ?? false)
          );
        }
        
        // Apply other filters
        if (appliedFilters.department) {
          filteredUsers = filteredUsers.filter(
            user => user.department === appliedFilters.department
          );
        }
        
        if (appliedFilters.location) {
          filteredUsers = filteredUsers.filter(
            user => user.location === appliedFilters.location
          );
        }
        
        if (appliedFilters.role) {
          filteredUsers = filteredUsers.filter(
            user => user.role === appliedFilters.role
          );
        }
        
        if (appliedFilters.status) {
          filteredUsers = filteredUsers.filter(
            user => user.status === appliedFilters.status
          );
        }
        
        // Pagination
        const pageSize = 5;
        const startIndex = (page - 1) * pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
        
        setUsers(paginatedUsers);
        setTotalPages(Math.ceil(filteredUsers.length / pageSize));
        setError(null);
        setLoading(false);
      }, 500); // Simulate API delay
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
      setLoading(false);
    }
  };

  // Load data when page, search term, or filters change
  useEffect(() => {
    loadUsers();
  }, [page, searchTerm, appliedFilters]);

  // Update filters when prop changes
  useEffect(() => {
    setAppliedFilters(filters);
  }, [filters]);

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "success";
      case "inactive":
        return "secondary";
      case "on-project":
        return "info";
      default:
        return "secondary";
    }
  };

  // Get security clearance badge
  const getClearanceBadge = (clearance: string) => {
    switch (clearance) {
      case "Top Secret":
        return <Badge variant="destructive">{clearance}</Badge>;
      case "Secret":
        return <Badge variant="warning">{clearance}</Badge>;
      case "Confidential":
        return <Badge variant="secondary">{clearance}</Badge>;
      default:
        return <Badge variant="outline">{clearance}</Badge>;
    }
  };

  return (
    <div className="rounded-lg border shadow-sm bg-white dark:bg-slate-900">
      <div className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between bg-slate-50 dark:bg-slate-800 border-b">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Browse and select users for workstation assignment</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="h-10 rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => loadUsers()}
            disabled={loading}
          >
            <RefreshCcw size={16} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="p-2 border-b bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap items-center gap-2 text-sm">
        <div className="flex items-center gap-1 text-slate-500">
          <Filter size={16} />
          <span>Filters:</span>
        </div>
        
        <select 
          className="h-9 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
          value={appliedFilters.department || ""}
          onChange={(e) => setAppliedFilters({...appliedFilters, department: e.target.value || undefined})}
        >
          <option value="">All Departments</option>
          <option value="VFX">VFX</option>
          <option value="Animation">Animation</option>
          <option value="Compositing">Compositing</option>
          <option value="Production">Production</option>
          <option value="IT">IT</option>
          <option value="Executive">Executive</option>
        </select>
        
        <select 
          className="h-9 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
          value={appliedFilters.location || ""}
          onChange={(e) => setAppliedFilters({...appliedFilters, location: e.target.value || undefined})}
        >
          <option value="">All Locations</option>
          <option value="NY">New York</option>
          <option value="LA">Los Angeles</option>
          <option value="London">London</option>
        </select>
        
        <select 
          className="h-9 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
          value={appliedFilters.status || ""}
          onChange={(e) => setAppliedFilters({...appliedFilters, status: e.target.value || undefined})}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="On-Project">On Project</option>
        </select>
        
        {Object.keys(appliedFilters).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500"
            onClick={() => setAppliedFilters({})}
          >
            Clear All
          </Button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-800 flex items-center gap-2 border-b">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 flex justify-center items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
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
                  <TableHead>Clearance</TableHead>
                  <TableHead>Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow
                      key={user.username}
                      className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedUser?.username === user.username ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                      onClick={() => onSelectUser(user)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 dark:bg-blue-800 p-1.5 rounded-full">
                            <UserIcon size={16} className="text-blue-600 dark:text-blue-200" />
                          </div>
                          {user.username}
                        </div>
                      </TableCell>
                      <TableCell className="flex items-center gap-1.5">
                        <Building2 size={16} className="text-slate-400" />
                        {user.department}
                      </TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell className="flex items-center gap-1.5">
                        <MapPin size={16} className="text-slate-400" />
                        {user.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {getClearanceBadge(user.securityClearance)}
                      </TableCell>
                      <TableCell>
                        {user.projectAssignment ? (
                          <div className="flex items-center gap-1.5">
                            <Briefcase size={16} className="text-slate-400" />
                            {user.projectAssignment}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between border-t">
            <div className="text-sm text-slate-500">
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