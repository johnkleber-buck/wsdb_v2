// Workstation model
export interface Workstation {
  machineName: string;
  type: 'Desktop' | 'Laptop' | 'VM';
  location: string;
  os: string;
  tier: string;
  hardwareSpecs: HardwareSpecs;
  software: Software[];
  status: 'Available' | 'Assigned' | 'Maintenance';
  assignedTo?: User;
  assignmentStartTime?: Date;
  lastSeen?: Date;
  parsecConnectionStatus?: string;
  currentParsecUser?: User;
  ou: string;
  policyAssignments: Policy[];
}

// User model
export interface User {
  username: string;
  department: string;
  location: string;
  status: string;
  securityClearance: string;
  projectAssignment?: string;
  role: string;
}

// Hardware Specs model
export interface HardwareSpecs {
  specId: string;
  cpuModel: string;
  cpuCores: number;
  cpuSpeed: number;
  gpu: string;
  ram: number;
  nicSpeed: string;
}

// Software model
export interface Software {
  softwareName: string;
  version: string;
}

// Policy model
export interface Policy {
  policyName: string;
  criteria: Record<string, string | number | boolean>;
  allowedDisallowed: 'Allowed' | 'Disallowed';
}

// API response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Filter types
export interface WorkstationFilters {
  status?: string;
  location?: string;
  type?: string;
  tier?: string;
}

export interface UserFilters {
  department?: string;
  location?: string;
  role?: string;
  status?: string;
}

// Dashboard metrics
export interface UtilizationMetrics {
  byLocation: Record<string, number>;
  byDepartment: Record<string, number>;
  byProject: Record<string, number>;
  byTier: Record<string, number>;
}

// Audit log entry
export interface AuditLogEntry {
  timestamp: Date;
  action: string;
  user: string;
  details: string;
}