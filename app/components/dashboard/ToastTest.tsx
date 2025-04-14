"use client"

import { Button } from "@/app/components/ui/button"
import { useState } from "react"

export function ToastTest() {
  const [count, setCount] = useState(0)
  
  const incrementCount = () => {
    setCount(count + 1)
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Toast Test</h1>
      <div className="mt-4">
        <p>Count: {count}</p>
        <Button className="mt-4" onClick={incrementCount}>Increment</Button>
      </div>
    </div>
  )
}