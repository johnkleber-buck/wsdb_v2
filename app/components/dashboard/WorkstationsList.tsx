"use client";

import { useState, useEffect } from "react";
import { Workstation, WorkstationFilters } from "@/app/types";
import { workstationService } from "@/app/services/workstation-service";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
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
    try {
      // In a real app, this would call the API
      // const result = await workstationService.getWorkstations(page, 10, appliedFilters);
      
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        // Filter mock data based on search term
        let filteredWorkstations = [...mockWorkstations];
        
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
        const pageSize = 5;
        const startIndex = (page - 1) * pageSize;
        const paginatedWorkstations = filteredWorkstations.slice(startIndex, startIndex + pageSize);
        
        setWorkstations(paginatedWorkstations);
        setTotalPages(Math.ceil(filteredWorkstations.length / pageSize));
        setError(null);
        setLoading(false);
      }, 500); // Simulate API delay
    } catch (err) {
      setError("Failed to load workstations");
      console.error(err);
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
      <div className="p-2 border-b bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap items-center gap-2 text-sm">
        <div className="flex items-center gap-1 text-slate-500">
          <Filter size={16} />
          <span>Filters:</span>
        </div>
        
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
          value={appliedFilters.type || ""}
          onChange={(e) => setAppliedFilters({...appliedFilters, type: e.target.value || undefined})}
        >
          <option value="">All Types</option>
          <option value="Desktop">Desktop</option>
          <option value="Laptop">Laptop</option>
          <option value="VM">VM</option>
        </select>
        
        <select 
          className="h-9 rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
          value={appliedFilters.status || ""}
          onChange={(e) => setAppliedFilters({...appliedFilters, status: e.target.value || undefined})}
        >
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">Maintenance</option>
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
                  <TableHead>Machine Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connection</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workstations.length > 0 ? (
                  workstations.map((workstation) => (
                    <TableRow
                      key={workstation.machineName}
                      className={`cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedWorkstation?.machineName === workstation.machineName ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-blue-500 dark:ring-blue-400' : ''}`}
                      onClick={() => onSelectWorkstation(workstation)}
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
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