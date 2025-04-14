"use client"

import { Card, CardContent } from "@/app/components/ui/card"
import { Workstation } from "@/app/lib/data"
import { Activity, CheckCircle, AlertCircle, Clock } from "lucide-react"

interface StatusCountProps {
  icon: React.ElementType
  label: string
  count: number
  color: string
}

function StatusCount({ icon: Icon, label, count, color }: StatusCountProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-full p-2 ${color} mb-2`}>
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-xl font-bold">{count}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}

export function StatusSummary({ workstations }: { workstations: Workstation[] }) {
  const statusCounts = {
    online: workstations.filter(ws => ws.status === 'online').length,
    warning: workstations.filter(ws => ws.status === 'warning').length,
    offline: workstations.filter(ws => ws.status === 'offline').length,
    maintenance: workstations.filter(ws => ws.status === 'maintenance').length,
  }

  return (
    <Card variant="elevated" className="mb-4">
      <CardContent padded="md" className="flex justify-around">
        <StatusCount 
          icon={CheckCircle} 
          label="Online" 
          count={statusCounts.online} 
          color="bg-green-100 text-green-600"
        />
        <StatusCount 
          icon={AlertCircle} 
          label="Warning" 
          count={statusCounts.warning} 
          color="bg-orange-100 text-orange-600"
        />
        <StatusCount 
          icon={Activity} 
          label="Offline" 
          count={statusCounts.offline} 
          color="bg-gray-100 text-gray-600"
        />
        <StatusCount 
          icon={Clock} 
          label="Maintenance" 
          count={statusCounts.maintenance} 
          color="bg-yellow-100 text-yellow-600"
        />
      </CardContent>
    </Card>
  )
}