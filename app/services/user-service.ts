import { User, PaginatedResponse, UserFilters } from "@/app/types";
import { apiClient, fetchPaginated } from "./api-client";

// Constants
const USERS_API_PATH = "/users";

// User service to handle user-related API calls
export const userService = {
  // Get a paginated list of users with optional filters
  async getUsers(
    page: number = 1,
    pageSize: number = 10,
    filters?: UserFilters
  ): Promise<PaginatedResponse<User>> {
    return fetchPaginated<User>(USERS_API_PATH, page, pageSize, filters);
  },

  // Get a single user by username
  async getUser(username: string): Promise<User | null> {
    const response = await apiClient.get<User>(
      `${USERS_API_PATH}/${username}`
    );
    
    if (response.error) {
      return null;
    }
    
    return response.data;
  },

  // Get a user's assigned workstation
  async getUserWorkstation(username: string): Promise<string | null> {
    const response = await apiClient.get<{ machineName: string | null }>(
      `${USERS_API_PATH}/${username}/workstation`
    );
    
    if (response.error || !response.data.machineName) {
      return null;
    }
    
    return response.data.machineName;
  },

  // Update user status
  async updateUserStatus(username: string, status: string): Promise<boolean> {
    const response = await apiClient.put<User>(
      `${USERS_API_PATH}/${username}/status`,
      { status }
    );
    
    return !response.error;
  },

  // Get user assignment history
  async getUserAssignmentHistory(username: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(
      `${USERS_API_PATH}/${username}/assignment-history`
    );
    
    if (response.error) {
      return [];
    }
    
    return response.data;
  },

  // Get department-based metrics for users
  async getDepartmentMetrics(): Promise<Record<string, number>> {
    const response = await apiClient.get<Record<string, number>>(
      `${USERS_API_PATH}/metrics/departments`
    );
    
    if (response.error) {
      return {};
    }
    
    return response.data;
  },
};
