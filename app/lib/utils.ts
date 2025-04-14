import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to format date to relative time
export function formatRelativeTime(date: Date | undefined) {
  if (!date) return "N/A";
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) {
    return `${diffDays}d ago`;
  } else if (diffHours > 0) {
    return `${diffHours}h ago`;
  } else {
    return `${diffMins}m ago`;
  }
}

// Feature toggle for data source selection
export const FEATURES = {
  USE_OKTA_DATA: false,  // Set to false to use mock data by default
  USE_BUCK_API: false,   // Set to false to use mock data by default
  API_BASE_URL: 'http://core-tools.buck.local:7000',
  DEBUG_MODE: true       // Enable debug mode for troubleshooting
};

// Utility to check if a feature is enabled
export function isFeatureEnabled(featureName: keyof typeof FEATURES): boolean {
  return FEATURES[featureName] === true;
}