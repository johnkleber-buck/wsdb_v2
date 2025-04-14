"use client";

import { useState } from "react";
import { UsersList } from "./UsersList";
import { WorkstationsList } from "./WorkstationsList";
import { AssignmentPanel } from "./AssignmentPanel";
import { User, Workstation } from "@/app/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/app/components/ui/card";
import { 
  LayoutDashboard, 
  Users, 
  Monitor, 
  History,
  Activity,
  PieChart,
  ShieldCheck,
  Check,
  X,
  AlertTriangle
} from "lucide-react";

// Import mock data
import { auditLogEntries, utilizationMetrics } from "@/app/mock/data";

export function DashboardLayout() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedWorkstation, setSelectedWorkstation] = useState<Workstation | null>(null);
  const [userFilters, setUserFilters] = useState({});
  const [workstationFilters, setWorkstationFilters] = useState({});
  const [activeTab, setActiveTab] = useState("dashboard");

  // Handle successful assignment
  const handleAssignmentComplete = () => {
    // Refresh workstation list
    setSelectedWorkstation(null);
    // Don't reset the user selection to allow for multiple assignments
  };

  return (
    <div className="container mx-auto py-8 max-w-screen-xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workstation Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and assign workstations to users</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-4 w-full sm:w-auto">
              <TabsTrigger value="dashboard" className="flex items-center gap-1">
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-1">
                <PieChart size={16} />
                <span className="hidden sm:inline">Reports</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1">
                <History size={16} />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="policies" className="flex items-center gap-1">
                <ShieldCheck size={16} />
                <span className="hidden sm:inline">Policies</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <TabsContent value="dashboard" className="mt-0">
        {/* Main dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-8 mb-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-blue-50 dark:bg-blue-900/10 pb-2">
              <div className="flex items-center">
                <div className="mr-2 bg-blue-100 dark:bg-blue-800 p-2 rounded-md">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <CardTitle>Users</CardTitle>
              </div>
              <CardDescription>
                Browse and select users for workstation assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <UsersList 
                onSelectUser={setSelectedUser} 
                selectedUser={selectedUser}
                filters={userFilters}
              />
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardHeader className="bg-purple-50 dark:bg-purple-900/10 pb-2">
              <div className="flex items-center">
                <div className="mr-2 bg-purple-100 dark:bg-purple-800 p-2 rounded-md">
                  <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                </div>
                <CardTitle>Workstations</CardTitle>
              </div>
              <CardDescription>
                Browse available workstations and view their status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <WorkstationsList 
                onSelectWorkstation={setSelectedWorkstation}
                selectedWorkstation={selectedWorkstation}
                filters={workstationFilters}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Assignment panel - shown when both a user and workstation are selected */}
        {(selectedUser || selectedWorkstation) && (
          <AssignmentPanel
            selectedUser={selectedUser}
            selectedWorkstation={selectedWorkstation}
            onAssignmentComplete={handleAssignmentComplete}
          />
        )}
      </TabsContent>
      
      <TabsContent value="reports" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Utilization by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(utilizationMetrics.byLocation).map(([location, percentage]) => (
                  <div key={location} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{location}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          percentage > 80 ? 'bg-green-500' : 
                          percentage > 50 ? 'bg-blue-500' : 
                          'bg-slate-400'
                        }`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Utilization by Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(utilizationMetrics.byTier).map(([tier, percentage]) => (
                  <div key={tier} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{tier}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          percentage > 80 ? 'bg-red-500' : 
                          percentage > 50 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Utilization by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(utilizationMetrics.byDepartment).map(([dept, percentage]) => (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{dept}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-indigo-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Utilization by Project</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(utilizationMetrics.byProject).map(([project, percentage]) => (
                  <div key={project} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{project}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-purple-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      
      <TabsContent value="activity" className="mt-0">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="mr-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                <Activity className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <CardDescription>Recent workstation assignment activities and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {auditLogEntries.map((entry, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-1.5 rounded-full 
                      ${entry.action === "Assigned" ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" : 
                        entry.action === "Unassigned" ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" : 
                        entry.action === "Status Change" ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : 
                        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300"}`}>
                      {entry.action === "Assigned" ? <Check className="h-3.5 w-3.5" /> : 
                        entry.action === "Unassigned" ? <X className="h-3.5 w-3.5" /> : 
                        entry.action === "Status Change" ? <Activity className="h-3.5 w-3.5" /> : 
                        <AlertTriangle className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <p className="font-medium text-sm">{entry.action}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Intl.DateTimeFormat('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }).format(entry.timestamp)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm">{entry.details}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">by {entry.user}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="policies" className="mt-0">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <div className="mr-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                <ShieldCheck className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>
              <CardTitle>Workstation Policies</CardTitle>
            </div>
            <CardDescription>Active policies for workstation assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 border-b">
                <div className="grid grid-cols-4 font-medium text-sm">
                  <div>Policy Name</div>
                  <div>Type</div>
                  <div>Criteria</div>
                  <div>Applied To</div>
                </div>
              </div>
              <div className="divide-y">
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="font-medium">NY_Security_Policy</div>
                    <div className="text-green-600 dark:text-green-400">Allowed</div>
                    <div>Location: NY, Clearance: Secret</div>
                    <div>OU=VFX,OU=Workstations,DC=studio,DC=local</div>
                  </div>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="font-medium">LA_Security_Policy</div>
                    <div className="text-green-600 dark:text-green-400">Allowed</div>
                    <div>Location: LA, Clearance: Confidential</div>
                    <div>OU=Animation,OU=Workstations,DC=studio,DC=local</div>
                  </div>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="font-medium">London_Hardware_Policy</div>
                    <div className="text-green-600 dark:text-green-400">Allowed</div>
                    <div>Location: London, Tier: high-end</div>
                    <div>OU=VFX,OU=Workstations,DC=studio,DC=local</div>
                  </div>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="font-medium">Freelancer_Restriction</div>
                    <div className="text-red-600 dark:text-red-400">Disallowed</div>
                    <div>Role: Freelancer, Tier: high-end</div>
                    <div>All workstations</div>
                  </div>
                </div>
                <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <div className="grid grid-cols-4 text-sm">
                    <div className="font-medium">Executive_Access</div>
                    <div className="text-green-600 dark:text-green-400">Allowed</div>
                    <div>Role: Executive</div>
                    <div>OU=Executive,OU=Workstations,DC=studio,DC=local</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </div>
  );
}