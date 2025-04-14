import { Workstation, PaginatedResponse, WorkstationFilters } from "@/app/types";
import { apiClient, fetchPaginated } from "./api-client";

// Constants
const WORKSTATIONS_API_PATH = "/workstations";

// Workstation service to handle workstation-related API calls
export const workstationService = {
  // Get a paginated list of workstations with optional filters
  async getWorkstations(
    page: number = 1,
    pageSize: number = 10,
    filters?: WorkstationFilters
  ): Promise<PaginatedResponse<Workstation>> {
    return fetchPaginated<Workstation>(WORKSTATIONS_API_PATH, page, pageSize, filters);
  },

  // Get a single workstation by machine name
  async getWorkstation(machineName: string): Promise<Workstation | null> {
    const response = await apiClient.get<Workstation>(
      `${WORKSTATIONS_API_PATH}/${machineName}`
    );
    
    if (response.error) {
      return null;
    }
    
    return response.data;
  },

  // Assign a workstation to a user
  async assignWorkstation(machineName: string, username: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      `${WORKSTATIONS_API_PATH}/${machineName}/assign`,
      { username }
    );
    
    return !response.error && response.data.success;
  },

  // Unassign a workstation from a user
  async unassignWorkstation(machineName: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(
      `${WORKSTATIONS_API_PATH}/${machineName}/unassign`,
      {}
    );
    
    return !response.error && response.data.success;
  },

  // Update workstation status
  async updateStatus(machineName: string, status: string): Promise<boolean> {
    const response = await apiClient.put<Workstation>(
      `${WORKSTATIONS_API_PATH}/${machineName}/status`,
      { status }
    );
    
    return !response.error;
  },

  // Check if a workstation-user assignment would comply with policies
  async checkPolicyCompliance(machineName: string, username: string): Promise<{
    compliant: boolean;
    issues?: string[];
  }> {
    const response = await apiClient.post<{
      compliant: boolean;
      issues?: string[];
    }>(
      `${WORKSTATIONS_API_PATH}/${machineName}/check-policy`,
      { username }
    );
    
    if (response.error) {
      return { compliant: false, issues: [response.error] };
    }
    
    return response.data;
  },

  // Get workstation utilization metrics
  async getUtilizationMetrics(): Promise<any> {
    const response = await apiClient.get<any>(
      `${WORKSTATIONS_API_PATH}/metrics/utilization`
    );
    
    if (response.error) {
      return {};
    }
    
    return response.data;
  },
};
