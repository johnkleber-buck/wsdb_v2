import { User } from "@/app/types";
import { ApiResponse } from "@/app/types";
import { FEATURES } from "@/app/lib/utils";

// Constants
const OKTA_API_BASE_URL = FEATURES.API_BASE_URL;
const OKTA_USERS_ENDPOINT = '/buckokta/category/att/comparison/match';

// Interface for Okta API response
interface OktaApiResponse {
  results?: any[];  // Adjust based on actual response structure
  data?: any[];     // Alternate field name
  users?: OktaUser[]; // Original expected field
  items?: any[];    // Another possible field name
  total?: number;
  page?: number;
  limit?: number;
}

// Interface for Okta user data 
interface OktaUser {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string;    // Alternate field
  department?: string;
  title?: string;
  location?: string;
  status?: string;
  created?: string;
  lastLogin?: string;
  lastUpdated?: string;
  profile?: {
    [key: string]: any;
  };
  // Add any additional fields that might exist in the response
  [key: string]: any;
}

// Function to transform Okta user data to application user model
function mapOktaUserToAppUser(oktaUser: OktaUser): User {
  // Extract user information with fallbacks for different field names
  const username = oktaUser.username || 
                   oktaUser.email || 
                   oktaUser.login || 
                   (oktaUser.profile?.login) || 
                   `user-${Math.random().toString(36).substring(2, 8)}`;
                   
  const department = oktaUser.department || 
                    oktaUser.profile?.department || 
                    oktaUser.org || 
                    oktaUser.profile?.org || 
                    'Unassigned';
                    
  const location = oktaUser.location || 
                  oktaUser.profile?.location || 
                  oktaUser.office || 
                  oktaUser.profile?.office || 
                  'Unassigned';
                  
  const status = (oktaUser.status === 'ACTIVE' || oktaUser.profile?.status === 'ACTIVE') ? 
                'Active' : 'Inactive';
                
  const securityClearance = oktaUser.profile?.securityClearance || 
                          oktaUser.clearance ||
                          oktaUser.profile?.clearance ||
                          'Confidential';
                          
  const projectAssignment = oktaUser.profile?.projectAssignment || 
                          oktaUser.project ||
                          oktaUser.profile?.project;
                          
  const role = oktaUser.title || 
              oktaUser.profile?.title || 
              oktaUser.role || 
              oktaUser.profile?.role || 
              'Staff';
  
  // Log the mapping for debugging
  if (FEATURES.DEBUG_MODE) {
    console.log('Mapping Okta user:', { oktaUser, mappedUser: {
      username, department, location, status, securityClearance, projectAssignment, role
    }});
  }
              
  return {
    username,
    department,
    location,
    status,
    securityClearance,
    projectAssignment,
    role,
  };
}

// Okta service to handle Okta API interactions
export const oktaService = {
  // Get all active users from Okta
  async getActiveUsers(): Promise<User[]> {
    try {
      console.log(`Fetching Okta users from: ${OKTA_API_BASE_URL}${OKTA_USERS_ENDPOINT}`);
      
      // Turn on debug mode temporarily
      const previousDebugMode = FEATURES.DEBUG_MODE;
      FEATURES.DEBUG_MODE = true;
      
      const response = await fetch(`${OKTA_API_BASE_URL}${OKTA_USERS_ENDPOINT}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // Add a timeout to avoid hanging requests
        signal: AbortSignal.timeout(8000), // 8 second timeout
      });
      
      if (!response.ok) {
        console.error('Okta API error:', response.statusText);
        return [];
      }
      
      const rawData = await response.json();
      console.log('Raw API response structure:', Object.keys(rawData));
      
      // Try to find the user array in the response, regardless of its name
      let userArray: any[] = [];
      
      if (Array.isArray(rawData)) {
        // The response itself is an array
        userArray = rawData;
      } else {
        // Check various possible field names for the user array
        const possibleFieldNames = ['users', 'data', 'results', 'items', 'records', 'content'];
        
        for (const field of possibleFieldNames) {
          if (Array.isArray(rawData[field])) {
            userArray = rawData[field];
            console.log(`Found user array in field: ${field}`);
            break;
          }
        }
        
        // If still no array found, try to convert the object to an array if possible
        if (userArray.length === 0 && typeof rawData === 'object') {
          const objectValues = Object.values(rawData).filter(value => value !== null && typeof value === 'object');
          if (objectValues.length > 0) {
            userArray = objectValues;
            console.log('Converted object values to array');
          }
        }
      }
      
      console.log(`Found ${userArray.length} items in API response`);
      console.log('Sample item from response:', userArray.length > 0 ? JSON.stringify(userArray[0]).substring(0, 200) + '...' : 'No items');
      
      // Transform users to application user model
      const users = userArray.map(mapOktaUserToAppUser);
      
      // Restore debug mode
      FEATURES.DEBUG_MODE = previousDebugMode;
      
      console.log(`Successfully mapped ${users.length} users from Okta`);
      return users;
    } catch (error) {
      console.error('Error fetching Okta users:', error);
      // Re-throw to allow fallback to mock data
      throw error;
    }
  },
  
  // Get a single user from Okta by username
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      // In a real implementation, you would call a specific endpoint
      // For now, we'll fetch all and filter
      const allUsers = await this.getActiveUsers();
      
      // Case-insensitive search to be more forgiving
      const user = allUsers.find(
        user => user.username.toLowerCase() === username.toLowerCase()
      );
      
      if (!user) {
        console.log(`No user found with username: ${username}`);
        return null;
      }
      
      return user;
    } catch (error) {
      console.error(`Error fetching Okta user ${username}:`, error);
      return null;
    }
  },
};