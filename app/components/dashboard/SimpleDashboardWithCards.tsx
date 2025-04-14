"use client"

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/card"
import { useToast } from "@/app/components/ui/simple-toast"
import { StatusSummary } from "./StatusSummary"
import { WorkstationList } from "./WorkstationList"
import { workstations } from "@/app/lib/data"
import { RefreshCcw, MoreHorizontal, Download, Plus } from "lucide-react"
import { QuickActions, QuickActionsContent, QuickActionsItem, QuickActionsTrigger } from "@/app/components/ui/quick-actions"

export function SimpleDashboardWithCards() {
  const { addToast } = useToast()
  
  const showToast = (variant: "default" | "success" | "destructive" | "warning" | "info") => {
    addToast({
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Toast`,
      description: `This is a ${variant} toast notification.`,
      variant,
      duration: 5000
    })
  }

  const handleRefresh = () => {
    addToast({
      title: "Dashboard Refreshed",
      description: "All workstation data has been updated",
      variant: "info",
      duration: 3000
    })
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Workstation Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitoring 5 workstations across 4 departments</p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <QuickActions>
            <QuickActionsTrigger variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </QuickActionsTrigger>
            <QuickActionsContent>
              <QuickActionsItem onClick={() => showToast("info")}>
                <Download className="mr-2 h-4 w-4" />
                <span>Export Data</span>
              </QuickActionsItem>
              <QuickActionsItem onClick={() => showToast("default")}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Add Workstation</span>
              </QuickActionsItem>
            </QuickActionsContent>
          </QuickActions>
        </div>
      </div>

      {/* Status Summary */}
      <StatusSummary workstations={workstations} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Workstation List - Takes 2/3 of the screen on desktop */}
        <div className="md:col-span-2">
          <WorkstationList workstations={workstations} />
        </div>
        
        {/* Dashboard Cards - Side panel */}
        <div className="flex flex-col gap-4">
          <Card variant="elevated">
            <CardHeader withBorder>
              <CardTitle size="sm">System Status</CardTitle>
            </CardHeader>
            <CardContent padded="md">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">CPU Usage</span>
                  <span className="text-sm font-medium">32%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                </div>
                
                <div className="flex justify-between mt-3">
                  <span className="text-sm text-slate-600">Memory</span>
                  <span className="text-sm font-medium">64%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '64%' }}></div>
                </div>
                
                <div className="flex justify-between mt-3">
                  <span className="text-sm text-slate-600">Storage</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </CardContent>
            <CardFooter withBorder>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => showToast("warning")}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
          
          <Card variant="bordered">
            <CardHeader withBorder>
              <CardTitle size="sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent padded="md" className="space-y-2">
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => showToast("success")}
              >
                Run Diagnostics
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => showToast("info")}
              >
                Update All Clients
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={() => showToast("default")}
              >
                Generate Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}