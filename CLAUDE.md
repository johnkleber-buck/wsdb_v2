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
- The data source toggle in the top-right corner of the dashboard switches between mock data and Okta API data

#### Filter Options
- Filter options are stored in `app/lib/filter-options.ts`
- This file is auto-generated - do not edit it directly
- Options include departments, locations, roles, and statuses
- Location codes (NY, LA) are automatically mapped to full names

#### Assignment Functionality
- The workstation assignment feature is implemented in `AssignmentPanel.tsx`
- When a user and workstation are selected, the panel shows assignment options
- Assignments are stored in memory during the session (refreshing the page will reset)
- In a production environment, this would call the API endpoints in `workstation-service.ts`

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