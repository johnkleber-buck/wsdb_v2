import { ApiClient } from './api-client';
import { 
  User, 
  Workstation, 
  HardwareSpecs, 
  Software, 
  Policy, 
  PaginatedResponse, 
  UserFilters, 
  WorkstationFilters,
  AuditLogEntry,
  UtilizationMetrics
} from '@/app/types';
import { FEATURES } from '@/app/lib/utils';
import { mockUsers } from '@/app/mock/data';

// Constants
const BUCK_API_BASE_URL = FEATURES.API_BASE_URL || 'http://core-tools.buck.local:7000';

// Endpoints
const API_ENDPOINTS = {
  // User endpoints
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_BY_USERNAME: (username: string) => `/users/username/${username}`,
  USER_ASSIGNMENTS: (id: string) => `/users/${id}/assignments`,
  
  // Workstation endpoints
  WORKSTATIONS: '/workstations',
  WORKSTATION_BY_ID: (id: string) => `/workstations/${id}`,
  WORKSTATION_BY_NAME: (name: string) => `/workstations/name/${name}`,
  WORKSTATION_HISTORY: (id: string) => `/workstations/${id}/history`,
  WORKSTATION_STATUS: (id: string) => `/workstations/${id}/status`,
  
  // Assignment endpoints
  ASSIGNMENTS: '/assignments',
  ASSIGNMENT_BY_ID: (id: string) => `/assignments/${id}`,
  CREATE_ASSIGNMENT: '/assignments',
  DELETE_ASSIGNMENT: (id: string) => `/assignments/${id}`,
  
  // Hardware endpoints
  HARDWARE_SPECS: '/hardware',
  HARDWARE_SPEC_BY_ID: (id: string) => `/hardware/${id}`,
  
  // Software endpoints
  SOFTWARE: '/software',
  SOFTWARE_BY_ID: (id: string) => `/software/${id}`,
  
  // Policy endpoints
  POLICIES: '/policies',
  POLICY_BY_ID: (id: string) => `/policies/${id}`,
  POLICY_VALIDATION: '/policies/validate',
  
  // Statistics and metrics
  METRICS: '/metrics',
  UTILIZATION: '/metrics/utilization',
  
  // Audit logs
  AUDIT_LOGS: '/audit',
  
  // Okta integration (for backward compatibility)
  OKTA_USERS: '/buckokta/category/att/comparison/match'
};

// Create API client
const apiClient = new ApiClient(BUCK_API_BASE_URL);

// Helper function to handle API errors with fallback
async function withFallback<T>(apiCall: () => Promise<T>, fallbackData: T, entityName: string): Promise<T> {
  try {
    if (!FEATURES.USE_BUCK_API) {
      console.log(`Using mock data for ${entityName} (BUCK API disabled)`);
      return fallbackData;
    }
    
    console.log(`Fetching ${entityName} from BUCK API`);
    return await apiCall();
  } catch (error) {
    console.error(`Error fetching ${entityName} from BUCK API:`, error);
    console.log(`Falling back to mock data for ${entityName}`);
    return fallbackData;
  }
}

// BUCK API Service
export const buckApiService = {
  // ========== User Management ==========
  
  /**
   * Get all users with optional filtering and pagination
   */
  async getUsers(filters?: UserFilters, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<User>> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<PaginatedResponse<User>>(
          API_ENDPOINTS.USERS, 
          { page, pageSize, ...filters }
        );
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data;
      },
      {
        data: mockUsers,
        total: mockUsers.length,
        page,
        pageSize
      },
      'users'
    );
  },
  
  /**
   * Get a user by username
   */
  async getUserByUsername(username: string): Promise<User | null> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<User>(
          API_ENDPOINTS.USER_BY_USERNAME(username)
        );
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data || null;
      },
      mockUsers.find(user => user.username === username) || null,
      `user ${username}`
    );
  },
  
  // ========== Workstation Management ==========
  
  /**
   * Get all workstations with optional filtering and pagination
   */
  async getWorkstations(filters?: WorkstationFilters, page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<Workstation>> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<PaginatedResponse<Workstation>>(
          API_ENDPOINTS.WORKSTATIONS, 
          { page, pageSize, ...filters }
        );
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data;
      },
      // This should be replaced with your mockWorkstations import
      { data: [], total: 0, page, pageSize },
      'workstations'
    );
  },
  
  /**
   * Get a workstation by machine name
   */
  async getWorkstationByName(machineName: string): Promise<Workstation | null> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<Workstation>(
          API_ENDPOINTS.WORKSTATION_BY_NAME(machineName)
        );
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data || null;
      },
      null, // Replace with mockWorkstations.find...
      `workstation ${machineName}`
    );
  },
  
  /**
   * Update workstation status
   */
  async updateWorkstationStatus(machineName: string, status: string): Promise<boolean> {
    try {
      if (!FEATURES.USE_BUCK_API) {
        console.log(`Mock: Updated workstation ${machineName} status to ${status}`);
        return true;
      }
      
      const response = await apiClient.put<{ success: boolean }>(
        API_ENDPOINTS.WORKSTATION_STATUS(machineName),
        { status }
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error(`Error updating workstation status:`, error);
      return false;
    }
  },
  
  // ========== Assignment Management ==========
  
  /**
   * Assign a workstation to a user
   */
  async assignWorkstation(workstationName: string, username: string): Promise<boolean> {
    try {
      if (!FEATURES.USE_BUCK_API) {
        console.log(`Mock: Assigned workstation ${workstationName} to user ${username}`);
        return true;
      }
      
      const response = await apiClient.post<{ success: boolean }>(
        API_ENDPOINTS.CREATE_ASSIGNMENT,
        { workstationName, username }
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error assigning workstation:', error);
      return false;
    }
  },
  
  /**
   * Unassign a workstation from a user
   */
  async unassignWorkstation(workstationName: string): Promise<boolean> {
    try {
      if (!FEATURES.USE_BUCK_API) {
        console.log(`Mock: Unassigned workstation ${workstationName}`);
        return true;
      }
      
      // First we need to get the assignment ID
      const workstation = await this.getWorkstationByName(workstationName);
      if (!workstation || !workstation.assignedTo) {
        return false; // Already unassigned
      }
      
      // In a real implementation, you'd call the API with the actual assignment ID
      // For now, we'll use the workstation name as the ID
      const response = await apiClient.delete<{ success: boolean }>(
        API_ENDPOINTS.DELETE_ASSIGNMENT(workstationName)
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data?.success || false;
    } catch (error) {
      console.error('Error unassigning workstation:', error);
      return false;
    }
  },
  
  // ========== Policy Management ==========
  
  /**
   * Validate if a user can be assigned to a workstation based on policies
   */
  async validateAssignmentPolicy(username: string, workstationName: string): Promise<{ valid: boolean; message?: string }> {
    try {
      if (!FEATURES.USE_BUCK_API) {
        // Mock implementation - always valid
        return { valid: true };
      }
      
      const response = await apiClient.post<{ valid: boolean; message?: string }>(
        API_ENDPOINTS.POLICY_VALIDATION,
        { username, workstationName }
      );
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error validating assignment policy:', error);
      // Default to allowing the assignment when API is unavailable
      return { valid: true, message: 'Policy validation unavailable, proceeding with assignment' };
    }
  },
  
  /**
   * Get all policies
   */
  async getPolicies(): Promise<Policy[]> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<Policy[]>(API_ENDPOINTS.POLICIES);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data || [];
      },
      [], // Replace with mockPolicies
      'policies'
    );
  },
  
  // ========== Statistics and Metrics ==========
  
  /**
   * Get utilization metrics for dashboard
   */
  async getUtilizationMetrics(): Promise<UtilizationMetrics> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<UtilizationMetrics>(API_ENDPOINTS.UTILIZATION);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data;
      },
      {
        byLocation: { 'NY': 10, 'LA': 15, 'Remote': 8 },
        byDepartment: { 'Engineering': 12, 'Creative': 15, 'Production': 6 },
        byProject: { 'Project A': 8, 'Project B': 10, 'Project C': 5 },
        byTier: { 'Tier 1': 5, 'Tier 2': 12, 'Tier 3': 8 }
      },
      'utilization metrics'
    );
  },
  
  // ========== Audit Logs ==========
  
  /**
   * Get audit logs with pagination
   */
  async getAuditLogs(page: number = 1, pageSize: number = 20): Promise<PaginatedResponse<AuditLogEntry>> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<PaginatedResponse<AuditLogEntry>>(
          API_ENDPOINTS.AUDIT_LOGS,
          { page, pageSize }
        );
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data;
      },
      {
        data: [],
        total: 0,
        page,
        pageSize
      },
      'audit logs'
    );
  },
  
  // ========== Hardware and Software ==========
  
  /**
   * Get hardware specifications
   */
  async getHardwareSpecs(): Promise<HardwareSpecs[]> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<HardwareSpecs[]>(API_ENDPOINTS.HARDWARE_SPECS);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data || [];
      },
      [], // Replace with mockHardwareSpecs
      'hardware specifications'
    );
  },
  
  /**
   * Get software catalog
   */
  async getSoftware(): Promise<Software[]> {
    return await withFallback(
      async () => {
        const response = await apiClient.get<Software[]>(API_ENDPOINTS.SOFTWARE);
        
        if (response.error) {
          throw new Error(response.error);
        }
        
        return response.data || [];
      },
      [], // Replace with mockSoftware
      'software catalog'
    );
  }
};