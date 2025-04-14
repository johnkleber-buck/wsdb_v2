"use client"

import * as React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/app/lib/utils"

type ToastProps = {
  id: string
  title?: string
  description?: string
  variant?: "default" | "success" | "destructive" | "warning" | "info"
  duration?: number
}

type ToastContextType = {
  toasts: ToastProps[]
  addToast: (toast: Omit<ToastProps, "id">) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, ...toast }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

function Toast({
  id,
  title,
  description,
  variant = "default",
  duration = 5000,
  onClose,
}: ToastProps & { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border p-4 shadow-md animate-in fade-in slide-in-from-bottom-5",
        variant === "default" && "bg-white border-gray-200 text-gray-900",
        variant === "success" && "bg-green-50 border-green-200 text-green-900",
        variant === "destructive" && "bg-red-50 border-red-200 text-red-900",
        variant === "warning" && "bg-yellow-50 border-yellow-200 text-yellow-900",
        variant === "info" && "bg-blue-50 border-blue-200 text-blue-900"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && <h3 className="font-medium mb-1">{title}</h3>}
          {description && <p className="text-sm opacity-90">{description}</p>}
        </div>
        <button
          onClick={onClose}
          className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

// Short-hand function to add a toast
export function toast(props: Omit<ToastProps, "id">) {
  // Access the context value directly
  const context = useContext(ToastContext)
  if (!context) {
    console.error("toast function used outside of ToastProvider")
    return
  }
  context.addToast(props)
}