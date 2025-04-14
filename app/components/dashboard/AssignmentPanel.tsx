"use client";

import { useState } from "react";
import { User, Workstation } from "@/app/types";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useToast } from "@/app/hooks/use-toast";
import { 
  Link as LinkIcon, 
  Unlink as LinkBreakIcon, 
  AlertTriangle as AlertTriangleIcon, 
  Check as CheckIcon, 
  X as XIcon,
  Info as InfoIcon,
  ShieldCheck,
  ShieldAlert,
  CornerRightDown,
  ArrowRight,
  RefreshCcw
} from "lucide-react";
import { mockWorkstations } from "@/app/mock/data";

interface AssignmentPanelProps {
  selectedUser: User | null;
  selectedWorkstation: Workstation | null;
  onAssignmentComplete: () => void;
}

export function AssignmentPanel({ 
  selectedUser, 
  selectedWorkstation,
  onAssignmentComplete
}: AssignmentPanelProps) {
  const { toast } = useToast();
  const [isAssigning, setIsAssigning] = useState(false);
  const [policyCheck, setPolicyCheck] = useState<{
    passed: boolean;
    messages: string[];
  } | null>(null);

  // Check if both a user and workstation are selected
  const canAssign = selectedUser && selectedWorkstation && 
                    selectedWorkstation.status !== "Maintenance" &&
                    (selectedWorkstation.status !== "Assigned" || 
                    selectedWorkstation.assignedTo?.username === selectedUser.username);
                    
  // Check if workstation is already assigned to the selected user
  const isAlreadyAssigned = selectedUser && 
                          selectedWorkstation?.assignedTo?.username === selectedUser.username;
  
  // Check for conflicts
  const hasUserAssignmentConflict = selectedUser && 
                                 selectedWorkstation?.assignedTo && 
                                 selectedWorkstation.assignedTo.username !== selectedUser.username;
                                 
  const hasWorkstationConflict = selectedWorkstation?.status === "Maintenance";

  // Simulate a policy check
  const checkPolicyCompliance = () => {
    setIsAssigning(true);
    
    // Simulate API call
    setTimeout(() => {
      // Mock policy checks
      if (selectedUser && selectedWorkstation) {
        // Location check
        const locationMatch = selectedUser.location === selectedWorkstation.location;
        
        // Security clearance check for high-end workstations
        const securityClearanceOk = !(
          selectedWorkstation.tier === "high-end" && 
          selectedUser.securityClearance === "Confidential"
        );
        
        // Role check
        const roleCheck = !(
          selectedUser.role === "Freelancer" && 
          selectedWorkstation.tier === "high-end"
        );
        
        const messages = [];
        if (!locationMatch) {
          messages.push(`Location mismatch: User is in ${selectedUser.location} but workstation is in ${selectedWorkstation.location}.`);
        }
        
        if (!securityClearanceOk) {
          messages.push(`Security clearance insufficient: ${selectedUser.securityClearance} clearance is not sufficient for ${selectedWorkstation.tier} workstation.`);
        }
        
        if (!roleCheck) {
          messages.push(`Role restriction: Freelancers cannot be assigned to high-end workstations.`);
        }
        
        const passed = locationMatch && securityClearanceOk && roleCheck;
        
        setPolicyCheck({
          passed,
          messages
        });
      }
      
      setIsAssigning(false);
    }, 800);
  };
  
  // Handle assignment
  const handleAssign = () => {
    setIsAssigning(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedUser && selectedWorkstation) {
        // In a real app, this would call the workstationService.assignWorkstation API
        
        // For demo purposes, update the mock data directly
        const workstationIndex = mockWorkstations.findIndex(
          ws => ws.machineName === selectedWorkstation.machineName
        );
        
        if (workstationIndex !== -1) {
          // Update the workstation in the mock data
          mockWorkstations[workstationIndex].assignedTo = selectedUser;
          mockWorkstations[workstationIndex].status = "Assigned";
          mockWorkstations[workstationIndex].assignmentStartTime = new Date();
          mockWorkstations[workstationIndex].parsecConnectionStatus = "Disconnected";
        }
        
        toast({
          title: "Assignment Successful",
          description: `${selectedUser.username} has been assigned to ${selectedWorkstation.machineName}`,
          variant: "success",
        });
        
        // Reset panel and notify parent component
        onAssignmentComplete();
        setPolicyCheck(null);
      }
      
      setIsAssigning(false);
    }, 1000);
  };
  
  // Handle unassignment
  const handleUnassign = () => {
    setIsAssigning(true);
    
    // Simulate API call
    setTimeout(() => {
      if (selectedWorkstation) {
        // In a real app, this would call the workstationService.unassignWorkstation API
        
        // For demo purposes, update the mock data directly
        const workstationIndex = mockWorkstations.findIndex(
          ws => ws.machineName === selectedWorkstation.machineName
        );
        
        if (workstationIndex !== -1) {
          // Update the workstation in the mock data
          mockWorkstations[workstationIndex].assignedTo = undefined;
          mockWorkstations[workstationIndex].status = "Available";
          mockWorkstations[workstationIndex].assignmentStartTime = undefined;
          mockWorkstations[workstationIndex].parsecConnectionStatus = "Disconnected";
          mockWorkstations[workstationIndex].currentParsecUser = undefined;
        }
        
        toast({
          title: "Unassignment Successful",
          description: `${selectedWorkstation.machineName} is now available`,
          variant: "warning",
        });
        
        // Reset panel and notify parent component
        onAssignmentComplete();
        setPolicyCheck(null);
      }
      
      setIsAssigning(false);
    }, 1000);
  };
  
  // Handle cancel
  const handleCancel = () => {
    setPolicyCheck(null);
  };

  // If nothing is selected, show a prompt
  if (!selectedUser && !selectedWorkstation) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center px-4">
        <InfoIcon className="h-10 w-10 mb-4 text-slate-300" />
        <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">No Selection Made</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          Select a user and workstation from the lists to manage assignments
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <CornerRightDown className="h-4 w-4" />
            <span className="text-sm">Select a user from the list above</span>
          </div>
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <CornerRightDown className="h-4 w-4" />
            <span className="text-sm">Select a workstation from the list below</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 px-1">
      {/* Selection summary */}
      <div className="flex flex-col gap-4 mb-4">
        {/* User selection */}
        {selectedUser ? (
          <div className="rounded-lg border bg-blue-50/50 dark:bg-blue-900/10 p-3 flex flex-col">
            <div className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-300 font-semibold mb-2 flex items-center">
              <Badge variant="info" className="mr-2">User</Badge>
              Selected User
            </div>
            <div className="font-medium">{selectedUser.username}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {selectedUser.department} • {selectedUser.role} • {selectedUser.location}
            </div>
            
            <div className="text-xs mt-2 flex items-center gap-1 text-slate-500">
              <ShieldCheck className="h-3 w-3" />
              {selectedUser.securityClearance} Clearance
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-3 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Waiting for user selection...
            </div>
          </div>
        )}

        {/* Connector */}
        <div className="flex justify-center">
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
        </div>
        <div className="flex justify-center -mt-2 -mb-2">
          <div className="rounded-full bg-indigo-100 dark:bg-indigo-800 p-1">
            <ArrowRight className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-px h-4 bg-slate-200 dark:bg-slate-700"></div>
        </div>

        {/* Workstation selection */}
        {selectedWorkstation ? (
          <div className="rounded-lg border bg-purple-50/50 dark:bg-purple-900/10 p-3 flex flex-col">
            <div className="text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300 font-semibold mb-2 flex items-center">
              <Badge variant="info" className="mr-2">Workstation</Badge>
              Selected Workstation
            </div>
            <div className="font-medium">{selectedWorkstation.machineName}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {selectedWorkstation.type} • {selectedWorkstation.location} • {selectedWorkstation.tier}
            </div>
            
            <div className="text-xs mt-2 flex items-center gap-1">
              <Badge variant={
                selectedWorkstation.status === "Available" ? "success" : 
                selectedWorkstation.status === "Assigned" ? "info" : 
                "warning"
              }>
                {selectedWorkstation.status}
              </Badge>
              
              {selectedWorkstation.assignedTo && (
                <span className="text-slate-500">
                  to {selectedWorkstation.assignedTo.username}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed p-3 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 animate-spin" />
              Waiting for workstation selection...
            </div>
          </div>
        )}
      </div>
      
      {/* Conflicts */}
      {(hasUserAssignmentConflict || hasWorkstationConflict) && (
        <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-200 dark:border-amber-900/20 flex items-start gap-2 mb-4">
          <AlertTriangleIcon className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-300">Conflicts Detected</h4>
            <ul className="mt-1 space-y-1 text-sm text-amber-700 dark:text-amber-400">
              {hasUserAssignmentConflict && (
                <li>
                  This workstation is already assigned to {selectedWorkstation?.assignedTo?.username}.
                  Reassigning will unassign it from the current user.
                </li>
              )}
              {hasWorkstationConflict && (
                <li>
                  This workstation is currently under maintenance and cannot be assigned.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      
      {/* Policy check results */}
      {policyCheck && (
        <div className={`p-3 rounded-lg border flex items-start gap-2 mb-4 ${
          policyCheck.passed 
            ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/20" 
            : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/20"
        }`}>
          {policyCheck.passed ? (
            <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className={`font-semibold ${
              policyCheck.passed 
                ? "text-green-800 dark:text-green-300" 
                : "text-red-800 dark:text-red-300"
            }`}>
              {policyCheck.passed ? "Policy Check Passed" : "Policy Check Failed"}
            </h4>
            
            {policyCheck.messages.length > 0 ? (
              <ul className={`mt-1 space-y-1 text-sm ${
                policyCheck.passed 
                  ? "text-green-700 dark:text-green-400" 
                  : "text-red-700 dark:text-red-400"
              }`}>
                {policyCheck.messages.map((message, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    {policyCheck.passed ? (
                      <CheckIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                All policy checks passed successfully. You can proceed.
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        {!policyCheck ? (
          <>
            <Button
              variant="outline"
              onClick={checkPolicyCompliance}
              disabled={!canAssign || isAssigning}
              className="w-full sm:w-auto"
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Check Policies
            </Button>
            
            {isAlreadyAssigned && (
              <Button 
                variant="destructive"
                onClick={handleUnassign}
                disabled={isAssigning}
                className="w-full sm:w-auto"
              >
                <LinkBreakIcon className="mr-2 h-4 w-4" />
                Unassign Workstation
              </Button>
            )}
          </>
        ) : (
          <>
            {policyCheck.passed ? (
              <Button 
                variant="success"
                onClick={handleAssign}
                disabled={isAssigning}
                className="w-full sm:w-auto"
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Confirm Assignment
              </Button>
            ) : (
              <Button 
                variant="destructive"
                disabled={true}
                className="w-full sm:w-auto"
              >
                <XIcon className="mr-2 h-4 w-4" />
                Cannot Assign
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={handleCancel}
              disabled={isAssigning}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}