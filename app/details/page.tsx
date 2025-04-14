"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/app/components/ui/tabs";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/app/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { 
  ChevronLeft, 
  Search, 
  Users, 
  Computer,
  Laptop,
  Server,
  Filter,
  SortAsc,
  SortDesc,
  ArrowUpDown,
  DownloadCloud,
  Cpu,
  MemoryStick,
  Globe
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { mockUsers, mockWorkstations, mockHardwareSpecs, mockSoftware } from "@/app/mock/data";
import { User, Workstation, HardwareSpecs, Software } from "@/app/types";

export default function DetailsPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  
  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Filter and sort users
  const filteredUsers = mockUsers.filter(user => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(term) ||
      user.department.toLowerCase().includes(term) ||
      user.location.toLowerCase().includes(term) ||
      user.role.toLowerCase().includes(term) ||
      user.status.toLowerCase().includes(term) ||
      (user.projectAssignment && user.projectAssignment.toLowerCase().includes(term))
    );
  }).sort((a, b) => {
    if (!sortColumn) return 0;
    
    const factor = sortDirection === "asc" ? 1 : -1;
    
    switch (sortColumn) {
      case "username":
        return factor * a.username.localeCompare(b.username);
      case "department":
        return factor * a.department.localeCompare(b.department);
      case "role":
        return factor * a.role.localeCompare(b.role);
      case "location":
        return factor * a.location.localeCompare(b.location);
      case "status":
        return factor * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
  
  // Filter and sort workstations
  const filteredWorkstations = mockWorkstations.filter(ws => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      ws.machineName.toLowerCase().includes(term) ||
      ws.location.toLowerCase().includes(term) ||
      ws.type.toLowerCase().includes(term) ||
      ws.os.toLowerCase().includes(term) ||
      ws.tier.toLowerCase().includes(term) ||
      (ws.assignedTo?.username.toLowerCase().includes(term) || false)
    );
  }).sort((a, b) => {
    if (!sortColumn) return 0;
    
    const factor = sortDirection === "asc" ? 1 : -1;
    
    switch (sortColumn) {
      case "machineName":
        return factor * a.machineName.localeCompare(b.machineName);
      case "type":
        return factor * a.type.localeCompare(b.type);
      case "location":
        return factor * a.location.localeCompare(b.location);
      case "status":
        return factor * a.status.localeCompare(b.status);
      case "os":
        return factor * a.os.localeCompare(b.os);
      case "tier":
        return factor * a.tier.localeCompare(b.tier);
      default:
        return 0;
    }
  });
  
  // Filter and sort hardware specs
  const filteredHardwareSpecs = mockHardwareSpecs.filter(spec => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      spec.specId.toLowerCase().includes(term) ||
      spec.cpuModel.toLowerCase().includes(term) ||
      spec.gpu.toLowerCase().includes(term)
    );
  }).sort((a, b) => {
    if (!sortColumn) return 0;
    
    const factor = sortDirection === "asc" ? 1 : -1;
    
    switch (sortColumn) {
      case "specId":
        return factor * a.specId.localeCompare(b.specId);
      case "cpuModel":
        return factor * a.cpuModel.localeCompare(b.cpuModel);
      case "cpuCores":
        return factor * (a.cpuCores - b.cpuCores);
      case "ram":
        return factor * (a.ram - b.ram);
      default:
        return 0;
    }
  });
  
  // Filter and sort software
  const filteredSoftware = mockSoftware.filter(sw => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      sw.softwareName.toLowerCase().includes(term) ||
      sw.version.toLowerCase().includes(term)
    );
  }).sort((a, b) => {
    if (!sortColumn) return 0;
    
    const factor = sortDirection === "asc" ? 1 : -1;
    
    switch (sortColumn) {
      case "softwareName":
        return factor * a.softwareName.localeCompare(b.softwareName);
      case "version":
        return factor * a.version.localeCompare(b.version);
      default:
        return 0;
    }
  });
  
  // Sort indicator component
  const SortIndicator = ({ column }: { column: string }) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={14} className="ml-1 opacity-50" />;
    }
    return sortDirection === "asc" 
      ? <SortAsc size={14} className="ml-1" /> 
      : <SortDesc size={14} className="ml-1" />;
  };
  
  // Get icon based on workstation type
  const getWorkstationIcon = (type: string) => {
    switch (type) {
      case "Desktop":
        return <Computer size={16} className="text-blue-500" />;
      case "Laptop":
        return <Laptop size={16} className="text-purple-500" />;
      case "VM":
        return <Server size={16} className="text-orange-500" />;
      default:
        return <Computer size={16} />;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    const getVariant = () => {
      switch (status) {
        case "Available":
          return "success";
        case "Assigned":
          return "info";
        case "Maintenance":
          return "warning";
        case "Active":
          return "success";
        case "Inactive":
          return "secondary";
        case "On-Project":
          return "info";
        default:
          return "secondary";
      }
    };
    
    return <Badge variant={getVariant()}>{status}</Badge>;
  };
  
  return (
    <div className="container mx-auto py-8 max-w-screen-xl">
      <div className="mb-8">
        <Link 
          href="/" 
          className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-700 mb-4"
        >
          <ChevronLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mb-2">Detailed Records</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Comprehensive listing of all users, workstations, hardware specifications, and software
        </p>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search all records..."
            className="h-10 w-full rounded-md border border-slate-300 bg-transparent pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-50 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <DownloadCloud size={16} />
          Export Data
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="users" className="flex items-center gap-1.5">
            <Users size={16} />
            Users
          </TabsTrigger>
          <TabsTrigger value="workstations" className="flex items-center gap-1.5">
            <Computer size={16} />
            Workstations
          </TabsTrigger>
          <TabsTrigger value="hardware" className="flex items-center gap-1.5">
            <Cpu size={16} />
            Hardware Specs
          </TabsTrigger>
          <TabsTrigger value="software" className="flex items-center gap-1.5">
            <Globe size={16} />
            Software
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Users Directory</CardTitle>
              <CardDescription>Complete list of users in the system</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("username")}
                      >
                        <div className="flex items-center">
                          Username
                          <SortIndicator column="username" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("department")}
                      >
                        <div className="flex items-center">
                          Department
                          <SortIndicator column="department" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("role")}
                      >
                        <div className="flex items-center">
                          Role
                          <SortIndicator column="role" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("location")}
                      >
                        <div className="flex items-center">
                          Location
                          <SortIndicator column="location" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIndicator column="status" />
                        </div>
                      </TableHead>
                      <TableHead>Security Clearance</TableHead>
                      <TableHead>Project</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.username}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.department}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>{user.location}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.securityClearance}</TableCell>
                          <TableCell>{user.projectAssignment || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No users found matching search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workstations">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Workstations Inventory</CardTitle>
              <CardDescription>Complete list of workstations in the system</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("machineName")}
                      >
                        <div className="flex items-center">
                          Machine Name
                          <SortIndicator column="machineName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("type")}
                      >
                        <div className="flex items-center">
                          Type
                          <SortIndicator column="type" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("location")}
                      >
                        <div className="flex items-center">
                          Location
                          <SortIndicator column="location" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          <SortIndicator column="status" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("os")}
                      >
                        <div className="flex items-center">
                          OS
                          <SortIndicator column="os" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("tier")}
                      >
                        <div className="flex items-center">
                          Tier
                          <SortIndicator column="tier" />
                        </div>
                      </TableHead>
                      <TableHead>Hardware Specs</TableHead>
                      <TableHead>Assigned To</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWorkstations.length > 0 ? (
                      filteredWorkstations.map((workstation) => (
                        <TableRow key={workstation.machineName}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {getWorkstationIcon(workstation.type)}
                              {workstation.machineName}
                            </div>
                          </TableCell>
                          <TableCell>{workstation.type}</TableCell>
                          <TableCell>{workstation.location}</TableCell>
                          <TableCell>{getStatusBadge(workstation.status)}</TableCell>
                          <TableCell>{workstation.os}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="capitalize">{workstation.tier}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-xs flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <Cpu size={12} className="text-slate-400" />
                                {workstation.hardwareSpecs.cpuModel.split(' ').slice(-1)[0]}
                              </div>
                              <div className="flex items-center gap-1">
                                <MemoryStick size={12} className="text-slate-400" />
                                {workstation.hardwareSpecs.ram}GB
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {workstation.assignedTo?.username || "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No workstations found matching search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hardware">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Hardware Specifications</CardTitle>
              <CardDescription>Detailed hardware specifications catalog</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("specId")}
                      >
                        <div className="flex items-center">
                          Spec ID
                          <SortIndicator column="specId" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("cpuModel")}
                      >
                        <div className="flex items-center">
                          CPU Model
                          <SortIndicator column="cpuModel" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("cpuCores")}
                      >
                        <div className="flex items-center">
                          CPU Cores
                          <SortIndicator column="cpuCores" />
                        </div>
                      </TableHead>
                      <TableHead>CPU Speed</TableHead>
                      <TableHead>GPU</TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("ram")}
                      >
                        <div className="flex items-center">
                          RAM (GB)
                          <SortIndicator column="ram" />
                        </div>
                      </TableHead>
                      <TableHead>Network</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHardwareSpecs.length > 0 ? (
                      filteredHardwareSpecs.map((spec) => (
                        <TableRow key={spec.specId}>
                          <TableCell className="font-medium">{spec.specId}</TableCell>
                          <TableCell>{spec.cpuModel}</TableCell>
                          <TableCell>{spec.cpuCores}</TableCell>
                          <TableCell>{spec.cpuSpeed} GHz</TableCell>
                          <TableCell>{spec.gpu}</TableCell>
                          <TableCell>{spec.ram} GB</TableCell>
                          <TableCell>{spec.nicSpeed}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No hardware specs found matching search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="software">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Software Catalog</CardTitle>
              <CardDescription>Complete software inventory</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("softwareName")}
                      >
                        <div className="flex items-center">
                          Software Name
                          <SortIndicator column="softwareName" />
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer"
                        onClick={() => handleSort("version")}
                      >
                        <div className="flex items-center">
                          Version
                          <SortIndicator column="version" />
                        </div>
                      </TableHead>
                      <TableHead>Workstation Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSoftware.length > 0 ? (
                      filteredSoftware.map((software) => {
                        // Count how many workstations have this software installed
                        const workstationCount = mockWorkstations.filter(ws => 
                          ws.software.some(s => s.softwareName === software.softwareName)
                        ).length;
                        
                        return (
                          <TableRow key={software.softwareName}>
                            <TableCell className="font-medium">{software.softwareName}</TableCell>
                            <TableCell>{software.version}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{workstationCount}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          No software found matching search criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}