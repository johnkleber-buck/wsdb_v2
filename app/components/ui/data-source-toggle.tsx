"use client";

import { useState } from "react";
import { Badge } from "./badge";
import { Database, CloudCog, Server } from "lucide-react";
import { FEATURES } from "@/app/lib/utils";

interface DataSourceToggleProps {
  type: 'okta' | 'buck';
  onToggle: (useReal: boolean) => void;
  initialValue?: boolean;
  label?: string;
}

export function DataSourceToggle({ 
  type,
  onToggle, 
  initialValue = false,
  label 
}: DataSourceToggleProps) {
  const [useRealData, setUseRealData] = useState(initialValue);
  
  const handleToggle = () => {
    const newValue = !useRealData;
    setUseRealData(newValue);
    onToggle(newValue);
  };
  
  // Determine what to display based on the toggle type
  const getToggleDisplay = () => {
    if (type === 'okta') {
      return {
        realLabel: 'Okta API',
        mockLabel: 'Mock Users',
        realIcon: CloudCog,
        mockIcon: Database
      };
    } else if (type === 'buck') {
      return {
        realLabel: 'BUCK API',
        mockLabel: 'Mock Data',
        realIcon: Server,
        mockIcon: Database
      };
    }
    
    // Default fallback
    return {
      realLabel: 'API',
      mockLabel: 'Mock',
      realIcon: CloudCog,
      mockIcon: Database
    };
  };
  
  const { realLabel, mockLabel, realIcon: RealIcon, mockIcon: MockIcon } = getToggleDisplay();
  const displayLabel = label || `${type.toUpperCase()} Data:`;
  
  return (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 p-2 rounded-md border border-slate-200 dark:border-slate-700">
      <button
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 
          ${useRealData ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform
            ${useRealData ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      
      <span className="text-sm">{displayLabel}</span>
      
      <div className="flex gap-1">
        {useRealData ? (
          <Badge 
            variant="success" 
            className="flex items-center gap-1 px-2 py-1"
          >
            <RealIcon className="h-3 w-3" />
            <span className="text-xs">{realLabel}</span>
          </Badge>
        ) : (
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1 px-2 py-1"
          >
            <MockIcon className="h-3 w-3" />
            <span className="text-xs">{mockLabel}</span>
          </Badge>
        )}
      </div>
    </div>
  );
}