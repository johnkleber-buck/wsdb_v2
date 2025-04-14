#!/usr/bin/env node

/**
 * This script fetches user data from the Okta API and extracts all unique values
 * for departments, locations, roles, statuses, etc. to create accurate filter options.
 */

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // If this is not available, you might need to install it with npm install node-fetch

// Constants
const OKTA_API_URL = 'http://api.buck.local:7000/buckokta/category/att/comparison/match';

async function fetchOktaUsers() {
  console.log(`Fetching data from Okta API: ${OKTA_API_URL}`);
  
  try {
    const response = await fetch(OKTA_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched data from Okta API');
    
    // Log some info about the response structure to help understand the data
    console.log('Response structure:', Object.keys(data));
    
    // Try to find the array of users in the response
    let users = [];
    
    if (Array.isArray(data)) {
      // The response itself is an array
      users = data;
      console.log(`Found ${users.length} users in the response array`);
    } else {
      // Check if any of these keys contain the user array
      const possibleUserArrayKeys = ['users', 'data', 'results', 'items', 'records', 'content'];
      
      for (const key of possibleUserArrayKeys) {
        if (data[key] && Array.isArray(data[key])) {
          users = data[key];
          console.log(`Found ${users.length} users in data.${key}`);
          break;
        }
      }
      
      // If we still haven't found users, try to use the entire object
      if (users.length === 0 && typeof data === 'object') {
        console.log('Could not find a user array, attempting to process the entire response...');
        
        // Turn object values into an array if they seem like user objects
        const objectValues = Object.values(data).filter(value => 
          value !== null && 
          typeof value === 'object' && 
          !Array.isArray(value)
        );
        
        if (objectValues.length > 0) {
          users = objectValues;
          console.log(`Extracted ${users.length} potential user objects from response`);
        }
      }
    }
    
    if (users.length === 0) {
      throw new Error('Could not find user data in the API response');
    }
    
    // Sample the first user to see its structure
    console.log('Sample user object structure:', JSON.stringify(users[0], null, 2).substring(0, 1000) + '...');
    
    return users;
  } catch (error) {
    console.error('Error fetching Okta user data:', error.message);
    return [];
  }
}

// Function to safely extract a field from different possible locations in a user object
function extractField(user, fieldName) {
  // Common paths where the field might be located
  const possiblePaths = [
    // Direct property
    fieldName,
    // In profile
    `profile.${fieldName}`,
    // In attributes
    `attributes.${fieldName}`,
    // Common variations of field names
    `user${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`,
    // Using camelCase
    fieldName.toLowerCase(),
    // Using snake_case
    fieldName.replace(/([A-Z])/g, '_$1').toLowerCase()
  ];
  
  // Additional paths for specific fields
  if (fieldName === 'role') {
    possiblePaths.push('profile.title', 'title', 'jobTitle', 'profile.jobTitle', 'position', 'profile.position');
  } else if (fieldName === 'department') {
    possiblePaths.push('profile.department', 'dept', 'profile.dept', 'division', 'profile.division');
  } else if (fieldName === 'location') {
    possiblePaths.push('profile.location', 'profile.office', 'office', 'site', 'profile.site');
  }
  
  for (const path of possiblePaths) {
    const value = getValueByPath(user, path);
    if (value && typeof value === 'string') {
      return value;
    }
  }
  
  return null;
}

// Helper function to get a value from an object using a dot notation path
function getValueByPath(obj, path) {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return null;
    }
    current = current[part];
  }
  
  return current;
}

// Extract unique values and generate filter options
async function generateFilterOptions() {
  const users = await fetchOktaUsers();
  
  if (users.length === 0) {
    console.log('No user data available. Using mock data as fallback...');
    // Load mock data as fallback
    const mockDataPath = path.join(__dirname, '..', 'app', 'mock', 'data.ts');
    if (fs.existsSync(mockDataPath)) {
      const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
      const usersMatch = mockDataContent.match(/export const mockUsers: User\[\] = \[([\s\S]*?)\];/);
      
      if (usersMatch) {
        const usersPart = usersMatch[1];
        // Convert TS array to valid JSON array content
        const usersJsonString = `[${usersPart}]`
          .replace(/(\w+):/g, '"$1":')
          .replace(/'/g, '"')
          .replace(/,(\s*[}\]])/g, '$1');
          
        try {
          const mockUsers = JSON.parse(usersJsonString);
          console.log(`Loaded ${mockUsers.length} mock users as fallback`);
          return processUsers(mockUsers, true);
        } catch (error) {
          console.error('Error parsing mock user data:', error);
        }
      }
    }
    
    console.error('Could not load user data from either API or mock data');
    process.exit(1);
  }
  
  return processUsers(users);
}

function processUsers(users, isMockData = false) {
  // Collect unique values for each field
  const departments = new Set();
  const locations = new Set();
  const roles = new Set();
  const statuses = new Set();
  const securityClearances = new Set();
  
  users.forEach(user => {
    // For mock data, we know the structure
    if (isMockData) {
      if (user.department) departments.add(user.department);
      if (user.location) locations.add(user.location);
      if (user.role) roles.add(user.role);
      if (user.status) statuses.add(user.status);
      if (user.securityClearance) securityClearances.add(user.securityClearance);
    } else {
      // For API data, try multiple possible field names
      const department = extractField(user, 'department') || 
                       extractField(user, 'dept') || 
                       extractField(user, 'division') || 
                       extractField(user, 'organizationalUnit');
      if (department) departments.add(department);
      
      const location = extractField(user, 'location') || 
                     extractField(user, 'office') || 
                     extractField(user, 'site') || 
                     extractField(user, 'region');
      if (location) locations.add(location);
      
      const role = extractField(user, 'role') || 
                 extractField(user, 'title') || 
                 extractField(user, 'jobTitle') || 
                 extractField(user, 'position');
      if (role) roles.add(role);
      
      const status = extractField(user, 'status') || 
                   extractField(user, 'userStatus') || 
                   extractField(user, 'employeeStatus');
      if (status) statuses.add(status);
      
      const clearance = extractField(user, 'securityClearance') || 
                      extractField(user, 'clearance') || 
                      extractField(user, 'accessLevel');
      if (clearance) securityClearances.add(clearance);
    }
  });
  
  // Format label for display (replace codes with friendly names)
  const formatLabel = (value) => {
    // Handle empty values
    if (!value) return '';
    
    // Convert to string just in case
    value = String(value);
    
    // Location code mapping
    const locationMap = {
      'NY': 'New York',
      'LA': 'Los Angeles',
      'AMS': 'Amsterdam',
      'SYD': 'Sydney',
      'BGA': 'Buck Global',
      'BUCK AMSTERDAM': 'Amsterdam',
      'BUCK LONDON': 'London',
      'BUCK SYDNEY': 'Sydney',
      'BUCK US (BROOKLYN)': 'New York',
      'BUCK US (LOS ANGELES)': 'Los Angeles',
      'YVR': 'Vancouver'
    };
    
    // Check for location codes (case insensitive)
    const upperValue = value.toUpperCase();
    if (locationMap[upperValue]) {
      return locationMap[upperValue];
    }
    
    // Department name formatting
    const departmentMap = {
      '2D': '2D',
      '3D': '3D',
      'IT': 'IT',
      'UX': 'UX'
    };
    
    // Status code mapping
    const statusMap = {
      'ACTIVE': 'Active',
      'INACTIVE': 'Inactive',
      'STAGED': 'Staged',
      'PROVISIONED': 'Provisioned',
      'SUSPENDED': 'Suspended',
      'PASSWORD_EXPIRED': 'Password Expired',
      'RECOVERY': 'Recovery',
      'ONPROJECT': 'On-Project',
      'ON_PROJECT': 'On-Project'
    };
    
    if (statusMap[upperValue]) {
      return statusMap[upperValue];
    }
    
    // Default: proper case each word with special handling for acronyms
    return value.split(' ')
      .map(word => {
        // Check if word is in department map (for acronyms)
        const upperWord = word.toUpperCase();
        if (departmentMap[upperWord]) {
          return departmentMap[upperWord];
        }
        
        // Handle "&" to make sure it doesn't get capitalized
        if (word.includes('&')) {
          return word.split('&')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('&');
        }
        
        // Standard word capitalization
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
  };
  
  // Generate options for each field with de-duplication by label
  const generateOptions = (values) => {
    const labelMap = new Map(); // Used to track unique labels
    
    // First pass - create initial options with formatted labels
    const initialOptions = [...values].map(value => ({
      value,
      label: formatLabel(value)
    }));
    
    // Second pass - de-duplicate by label (keep first occurrence)
    const uniqueOptions = [];
    initialOptions.forEach(option => {
      if (!labelMap.has(option.label.toLowerCase())) {
        labelMap.set(option.label.toLowerCase(), true);
        uniqueOptions.push(option);
      }
    });
    
    // Sort by label alphabetically
    return uniqueOptions.sort((a, b) => a.label.localeCompare(b.label));
  };
  
  // Special location normalization to consolidate similar locations
  const normalizeLocations = (locations) => {
    const locationMapping = {
      // Map any variations to standard codes
      'LA': 'LA',
      'LOS ANGELES': 'LA',
      'NEW YORK': 'NY',
      'NY': 'NY',
      'BROOKLYN': 'NY',
      'BUCK US (LOS ANGELES)': 'LA',
      'BUCK US (BROOKLYN)': 'NY',
      'LONDON': 'LON',
      'BUCK LONDON': 'LON',
      'AMSTERDAM': 'AMS',
      'BUCK AMSTERDAM': 'AMS',
      'AMS': 'AMS',
      'SYDNEY': 'SYD',
      'BUCK SYDNEY': 'SYD',
      'SYD': 'SYD',
    };
    
    // Create a label map for standard location names
    const displayNames = {
      'LA': 'Los Angeles',
      'NY': 'New York',
      'LON': 'London',
      'AMS': 'Amsterdam',
      'SYD': 'Sydney'
    };
    
    // Normalize locations to standard codes
    const normalizedLocations = new Set();
    locations.forEach(location => {
      const upperLoc = String(location).toUpperCase();
      const standardCode = locationMapping[upperLoc] || location;
      normalizedLocations.add(standardCode);
    });
    
    // Generate options with standard names
    const options = [...normalizedLocations].map(code => ({
      value: code,
      label: displayNames[code] || formatLabel(code)
    })).sort((a, b) => a.label.localeCompare(b.label));
    
    // Add the "All Locations" option at the beginning
    return [
      { value: '', label: 'All Locations' },
      ...options
    ];
  };
  
  // Create filter options object
  const filterOptions = {
    departments: [
      { value: '', label: 'All Departments' },
      ...generateOptions(departments)
    ],
    locations: normalizeLocations(locations),
    roles: [
      { value: '', label: 'All Roles' },
      ...generateOptions(roles)
    ],
    statuses: [
      { value: '', label: 'All Status' },
      ...generateOptions(statuses)
    ],
    securityClearances: [
      { value: '', label: 'All Clearance Levels' },
      ...generateOptions(securityClearances)
    ]
  };
  
  // Output the results
  console.log('Filter Options:');
  console.log('Departments:', filterOptions.departments.map(opt => opt.label).join(', '));
  console.log('Locations:', filterOptions.locations.map(opt => opt.label).join(', '));
  console.log('Roles:', filterOptions.roles.length, 'options');
  console.log('Statuses:', filterOptions.statuses.map(opt => opt.label).join(', '));
  console.log('Security Clearances:', filterOptions.securityClearances.map(opt => opt.label).join(', '));
  
  return filterOptions;
}

// Generate the filter options file
async function generateFilterOptionsFile() {
  const filterOptions = await generateFilterOptions();
  
  // Create output directory if it doesn't exist
  const outputDir = path.join(__dirname, '..', 'app', 'lib');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Write the filter options to a TypeScript file
  const outputPath = path.join(outputDir, 'filter-options.ts');
  const tsContent = `
/**
 * This file is auto-generated by scripts/fetch-okta-filter-options.js
 * Do not edit directly - regenerate if API data changes
 */

export interface FilterOption {
  value: string;
  label: string;
}

export const filterOptions = ${JSON.stringify(filterOptions, null, 2)};
`;

  fs.writeFileSync(outputPath, tsContent);
  console.log(`Filter options written to ${outputPath}`);
}

// Run the script
generateFilterOptionsFile().catch(error => {
  console.error('Error generating filter options:', error);
  process.exit(1);
});