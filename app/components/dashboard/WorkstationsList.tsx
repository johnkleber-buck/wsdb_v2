"use client";

import { useState, useEffect } from "react";
import { Workstation, WorkstationFilters } from "@/app/types";
import { workstationService } from "@/app/services/workstation-service";
import { Button } from "@/app/components/ui/button";
import { Computer, Settings, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";

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
  const [appliedFilters, setAppliedFilters] = useState<WorkstationFilters>(filters);

  // Function to load workstations data
  const loadWorkstations = async () => {
    setLoading(true);
    try {
      const result = await workstationService.getWorkstations(page, 10, appliedFilters);
      setWorkstations(result.data);
      setTotalPages(Math.ceil(result.total / result.pageSize));
      setError(null);
    } catch (err) {
      setError("Failed to load workstations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load data when page or filters change
  useEffect(() => {
    loadWorkstations();
  }, [page, appliedFilters]);

  // Update filters when prop changes
  useEffect(() => {
    setAppliedFilters(filters);
  }, [filters]);

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = () => {
      switch (status) {
        case "Available":
          return "bg-green-500 text-white";
        case "Assigned":
          return "bg-blue-500 text-white";
        case "Maintenance":
          return "bg-yellow-500 text-white";
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
        <h2 className="text-lg font-semibold">Workstations</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadWorkstations()}
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
                  <TableHead>Machine Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workstations.length > 0 ? (
                  workstations.map((workstation) => (
                    <TableRow
                      key={workstation.machineName}
                      className={`cursor-pointer ${selectedWorkstation?.machineName === workstation.machineName ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                      onClick={() => onSelectWorkstation(workstation)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Computer size={16} />
                          {workstation.machineName}
                        </div>
                      </TableCell>
                      <TableCell>{workstation.type}</TableCell>
                      <TableCell>{workstation.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={workstation.status} />
                      </TableCell>
                      <TableCell>
                        {workstation.assignedTo?.username || "-"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Implement details action
                          }}
                        >
                          <Settings size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No workstations found
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
