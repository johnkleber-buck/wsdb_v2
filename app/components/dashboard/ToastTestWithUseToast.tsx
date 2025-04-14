"use client"

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { useState } from "react"
import { Toaster } from "@/app/components/ui/toaster"
import { toast } from "@/app/hooks/use-toast"

export function ToastTestWithUseToast() {
  const [count, setCount] = useState(0)
  
  const incrementCount = () => {
    setCount(count + 1)
    
    // Show a toast notification
    toast({
      title: `Count updated to ${count + 1}`,
      description: "The count has been incremented",
      variant: "info",
    })
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Toast With useToast Test</h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="elevated">
          <CardHeader withBorder>
            <CardTitle size="sm">Toast Test</CardTitle>
          </CardHeader>
          <CardContent padded="md">
            <p>Count: {count}</p>
            <Button className="mt-4" onClick={incrementCount}>Increment</Button>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  )
}