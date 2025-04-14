"use client";

import { useState, useEffect } from "react";
import { User, UserFilters } from "@/app/types";
import { userService } from "@/app/services/user-service";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useToast } from "@/app/hooks/use-toast";
import { isFeatureEnabled, FEATURES } from "@/app/lib/utils";
import { filterOptions } from "@/app/lib/filter-options";
import {
  User as UserIcon,
  Users,
  AlertCircle,
  Search,
  Filter,
  RefreshCcw,
  Building2,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Shield,
  UserPlus,
  UserMinus,
  Edit,
  MoreHorizontal,
  Info,
  X
} from "lucide-react";
import { FilterDropdown } from "@/app/components/ui/filter-dropdown";
import {
  QuickActions,
  QuickActionsContent,
  QuickActionsItem,
  QuickActionsSeparator,
  QuickActionsTrigger,
} from "@/app/components/ui/quick-actions";
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
  const { toast } = useToast();
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
    
    // Log for debugging
    console.log('UsersList: Loading users');
    console.log('UsersList: Raw mock data available:', mockUsers.length > 0);
    console.log('UsersList: First mock user:', mockUsers.length > 0 ? mockUsers[0] : 'No mock users');
    
    try {
      // Determine data source
      const useOkta = isFeatureEnabled('USE_OKTA_DATA');
      console.log('UsersList: Using Okta:', useOkta);
      
      let usersData: User[] = [];
      
      if (useOkta) {
        // Use Okta data
        try {
          const result = await userService.getUsers(page, 5, appliedFilters, true);
          usersData = result.data;
          console.log('UsersList: Okta data loaded:', usersData.length);
        } catch (oktaError) {
          console.error('Error loading Okta data:', oktaError);
          toast({
            title: "Okta Data Failed",
            description: "Failed to load from Okta API, using mock data instead",
            variant: "destructive",
          });
          // Fall back to mock data on Okta error
          usersData = [...mockUsers];
        }
      } else {
        // Use mock data directly
        usersData = [...mockUsers];
        console.log('UsersList: Using mock data directly');
      }
      
      // Apply search filter if present
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        usersData = usersData.filter(
          user => 
            user.username.toLowerCase().includes(term) ||
            user.department.toLowerCase().includes(term) ||
            user.role.toLowerCase().includes(term) ||
            user.location.toLowerCase().includes(term) ||
            (user.projectAssignment?.toLowerCase().includes(term) ?? false)
        );
      }
      
      // Apply filters
      if (appliedFilters.department) {
        usersData = usersData.filter(
          user => user.department === appliedFilters.department
        );
      }
      
      if (appliedFilters.location) {
        usersData = usersData.filter(
          user => user.location === appliedFilters.location
        );
      }
      
      if (appliedFilters.role) {
        usersData = usersData.filter(
          user => user.role === appliedFilters.role
        );
      }
      
      if (appliedFilters.status) {
        usersData = usersData.filter(
          user => user.status === appliedFilters.status
        );
      }
      
      // Paginate
      const pageSize = 5;
      const startIndex = (page - 1) * pageSize;
      const paginatedUsers = usersData.slice(startIndex, startIndex + pageSize);
      
      console.log(`UsersList: Final data set size: ${usersData.length}, paginated: ${paginatedUsers.length}`);
      
      // Update state
      setUsers(paginatedUsers);
      setTotalPages(Math.ceil(usersData.length / pageSize));
      setError(null);
      
      // Show toast notification
      toast({
        title: useOkta ? "Okta Users Loaded" : "Mock Users Loaded",
        description: `Loaded ${paginatedUsers.length} users (page ${page} of ${Math.ceil(usersData.length / pageSize)})`,
        variant: "info",
      });
    } catch (err) {
      console.error('Failed to load any user data:', err);
      setError("Failed to load users");
      setUsers([]);
      
      toast({
        title: "Error",
        description: "Failed to load any user data",
        variant: "destructive",
      });
    } finally {
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
      <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap items-center gap-3 text-sm">
        <div className="flex items-center gap-1.5 text-slate-500 mr-1">
          <Filter size={16} className="text-slate-400" />
          <span className="font-medium">Filters</span>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center flex-1">
          <FilterDropdown
            label="Department"
            options={filterOptions.departments}
            value={appliedFilters.department || ""}
            onChange={(value) => setAppliedFilters({...appliedFilters, department: value || undefined})}
            placeholder="All Departments"
            className="w-44"
          />
          
          <FilterDropdown
            label="Location"
            options={filterOptions.locations}
            value={appliedFilters.location || ""}
            onChange={(value) => setAppliedFilters({...appliedFilters, location: value || undefined})}
            placeholder="All Locations"
            className="w-44"
          />
          
          <FilterDropdown
            label="Status"
            options={filterOptions.statuses}
            value={appliedFilters.status || ""}
            onChange={(value) => setAppliedFilters({...appliedFilters, status: value || undefined})}
            placeholder="All Status"
            className="w-40"
          />
          
          <FilterDropdown
            label="Role"
            options={filterOptions.roles}
            value={appliedFilters.role || ""}
            onChange={(value) => setAppliedFilters({...appliedFilters, role: value || undefined})}
            placeholder="All Roles"
            className="w-44"
          />
        </div>
        
        {Object.keys(appliedFilters).some(k => appliedFilters[k as keyof typeof appliedFilters]) && (
          <Button
            variant="outline"
            size="sm"
            className="text-slate-500 ml-auto"
            onClick={() => {
              setAppliedFilters({});
              toast({
                title: "Filters Cleared",
                description: "All user filters have been reset",
                variant: "info",
              });
            }}
          >
            <X className="h-4 w-4 mr-1.5" />
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
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <TableRow
                      key={user.username}
                      className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedUser?.username === user.username ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                      onClick={() => {
                        onSelectUser(user);
                        toast({
                          title: "User Selected",
                          description: `${user.username} (${user.department})`,
                          variant: user.status.toLowerCase() === "active" ? "success" : 
                                   user.status.toLowerCase() === "on-project" ? "info" : "default",
                        });
                      }}
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
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <QuickActions>
                          <QuickActionsTrigger>
                            <MoreHorizontal className="h-4 w-4" />
                          </QuickActionsTrigger>
                          <QuickActionsContent align="end">
                            <QuickActionsItem 
                              onClick={() => {
                                toast({
                                  title: "View User Details",
                                  description: `Viewing details for ${user.username}`,
                                  variant: "info",
                                });
                              }}
                              className="flex items-center gap-2"
                            >
                              <Info className="h-4 w-4" />
                              <span>View Details</span>
                            </QuickActionsItem>
                            
                            <QuickActionsItem 
                              onClick={() => {
                                toast({
                                  title: "Edit User",
                                  description: `Editing user ${user.username}`,
                                  variant: "info",
                                });
                              }}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              <span>Edit User</span>
                            </QuickActionsItem>
                            
                            <QuickActionsItem 
                              onClick={() => {
                                toast({
                                  title: "Contact User",
                                  description: `Contact info for ${user.username}`,
                                  variant: "info",
                                });
                              }}
                              className="flex items-center gap-2"
                            >
                              <Mail className="h-4 w-4" />
                              <span>Contact User</span>
                            </QuickActionsItem>
                            
                            <QuickActionsSeparator />
                            
                            {user.status.toLowerCase() === "active" ? (
                              <QuickActionsItem 
                                onClick={() => {
                                  toast({
                                    title: "Assign to Project",
                                    description: `${user.username} is now ready to be assigned to a project`,
                                    variant: "success",
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                <Briefcase className="h-4 w-4" />
                                <span>Assign to Project</span>
                              </QuickActionsItem>
                            ) : (
                              <QuickActionsItem 
                                onClick={() => {
                                  toast({
                                    title: "Mark as Active",
                                    description: `${user.username} status changed to Active`,
                                    variant: "success",
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                <UserPlus className="h-4 w-4" />
                                <span>Mark as Active</span>
                              </QuickActionsItem>
                            )}
                            
                            <QuickActionsItem 
                              onClick={() => {
                                toast({
                                  title: "Update Security Clearance",
                                  description: `Security clearance for ${user.username} updated`,
                                  variant: "warning",
                                });
                              }}
                              className="flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4" />
                              <span>Update Clearance</span>
                            </QuickActionsItem>
                          </QuickActionsContent>
                        </QuickActions>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
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
              Page {page} of {totalPages > 0 ? totalPages : 1}
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