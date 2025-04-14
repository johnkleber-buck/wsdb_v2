"use client";

import { useState, useEffect } from "react";
import { Workstation, WorkstationFilters } from "@/app/types";
import { workstationService } from "@/app/services/workstation-service";
import { buckApiService } from "@/app/services/buck-api-service";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useToast } from "@/app/hooks/use-toast";
import { FEATURES } from "@/app/lib/utils";
import {
  Computer,
  Server,
  Laptop,
  Settings,
  AlertCircle,
  Search,
  Filter,
  Clock,
  RefreshCcw,
  Link2,
  Link2Off,
  Info,
  Edit,
  Trash,
  PowerOff,
  Power,
  Lock,
  Unlock,
  MoreHorizontal,
  Check,
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
import { mockWorkstations } from "@/app/mock/data";

interface WorkstationsListProps {
  onSelectWorkstation: (workstation: Workstation) => void;
  selectedWorkstation?: Workstation | null;
  filters?: WorkstationFilters;
}

export function WorkstationsList({
  onSelectWorkstation,
  selectedWorkstation,
  filters = {},
}: WorkstationsListProps) {
  const { toast } = useToast();
  const [workstations, setWorkstations] = useState<Workstation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [appliedFilters, setAppliedFilters] = useState<WorkstationFilters>(filters);

  // Function to load workstations data
  const loadWorkstations = async () => {
    setLoading(true);
    const pageSize = 5;
    
    try {
      let workstationsData: Workstation[] = [];
      const useApi = FEATURES.USE_BUCK_API;
      
      if (useApi) {
        // Use BUCK API service
        console.log('Using BUCK API for workstations data');
        const result = await buckApiService.getWorkstations(
          appliedFilters, 
          page, 
          pageSize
        );
        
        workstationsData = result.data;
        setTotalPages(Math.ceil(result.total / pageSize));
        
        // If we have a selected workstation, refresh it from the API
        if (selectedWorkstation) {
          const updatedWorkstation = await buckApiService.getWorkstationByName(
            selectedWorkstation.machineName
          );
          
          if (updatedWorkstation) {
            onSelectWorkstation(updatedWorkstation);
          }
        }
      } else {
        // Use mock data
        console.log('Using mock data for workstations');
        
        // Filter mock data based on search term
        let filteredWorkstations = [...mockWorkstations];
        
        // If we have a selected workstation, make sure it's up to date with the mock data
        if (selectedWorkstation) {
          const updatedWorkstation = mockWorkstations.find(
            ws => ws.machineName === selectedWorkstation.machineName
          );
          if (updatedWorkstation) {
            onSelectWorkstation(updatedWorkstation);
          }
        }
        
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredWorkstations = filteredWorkstations.filter(
            ws => 
              ws.machineName.toLowerCase().includes(term) ||
              ws.type.toLowerCase().includes(term) ||
              ws.location.toLowerCase().includes(term) ||
              ws.tier.toLowerCase().includes(term) ||
              (ws.assignedTo?.username.toLowerCase().includes(term) ?? false)
          );
        }
        
        // Apply other filters
        if (appliedFilters.status) {
          filteredWorkstations = filteredWorkstations.filter(
            ws => ws.status === appliedFilters.status
          );
        }
        
        if (appliedFilters.location) {
          filteredWorkstations = filteredWorkstations.filter(
            ws => ws.location === appliedFilters.location
          );
        }
        
        if (appliedFilters.type) {
          filteredWorkstations = filteredWorkstations.filter(
            ws => ws.type === appliedFilters.type
          );
        }
        
        if (appliedFilters.tier) {
          filteredWorkstations = filteredWorkstations.filter(
            ws => ws.tier === appliedFilters.tier
          );
        }
        
        // Pagination
        const startIndex = (page - 1) * pageSize;
        workstationsData = filteredWorkstations.slice(startIndex, startIndex + pageSize);
        setTotalPages(Math.ceil(filteredWorkstations.length / pageSize));
      }
      
      setWorkstations(workstationsData);
      setError(null);
      
      // Show toast notification when data is refreshed
      toast({
        title: "Workstations Updated",
        description: `Using ${useApi ? 'BUCK API' : 'mock'} data`,
        variant: "info",
      });
    } catch (err) {
      console.error('Error loading workstations:', err);
      setError("Failed to load workstations");
      
      // Fallback to mock data if API fails
      if (FEATURES.USE_BUCK_API) {
        try {
          console.log('Falling back to mock data after API error');
          
          // Filter and paginate mock data
          const filteredWorkstations = mockWorkstations
            .filter(ws => {
              if (searchTerm) {
                const term = searchTerm.toLowerCase();
                if (!ws.machineName.toLowerCase().includes(term) &&
                    !ws.type.toLowerCase().includes(term) &&
                    !ws.location.toLowerCase().includes(term) &&
                    !ws.tier.toLowerCase().includes(term) &&
                    !(ws.assignedTo?.username.toLowerCase().includes(term) ?? false)) {
                  return false;
                }
              }
              
              if (appliedFilters.status && ws.status !== appliedFilters.status) return false;
              if (appliedFilters.location && ws.location !== appliedFilters.location) return false;
              if (appliedFilters.type && ws.type !== appliedFilters.type) return false;
              if (appliedFilters.tier && ws.tier !== appliedFilters.tier) return false;
              
              return true;
            });
          
          const startIndex = (page - 1) * pageSize;
          const paginatedWorkstations = filteredWorkstations.slice(startIndex, startIndex + pageSize);
          
          setWorkstations(paginatedWorkstations);
          setTotalPages(Math.ceil(filteredWorkstations.length / pageSize));
          setError("API error - using mock data");
          
          toast({
            title: "API Error",
            description: "Using mock data as fallback",
            variant: "warning",
          });
        } catch (fallbackErr) {
          console.error('Error using mock data fallback:', fallbackErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data when page, search term, or filters change
  useEffect(() => {
    loadWorkstations();
  }, [page, searchTerm, appliedFilters]);

  // Update filters when prop changes
  useEffect(() => {
    setAppliedFilters(filters);
  }, [filters]);

  // Get machine icon based on type
  const getMachineIcon = (type: string) => {
    switch (type) {
      case "Desktop":
        return <Computer size={18} className="text-blue-500" />;
      case "Laptop":
        return <Laptop size={18} className="text-purple-500" />;
      case "VM":
        return <Server size={18} className="text-orange-500" />;
      default:
        return <Computer size={18} />;
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Available":
        return "success";
      case "Assigned":
        return "info";
      case "Maintenance":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Get parsec connection badge
  const getParsecBadge = (status: string | undefined) => {
    if (!status) return null;
    
    return status === "Connected" ? (
      <Badge variant="success" className="flex items-center gap-1">
        <Link2 size={12} /> Connected
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Link2Off size={12} /> Disconnected
      </Badge>
    );
  };

  // Format date to relative time
  const formatRelativeTime = (date: Date | undefined) => {
    if (!date) return "N/A";
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMins}m ago`;
    }
  };

  return (
    <div className="rounded-lg border shadow-sm bg-white dark:bg-slate-900">
      <div className="p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between bg-slate-50 dark:bg-slate-800 border-b">
        <div>
          <h2 className="text-xl font-semibold">Workstations</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and assign workstations to users</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search workstations..."
              className="h-10 rounded-md border border-slate-300 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => loadWorkstations()}
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
            label="Location"
            options={[
              { value: "", label: "All Locations" },
              { value: "NY", label: "New York" },
              { value: "LA", label: "Los Angeles" },
              { value: "London", label: "London" }
            ]}
            value={appliedFilters.location || ""}
            onChange={(value) => setAppliedFilters({...appliedFilters, location: value || undefined})}
            placeholder="All Locations"
            className="w-44"
          />
          
          <FilterDropdown
            label="Type"
            options={[
              { value: "", label: "All Types" },
              { value: "Desktop", label: "Desktop" },
              { value: "Laptop", label: "Laptop" },
              { value: "VM", label: "VM" }
            ]}
            value={appliedFilters.type || ""}
            onChange={(value) => setAppliedFilters({...appliedFilters, type: value || undefined})}
            placeholder="All Types"
            className="w-40"
          />
          
          <FilterDropdown
            label="Status"
            options={[
              { value: "", label: "All Status" },
              { value: "Available", label: "Available" },
              { value: "Assigned", label: "Assigned" },
              { value: "Maintenance", label: "Maintenance" }
            ]}
            value={appliedFilters.status || ""}
            onChange={(value) => setAppliedFilters({...appliedFilters, status: value || undefined})}
            placeholder="All Status"
            className="w-40"
          />
          
          <FilterDropdown
            label="Tier"
            options={[
              { value: "", label: "All Tiers" },
              { value: "high-end", label: "High-End" },
              { value: "mid-range", label: "Mid-Range" },
              { value: "standard", label: "Standard" }
            ]}
            value={appliedFilters.tier || ""}
            onChange={(value) => setAppliedFilters({...appliedFilters, tier: value || undefined})}
            placeholder="All Tiers"
            className="w-40"
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
                description: "All filters have been reset",
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
                  <TableHead>Machine Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workstations.length > 0 ? (
                  workstations.map((workstation) => (
                    <TableRow
                      key={workstation.machineName}
                      className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedWorkstation?.machineName === workstation.machineName ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                      onClick={() => {
                        onSelectWorkstation(workstation);
                        toast({
                          title: "Workstation Selected",
                          description: `${workstation.machineName} (${workstation.status})`,
                          variant: workstation.status === "Available" ? "success" : 
                                   workstation.status === "Assigned" ? "info" : "warning",
                        });
                      }}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getMachineIcon(workstation.type)}
                          {workstation.machineName}
                        </div>
                      </TableCell>
                      <TableCell>{workstation.type}</TableCell>
                      <TableCell>{workstation.location}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">{workstation.tier}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(workstation.status)}>{workstation.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {getParsecBadge(workstation.parsecConnectionStatus)}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs flex items-center gap-1">
                        <Clock size={14} />
                        {formatRelativeTime(workstation.lastSeen)}
                      </TableCell>
                      <TableCell>
                        {workstation.assignedTo?.username || "-"}
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
                                  title: "View Details",
                                  description: `Viewing details for ${workstation.machineName}`,
                                  variant: "info",
                                });
                              }}
                              className="flex items-center gap-2"
                            >
                              <Info className="h-4 w-4" />
                              <span>View Details</span>
                            </QuickActionsItem>
                            
                            {workstation.status === "Available" && (
                              <QuickActionsItem 
                                onClick={() => {
                                  toast({
                                    title: "Mark as Maintenance",
                                    description: `${workstation.machineName} marked for maintenance`,
                                    variant: "warning",
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                <Settings className="h-4 w-4" />
                                <span>Mark as Maintenance</span>
                              </QuickActionsItem>
                            )}
                            
                            {workstation.status === "Maintenance" && (
                              <QuickActionsItem 
                                onClick={() => {
                                  toast({
                                    title: "Mark as Available",
                                    description: `${workstation.machineName} marked as available`,
                                    variant: "success",
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                <Check className="h-4 w-4" />
                                <span>Mark as Available</span>
                              </QuickActionsItem>
                            )}
                            
                            {workstation.status === "Assigned" && (
                              <QuickActionsItem 
                                onClick={() => {
                                  toast({
                                    title: "Unassign Workstation",
                                    description: `${workstation.machineName} unassigned from user`,
                                    variant: "warning",
                                  });
                                }}
                                className="flex items-center gap-2 text-red-500"
                              >
                                <Unlock className="h-4 w-4" />
                                <span>Unassign</span>
                              </QuickActionsItem>
                            )}
                            
                            <QuickActionsSeparator />
                            
                            {workstation.parsecConnectionStatus === "Connected" ? (
                              <QuickActionsItem 
                                onClick={() => {
                                  toast({
                                    title: "Disconnect Parsec",
                                    description: `Disconnected Parsec for ${workstation.machineName}`,
                                    variant: "info",
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                <Link2Off className="h-4 w-4" />
                                <span>Disconnect Parsec</span>
                              </QuickActionsItem>
                            ) : (
                              <QuickActionsItem 
                                onClick={() => {
                                  toast({
                                    title: "Connect Parsec",
                                    description: `Connected Parsec for ${workstation.machineName}`,
                                    variant: "success",
                                  });
                                }}
                                className="flex items-center gap-2"
                              >
                                <Link2 className="h-4 w-4" />
                                <span>Connect Parsec</span>
                              </QuickActionsItem>
                            )}
                            
                            <QuickActionsItem 
                              onClick={() => {
                                toast({
                                  title: "Power Toggle",
                                  description: `${workstation.machineName} power toggled`,
                                  variant: "warning",
                                });
                              }}
                              className="flex items-center gap-2"
                            >
                              <PowerOff className="h-4 w-4" />
                              <span>Power Toggle</span>
                            </QuickActionsItem>
                          </QuickActionsContent>
                        </QuickActions>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No workstations found
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