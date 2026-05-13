'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

const Select = ({ children, value, onValueChange, ...props }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        props.className
      )}
      {...props}
    >
      {children}
    </select>
  )
}

const SelectTrigger = ({ children, className, ...props }: any) => (
  <div className={cn("relative", className)} {...props}>
    {children}
  </div>
)

const SelectValue = ({ placeholder, value }: any) => (
  <span>{value || placeholder}</span>
)

const SelectContent = ({ children, className, ...props }: any) => (
  <div className={cn("absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg", className)} {...props}>
    {children}
  </div>
)

const SelectItem = ({ children, value, className, ...props }: any) => (
  <option value={value} className={cn("px-3 py-2 hover:bg-gray-100 cursor-pointer", className)} {...props}>
    {children}
  </option>
)

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}