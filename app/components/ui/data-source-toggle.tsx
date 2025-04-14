"use client";

import { useState } from "react";
import { Badge } from "./badge";
import { Database, CloudCog } from "lucide-react";
import { FEATURES } from "@/app/lib/utils";

interface DataSourceToggleProps {
  onToggle: (useReal: boolean) => void;
  initialValue?: boolean;
}

export function DataSourceToggle({ 
  onToggle, 
  initialValue = FEATURES.USE_OKTA_DATA 
}: DataSourceToggleProps) {
  const [useRealData, setUseRealData] = useState(initialValue);
  
  const handleToggle = () => {
    const newValue = !useRealData;
    setUseRealData(newValue);
    onToggle(newValue);
  };
  
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
      
      <span className="text-sm">Data Source:</span>
      
      <div className="flex gap-1">
        {useRealData ? (
          <Badge 
            variant="success" 
            className="flex items-center gap-1 px-2 py-1"
          >
            <CloudCog className="h-3 w-3" />
            <span className="text-xs">Okta API</span>
          </Badge>
        ) : (
          <Badge 
            variant="secondary" 
            className="flex items-center gap-1 px-2 py-1"
          >
            <Database className="h-3 w-3" />
            <span className="text-xs">Mock Data</span>
          </Badge>
        )}
      </div>
    </div>
  );
}