import { User, PaginatedResponse, UserFilters } from "@/app/types";
import { apiClient, fetchPaginated } from "./api-client";
import { oktaService } from "./okta-service";
import { mockUsers } from "@/app/mock/data";

// Constants
const USERS_API_PATH = "/users";

// Helper to filter users based on filters
function filterUsers(users: User[], filters?: UserFilters): User[] {
  if (!filters) return users;
  
  return users.filter(user => {
    // Apply department filter
    if (filters.department && user.department !== filters.department) {
      return false;
    }
    
    // Apply location filter with special handling for Giant Ant
    if (filters.location) {
      if (filters.location === "BGA") {
        // For Giant Ant, match any of the Giant Ant location codes
        if (user.location !== "BGA" && 
            user.location !== "YVR" && 
            user.location !== "Giant Ant (Vancouver)") {
          return false;
        }
      } else if (user.location !== filters.location) {
        return false;
      }
    }
    
    // Apply role filter
    if (filters.role && user.role !== filters.role) {
      return false;
    }
    
    // Apply status filter (case insensitive)
    if (filters.status && 
        user.status.toUpperCase() !== filters.status.toUpperCase()) {
      return false;
    }
    
    return true;
  });
}

// User service to handle user-related API calls
export const userService = {
  // Get a paginated list of users with optional filters
  async getUsers(
    page: number = 1,
    pageSize: number = 10,
    filters?: UserFilters,
    useOkta: boolean = false
  ): Promise<PaginatedResponse<User>> {
    try {
      if (useOkta) {
        // Fetch users from Okta service
        const oktaUsers = await oktaService.getActiveUsers();
        
        // Apply filters
        const filteredUsers = filterUsers(oktaUsers, filters);
        
        // Paginate results
        const startIndex = (page - 1) * pageSize;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
        
        return {
          data: paginatedUsers,
          total: filteredUsers.length,
          page,
          pageSize
        };
      } else {
        // Use existing API if available, or fallback to mock data
        try {
          return await fetchPaginated<User>(USERS_API_PATH, page, pageSize, filters);
        } catch (error) {
          console.log('Using mock data because API call failed:', error);
          
          // Filter mock data
          const filteredUsers = filterUsers(mockUsers, filters);
          
          // Paginate results
          const startIndex = (page - 1) * pageSize;
          const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);
          
          return {
            data: paginatedUsers,
            total: filteredUsers.length,
            page,
            pageSize
          };
        }
      }
    } catch (error) {
      console.error('Error getting users:', error);
      return {
        data: [],
        total: 0,
        page,
        pageSize
      };
    }
  },

  // Get a single user by username
  async getUser(username: string, useOkta: boolean = false): Promise<User | null> {
    try {
      if (useOkta) {
        return await oktaService.getUserByUsername(username);
      } else {
        // Try the API first
        try {
          const response = await apiClient.get<User>(`${USERS_API_PATH}/${username}`);
          if (response.error) throw new Error(response.error);
          return response.data;
        } catch (error) {
          // Fallback to mock data
          return mockUsers.find(user => user.username === username) || null;
        }
      }
    } catch (error) {
      console.error(`Error getting user ${username}:`, error);
      return null;
    }
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
