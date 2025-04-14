"use client";

import { useState } from "react";
import { Workstation, User } from "@/app/types";
import { workstationService } from "@/app/services/workstation-service";
import { Button } from "@/app/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { 
  Check, 
  X, 
  AlertTriangle, 
  Shield, 
  User as UserIcon, 
  Computer, 
  Laptop, 
  Server,
  Cpu,
  Memory,
  MonitorSmartphone,
  Link2,
  LinkOff,
  CalendarClock
} from "lucide-react";

interface AssignmentPanelProps {
  selectedWorkstation: Workstation | null;
  selectedUser: User | null;
  onAssignmentComplete: () => void;
}

export function AssignmentPanel({
  selectedWorkstation,
  selectedUser,
  onAssignmentComplete,
}: AssignmentPanelProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [policyCheck, setPolicyCheck] = useState<{
    checked: boolean;
    compliant: boolean;
    issues?: string[];
  }>({ checked: false, compliant: false });

  // Check policy compliance before assignment
  const checkPolicyCompliance = async () => {
    if (!selectedWorkstation || !selectedUser) return;

    setLoading(true);
    try {
      // In a real app, this would call the API
      // const result = await workstationService.checkPolicyCompliance(
      //   selectedWorkstation.machineName,
      //   selectedUser.username
      // );
      
      // For demo purpose, let's simulate a check with some common conditions
      setTimeout(() => {
        let compliant = true;
        const issues: string[] = [];
        
        // Check location match
        if (selectedWorkstation.location !== selectedUser.location) {
          compliant = false;
          issues.push(`Location mismatch: Workstation is in ${selectedWorkstation.location} but user is in ${selectedUser.location}`);
        }
        
        // Check security clearance for high-end machines
        if (selectedWorkstation.tier === "high-end" && selectedUser.securityClearance !== "Top Secret") {
          compliant = false;
          issues.push(`Security clearance insufficient: High-end workstations require Top Secret clearance`);
        }
        
        // Check if freelancers can use certain machines (simulating policy restrictions)
        if (selectedUser.role.includes("Freelancer") && ["high-end", "mid-tier"].includes(selectedWorkstation.tier)) {
          compliant = false;
          issues.push(`Role restriction: Freelancers cannot use ${selectedWorkstation.tier} workstations`);
        }
        
        // If a workstation is in maintenance, it should not be assigned
        if (selectedWorkstation.status === "Maintenance") {
          compliant = false;
          issues.push(`Workstation is currently in maintenance and cannot be assigned`);
        }
        
        setPolicyCheck({
          checked: true,
          compliant: compliant,
          issues: compliant ? undefined : issues,
        });
        
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error checking policy compliance:", error);
      setPolicyCheck({
        checked: true,
        compliant: false,
        issues: ["Error checking policy compliance"],
      });
      setLoading(false);
    }
  };

  // Handle the assignment of workstation to user
  const handleAssign = async () => {
    if (!selectedWorkstation || !selectedUser) return;

    setLoading(true);
    try {
      // In a real app, this would call the API
      // const success = await workstationService.assignWorkstation(
      //   selectedWorkstation.machineName,
      //   selectedUser.username
      // );
      
      // For demo purposes, simulate a successful assignment
      setTimeout(() => {
        onAssignmentComplete();
        // Reset policy check after successful assignment
        setPolicyCheck({ checked: false, compliant: false });
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error assigning workstation:", error);
      setPolicyCheck({
        checked: true,
        compliant: false,
        issues: ["Error assigning workstation"],
      });
      setLoading(false);
    }
  };

  // Reset policy check
  const resetPolicyCheck = () => {
    setPolicyCheck({ checked: false, compliant: false });
  };

  // Check if assignment is possible
  const canAssign = selectedWorkstation && selectedUser;

  // Check if workstation is already assigned to another user
  const isAlreadyAssigned =
    selectedWorkstation?.status === "Assigned" &&
    selectedWorkstation?.assignedTo?.username !== selectedUser?.username;

  // Get machine icon based on type
  const getMachineIcon = (type: string = "Desktop") => {
    switch (type) {
      case "Desktop":
        return <Computer size={18} />;
      case "Laptop":
        return <Laptop size={18} />;
      case "VM":
        return <Server size={18} />;
      default:
        return <Computer size={18} />;
    }
  };

  // Format date
  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      {/* User details card */}
      <Card className={`${selectedUser ? 'border-blue-200 dark:border-blue-800' : 'opacity-50'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Selected User</CardTitle>
          <CardDescription>User information and details</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                  <UserIcon size={24} className="text-blue-600 dark:text-blue-200" />
                </div>
                <div>
                  <h3 className="font-medium">{selectedUser.username}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{selectedUser.role}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Department</p>
                  <p className="text-sm font-medium">{selectedUser.department}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                  <p className="text-sm font-medium">{selectedUser.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Status</p>
                  <Badge 
                    variant={selectedUser.status.toLowerCase() === "active" ? "success" : 
                             selectedUser.status.toLowerCase() === "on-project" ? "info" : "secondary"}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Security Clearance</p>
                  <Badge 
                    variant={selectedUser.securityClearance === "Top Secret" ? "destructive" : 
                             selectedUser.securityClearance === "Secret" ? "warning" : "secondary"}>
                    {selectedUser.securityClearance}
                  </Badge>
                </div>
              </div>

              {selectedUser.projectAssignment && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Project</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    {selectedUser.projectAssignment}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UserIcon size={36} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-slate-500 dark:text-slate-400">No user selected</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Select a user from the list to assign a workstation</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workstation details card */}
      <Card className={`${selectedWorkstation ? 'border-blue-200 dark:border-blue-800' : 'opacity-50'}`}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Selected Workstation</CardTitle>
          <CardDescription>Workstation specifications and status</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedWorkstation ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                  {getMachineIcon(selectedWorkstation.type)}
                </div>
                <div>
                  <h3 className="font-medium">{selectedWorkstation.machineName}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedWorkstation.type}</Badge>
                    <Badge 
                      variant={selectedWorkstation.status === "Available" ? "success" : 
                              selectedWorkstation.status === "Assigned" ? "info" : "warning"}>
                      {selectedWorkstation.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                  <p className="text-sm font-medium">{selectedWorkstation.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Operating System</p>
                  <p className="text-sm font-medium">{selectedWorkstation.os}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Performance Tier</p>
                  <Badge 
                    variant={selectedWorkstation.tier === "high-end" ? "destructive" : 
                             selectedWorkstation.tier === "mid-tier" ? "warning" : "secondary"}
                     className="capitalize">
                    {selectedWorkstation.tier}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Parsec Status</p>
                  {selectedWorkstation.parsecConnectionStatus === "Connected" ? (
                    <Badge variant="success" className="flex items-center gap-1">
                      <Link2 size={12} /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <LinkOff size={12} /> Disconnected
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">Hardware Specifications</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <Cpu size={14} className="text-slate-400" />
                    <span>{selectedWorkstation.hardwareSpecs.cpuModel.split(' ').slice(-1)[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Memory size={14} className="text-slate-400" />
                    <span>{selectedWorkstation.hardwareSpecs.ram}GB RAM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MonitorSmartphone size={14} className="text-slate-400" />
                    <span>{selectedWorkstation.hardwareSpecs.gpu.replace('NVIDIA ', '')}</span>
                  </div>
                </div>
              </div>

              {selectedWorkstation.assignedTo && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Currently Assigned To</p>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <UserIcon size={14} className="text-slate-400" />
                    {selectedWorkstation.assignedTo.username}
                    <span className="text-xs text-slate-400">
                      (since {formatDate(selectedWorkstation.assignmentStartTime)})
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Computer size={36} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-slate-500 dark:text-slate-400">No workstation selected</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Select a workstation from the list to view details</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment action card */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium">Workstation Assignment</CardTitle>
          <CardDescription>Assign workstation to user with policy check</CardDescription>
        </CardHeader>
        <CardContent>
          {isAlreadyAssigned && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md mb-4 text-sm flex items-start gap-2 text-yellow-800 dark:text-yellow-300">
              <AlertTriangle size={16} className="mt-0.5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="font-medium">Workstation Already Assigned</p>
                <p>
                  This workstation is already assigned to{" "}
                  {selectedWorkstation?.assignedTo?.username}. Continuing will
                  reassign it.
                </p>
              </div>
            </div>
          )}

          {policyCheck.checked && (
            <div
              className={`${policyCheck.compliant ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300" : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"} p-3 rounded-md mb-4 text-sm flex items-start gap-2`}
            >
              {policyCheck.compliant ? (
                <Check size={16} className="mt-0.5 text-green-600 dark:text-green-400" />
              ) : (
                <X size={16} className="mt-0.5 text-red-600 dark:text-red-400" />
              )}
              <div>
                <p className="font-medium">
                  {policyCheck.compliant
                    ? "Policy Check Passed"
                    : "Policy Check Failed"}
                </p>
                {!policyCheck.compliant && policyCheck.issues && (
                  <ul className="list-disc list-inside mt-1">
                    {policyCheck.issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex gap-3">
          {!policyCheck.checked ? (
            <Button
              onClick={checkPolicyCompliance}
              disabled={!canAssign || loading}
              className="flex items-center gap-2 w-full"
              variant={canAssign ? "default" : "outline"}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-slate-800" />
              ) : (
                <Shield size={16} />
              )}
              Check Policy Compliance
            </Button>
          ) : (
            <>
              <Button
                onClick={handleAssign}
                disabled={
                  !canAssign || loading || !policyCheck.compliant
                }
                className="flex items-center gap-2 flex-1"
                variant={policyCheck.compliant ? "default" : "outline"}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-200 border-t-slate-800" />
                ) : (
                  <Check size={16} />
                )}
                Assign Workstation
              </Button>
              <Button
                onClick={resetPolicyCheck}
                variant="outline"
                disabled={loading}
              >
                Reset
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}