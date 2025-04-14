"use client";

import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  clearable?: boolean;
  className?: string;
}

export function FilterDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
  label,
  clearable = true,
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Find the selected option label
  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={cn("relative inline-block text-left", className)} ref={ref}>
      {label && (
        <label className="block mb-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <div>
        <button
          type="button"
          className={cn(
            "inline-flex w-full justify-between items-center rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
            value ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
          )}
          onClick={() => setOpen(!open)}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <div className="flex items-center ml-2">
            {value && clearable && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="mr-1 rounded-full p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                <X className="h-3 w-3 text-slate-500" />
              </button>
            )}
            <ChevronDown className="h-4 w-4 text-slate-500" />
          </div>
        </button>
      </div>

      {open && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  "flex items-center px-3 py-2 cursor-pointer text-sm hover:bg-slate-100 dark:hover:bg-slate-700",
                  option.value === value ? "bg-blue-50 dark:bg-blue-900/20" : ""
                )}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span className="flex-1">{option.label}</span>
                {option.value === value && (
                  <Check className="h-4 w-4 text-blue-500" />
                )}
              </div>
            ))}
            {options.length === 0 && (
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                No options available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}