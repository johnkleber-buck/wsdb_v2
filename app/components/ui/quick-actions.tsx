"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle, MoreHorizontal } from "lucide-react"

import { cn } from "@/app/lib/utils"

const QuickActions = DropdownMenuPrimitive.Root

const QuickActionsGroup = DropdownMenuPrimitive.Group

const QuickActionsTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Trigger> & {
    variant?: "default" | "ghost" | "outline"
  }
>(({ className, variant = "ghost", children, ...props }, ref) => (
  <DropdownMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
      variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
      variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
      variant === "outline" && "border border-input hover:bg-accent hover:text-accent-foreground",
      className
    )}
    {...props}
  >
    {children || <MoreHorizontal className="h-4 w-4" />}
  </DropdownMenuPrimitive.Trigger>
))
QuickActionsTrigger.displayName = "QuickActionsTrigger"

const QuickActionsContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      align="center"
      alignOffset={0}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
QuickActionsContent.displayName = "QuickActionsContent"

const QuickActionsItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
QuickActionsItem.displayName = "QuickActionsItem"

const QuickActionsLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-xs font-semibold text-foreground/60",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
QuickActionsLabel.displayName = "QuickActionsLabel"

const QuickActionsSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
QuickActionsSeparator.displayName = "QuickActionsSeparator"

export {
  QuickActions,
  QuickActionsGroup,
  QuickActionsTrigger,
  QuickActionsContent,
  QuickActionsItem,
  QuickActionsLabel,
  QuickActionsSeparator
}