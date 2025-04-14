"use client"

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

export function SimpleDashboard() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Simple Dashboard</h1>
      <div className="mt-4">
        <p>This is a simplified dashboard for testing.</p>
      </div>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p>User management would go here.</p>
            <Button className="mt-4">Add User</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workstations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Workstation management would go here.</p>
            <Button className="mt-4">Add Workstation</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}