"use client";

import { useState } from "react";
import { UsersList } from "./UsersList";
import { WorkstationsList } from "./WorkstationsList";
import { AssignmentPanel } from "./AssignmentPanel";
import { User, Workstation } from "@/app/types";

export function DashboardLayout() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null);
  const [userFilters, setUserFilters] = useState({});
  const [workstationFilters, setWorkstationFilters] = useState({});

  // Handle successful assignment
  const handleAssignmentComplete = () => {
    // Refresh workstation list
    setSelectedWorkstation(null);
    // Don't reset the user selection to allow for multiple assignments
  };

  return (
    <div className="container mx-auto py-8 max-w-screen-xl">
      <h1 className="text-2xl font-bold mb-8">Workstation Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column - Users list */}
        <div className="space-y-4">
          <UsersList 
            onSelectUser={setSelectedUser} 
            selectedUser={selectedUser}
            filters={userFilters}
          />
        </div>
        
        {/* Right column - Workstations list */}
        <div className="space-y-4">
          <WorkstationsList 
            onSelectWorkstation={setSelectedWorkstation}
            selectedWorkstation={selectedWorkstation}
            filters={workstationFilters}
          />
        </div>
      </div>
      
      {/* Assignment panel - shown when both a user and workstation are selected */}
      {(selectedUser || selectedWorkstation) && (
        <div className="mt-8">
          <AssignmentPanel
            selectedUser={selectedUser}
            selectedWorkstation={selectedWorkstation}
            onAssignmentComplete={handleAssignmentComplete}
          />
        </div>
      )}
    </div>
  );
}