"use client";

import { useState } from "react";
import { Workstation, User } from "@/app/types";
import { workstationService } from "@/app/services/workstation-service";
import { Button } from "@/app/components/ui/button";
import { Check, X, AlertTriangle, Shield } from "lucide-react";

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
      const result = await workstationService.checkPolicyCompliance(
        selectedWorkstation.machineName,
        selectedUser.username
      );

      setPolicyCheck({
        checked: true,
        compliant: result.compliant,
        issues: result.issues,
      });
    } catch (error) {
      console.error("Error checking policy compliance:", error);
      setPolicyCheck({
        checked: true,
        compliant: false,
        issues: ["Error checking policy compliance"],
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle the assignment of workstation to user
  const handleAssign = async () => {
    if (!selectedWorkstation || !selectedUser) return;

    setLoading(true);
    try {
      const success = await workstationService.assignWorkstation(
        selectedWorkstation.machineName,
        selectedUser.username
      );

      if (success) {
        onAssignmentComplete();
        // Reset policy check after successful assignment
        setPolicyCheck({ checked: false, compliant: false });
      } else {
        setPolicyCheck({
          checked: true,
          compliant: false,
          issues: ["Failed to assign workstation"],
        });
      }
    } catch (error) {
      console.error("Error assigning workstation:", error);
      setPolicyCheck({
        checked: true,
        compliant: false,
        issues: ["Error assigning workstation"],
      });
    } finally {
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

  return (
    <div className="rounded-md border p-6 bg-white dark:bg-slate-950">
      <h2 className="text-lg font-semibold mb-4">Workstation Assignment</h2>

      <div className="grid gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Selected Workstation:</p>
          <p className="font-medium">
            {selectedWorkstation ? (
              <span className="flex items-center gap-2">
                {selectedWorkstation.machineName}
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedWorkstation.status === "Available" ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}
                >
                  {selectedWorkstation.status}
                </span>
              </span>
            ) : (
              <span className="text-gray-400">No workstation selected</span>
            )}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-1">Selected User:</p>
          <p className="font-medium">
            {selectedUser ? (
              <span className="flex items-center gap-2">
                {selectedUser.username}
                <span className="text-xs text-gray-500">
                  ({selectedUser.department})
                </span>
              </span>
            ) : (
              <span className="text-gray-400">No user selected</span>
            )}
          </p>
        </div>
      </div>

      {isAlreadyAssigned && (
        <div className="bg-yellow-50 p-3 rounded-md mb-4 text-sm flex items-start gap-2 text-yellow-800">
          <AlertTriangle size={16} className="mt-0.5" />
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
          className={`${policyCheck.compliant ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"} p-3 rounded-md mb-4 text-sm flex items-start gap-2`}
        >
          {policyCheck.compliant ? (
            <Check size={16} className="mt-0.5" />
          ) : (
            <X size={16} className="mt-0.5" />
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

      <div className="flex gap-3 mt-4">
        {!policyCheck.checked ? (
          <Button
            onClick={checkPolicyCompliance}
            disabled={!canAssign || loading}
            className="flex items-center gap-2 w-full"
            variant="outline"
          >
            <Shield size={16} />
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
            >
              <Check size={16} />
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
      </div>
    </div>
  );
}
