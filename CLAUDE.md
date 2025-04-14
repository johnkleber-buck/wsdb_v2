# WSDB Dashboard Development Guide

## Project Setup Notes

### Tailwind CSS Configuration

- This project uses Tailwind CSS v3.4.1, not v4
- PostCSS config should use standard `tailwindcss` plugin, not `@tailwindcss/postcss`
- CSS variables are defined in `globals.css` and used across components
- Use proper HSL syntax with alpha value: `hsl(var(--color) / <alpha-value>)`

### Component Structure
- Main dashboard is in `DashboardLayout.tsx` - this contains the full UI with users, workstations and assignment features
- `SimpleDashboardWithCards.tsx` is a reduced version - don't use this for production
- Always use the main page with `<DashboardLayout />` for production

### Data Integration

#### Okta API Integration
- API endpoint for user data: `http://api.buck.local:7000/buckokta/category/att/comparison/match`
- Filter options are generated from Okta data using the script at `scripts/fetch-okta-filter-options.js`
- Run this script to regenerate filter options when Okta data changes:
  ```
  node scripts/fetch-okta-filter-options.js
  ```
- The Okta data source toggle in the top-right corner of the dashboard switches between mock data and Okta API data for user information

#### BUCK API Integration
- Full API integration endpoint: `http://core-tools.buck.local:7000`
- The BUCK API service provides comprehensive endpoints for:
  - Workstation management
  - Assignment tracking
  - Policy validation
  - User management
  - Utilization metrics
  - Audit logging
- The BUCK API toggle in the top-right corner enables real API access for workstation data
- When enabled, all workstation operations (assignments, statuses, policies) use the API
- API failures automatically fall back to mock data to prevent UI disruption

#### Filter Options
- Filter options are stored in `app/lib/filter-options.ts`
- This file is auto-generated - do not edit it directly
- Options include departments, locations, roles, and statuses
- Location codes (NY, LA) are automatically mapped to full names

#### Assignment Functionality
- The workstation assignment feature is implemented in `AssignmentPanel.tsx`
- When a user and workstation are selected, the panel shows assignment options
- Policy validation checks if the assignment is allowed based on defined rules
- When BUCK API is enabled:
  - Assignments use the `buckApiService.assignWorkstation()` endpoint
  - Unassignments use the `buckApiService.unassignWorkstation()` endpoint
  - Policy validation uses the `buckApiService.validateAssignmentPolicy()` endpoint
- When using mock data:
  - Assignments are stored in memory during the session (refreshing the page will reset)
  - Policy validation uses local rules (location matching, security clearance, role restrictions)

### Build & Development
- Use `npm run dev` for local development
- Use `npm run build` for production builds
- Before deployment, always check that:
  1. Tailwind CSS is properly configured
  2. The main app page is importing `DashboardLayout` not any simplified test component
  3. CSS variables in globals.css match those used in component styles

### Common Issues & Solutions
- If you see Tailwind utility class errors, check PostCSS config and tailwind.config.js
- If dashboard features are missing, ensure you're using `DashboardLayout` component
- If toast notifications don't work, check that `ToastProvider` is properly set up in layout.tsx
- If filter dropdowns don't show options, run the filter options script to regenerate them
- If Okta API data fails to load, the system will automatically fall back to mock data
- If BUCK API fails to connect, check the API endpoint in `app/lib/utils.ts` and ensure the server is running
- API feature toggles can be controlled in `app/lib/utils.ts`:
  - `USE_OKTA_DATA`: Toggle Okta API integration for user data
  - `USE_BUCK_API`: Toggle BUCK API integration for workstation management
  - `API_BASE_URL`: Set the base URL for API endpoints
  - `DEBUG_MODE`: Enable or disable detailed console logging