import { ApiResponse, PaginatedResponse } from "@/app/types";

// Base API URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// API Client class for handling API requests
export class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Set auth token for authenticated requests
  setAuthToken(token: string) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Clear auth token
  clearAuthToken() {
    delete this.headers['Authorization'];
  }

  // Generic GET request
  async get<T>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${path}`);
      
      // Add query parameters if provided
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { data: {} as T, error: errorData.message || 'API request failed' };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { data: {} as T, error: 'Failed to fetch data' };
    }
  }

  // Generic POST request
  async post<T>(path: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { data: {} as T, error: errorData.message || 'API request failed' };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { data: {} as T, error: 'Failed to submit data' };
    }
  }

  // Generic PUT request
  async put<T>(path: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { data: {} as T, error: errorData.message || 'API request failed' };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { data: {} as T, error: 'Failed to update data' };
    }
  }

  // Generic DELETE request
  async delete<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        headers: this.headers,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return { data: {} as T, error: errorData.message || 'API request failed' };
      }
      
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return { data: {} as T, error: 'Failed to delete data' };
    }
  }
}

// Create and export a default instance
export const apiClient = new ApiClient();

// Export some common API utilities
export async function fetchPaginated<T>(
  path: string, 
  page: number = 1, 
  pageSize: number = 10,
  filters?: Record<string, any>
): Promise<PaginatedResponse<T>> {
  const params = {
    page,
    pageSize,
    ...filters,
  };
  
  const response = await apiClient.get<PaginatedResponse<T>>(path, params);
  
  if (response.error) {
    return {
      data: [],
      total: 0,
      page,
      pageSize,
    };
  }
  
  return response.data;
}
