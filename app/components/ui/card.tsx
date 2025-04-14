"use client"

import * as React from "react"

import { cn } from "@/app/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "elevated" | "bordered" | "ghost"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg bg-card text-card-foreground transition-all duration-200",
      variant === "default" && "border shadow-sm hover:shadow",
      variant === "elevated" && "border-0 shadow-md hover:shadow-lg",
      variant === "bordered" && "border-2 shadow-none",
      variant === "ghost" && "border-0 shadow-none bg-transparent",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withBorder?: boolean
  }
>(({ className, withBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6", 
      withBorder && "border-b pb-4",
      className
    )}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: "sm" | "md" | "lg"
  }
>(({ className, size = "md", ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-semibold leading-none tracking-tight",
      size === "sm" && "text-lg",
      size === "md" && "text-xl",
      size === "lg" && "text-2xl",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & {
    muted?: boolean
  }
>(({ className, muted = true, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm", 
      muted ? "text-muted-foreground" : "text-foreground",
      className
    )}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    padded?: boolean | "sm" | "md" | "lg"
  }
>(({ className, padded = true, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      padded === true && "p-6 pt-0",
      padded === "sm" && "p-3 pt-0",
      padded === "md" && "p-4 pt-0",
      padded === "lg" && "p-8 pt-0",
      padded === false && "p-0",
      className
    )} 
    {...props} 
  />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    withBorder?: boolean
  }
>(({ className, withBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0", 
      withBorder && "border-t mt-4 pt-4",
      className
    )}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }