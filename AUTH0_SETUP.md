# Auth0 Configuration for Multi-Subdomain Support

## Overview

This application uses a centralized authentication flow where all Auth0 authentication happens on the `auth.uchhal.in` subdomain, then redirects users back to their organization's subdomain after successful authentication.

## Authentication Flow

### Complete User Journey

#### Admin/Teacher Login Flow (Auth0)

1. **User visits their organization subdomain** (e.g., `spd.uchhal.in/`)
2. **Clicks login button** → Application stores the origin subdomain in sessionStorage
3. **Redirects to auth subdomain** → `auth.uchhal.in/login`
4. **Clicks Admin/Teacher Login** → Redirects to Auth0
5. **Auth0 authentication** → User completes Auth0 login flow
6. **Auth0 callback** → Redirects back to `auth.uchhal.in/` with auth code
7. **AuthHandler processes authentication** → Fetches user data and organization info
8. **Final redirect** → Redirects to user's organization subdomain `{user-org}.uchhal.in/dashboard`

#### Student Login Flow (Basic Auth)

1. **User visits their organization subdomain** (e.g., `spd.uchhal.in/`)
2. **Clicks login button** → Application stores the origin subdomain in sessionStorage
3. **Redirects to auth subdomain** → `auth.uchhal.in/login`
4. **Enters credentials** → First name and date of birth
5. **Student authentication API call** → Backend validates credentials
6. **Authentication successful** → Student data stored in localStorage
7. **Final redirect** → Redirects back to origin subdomain `spd.uchhal.in/dashboard` with student auth data in URL hash
8. **Landing on org subdomain** → Processes student auth data from hash and stores in localStorage

### Key Benefits

- **Centralized Authentication**: All authentication (Auth0 and student login) happens on one subdomain (`auth.uchhal.in`)
- **Single Callback URL**: Simplified Auth0 configuration with only auth subdomain as callback
- **Automatic Org Routing**: Users are automatically routed to their organization's subdomain based on their user data
- **Cross-Subdomain Token Sharing**: Access tokens and student auth data are passed via URL hash for seamless authentication
- **Unified Login Experience**: Both admin/teacher and student login flows follow the same subdomain routing pattern

## Required Auth0 Configuration Changes

### 1. Allowed Callback URLs

**Production:**

- `https://auth.uchhal.in/`

**Development:**

- `http://auth.localhost:3000/`

### 2. Allowed Web Origins

**Production:**

- `https://auth.uchhal.in`
- `https://spd.uchhal.in` (add all org subdomains that need to access Auth0)
- `https://math.uchhal.in` (example - add more as needed)

**Development:**

- `http://auth.localhost:3000`
- `http://localhost:3000`

### 3. Allowed Logout URLs

**Production:**

- `https://auth.uchhal.in/`
- `https://spd.uchhal.in/` (add all org subdomains)
- `https://math.uchhal.in/` (example - add more as needed)

**Development:**

- `http://auth.localhost:3000/`
- `http://localhost:3000/`

## Implementation Details

### Files Modified

1. **`src/hooks/useAuth.ts`**

   - Updated `login()` function to redirect to `auth.uchhal.in/login`
   - Stores origin subdomain in sessionStorage for post-auth redirect

2. **`src/app/login/page.tsx`**

   - Updated `handleAdminTeacherLogin()` to always use `auth.uchhal.in` as Auth0 callback
   - Preserves origin subdomain for final redirect

3. **`src/components/auth/AuthHandler.tsx`**

   - Enhanced redirect logic to detect when user is on `auth` subdomain
   - Automatically redirects to user's organization subdomain after authentication
   - Passes access token via URL hash for cross-subdomain authentication

4. **`src/middleware.ts`** (NEW)
   - Intercepts `/login` requests on org subdomains and redirects to `auth.uchhal.in/login`
   - Prevents access to `/dashboard` on auth subdomain
   - Ensures proper routing across all subdomains

### How It Works

#### Step-by-Step Technical Flow

##### Admin/Teacher (Auth0) Flow

1. **Login Initiation** (`useAuth.ts:login()`)

   ```
   User on: spd.uchhal.in
   Action: Clicks login
   Stores: sessionStorage.loginOriginSubdomain = 'spd'
   Redirects to: auth.uchhal.in/login
   ```

2. **Auth0 Redirect** (`login/page.tsx:handleAdminTeacherLogin()`)

   ```
   User on: auth.uchhal.in/login
   Action: Clicks Admin/Teacher Login
   Redirects to: Auth0 with callback=auth.uchhal.in/
   ```

3. **Auth0 Callback** (`page.tsx:handleAuth0Callback()`)

   ```
   User returns to: auth.uchhal.in/#access_token=...
   Action: Processes token, fetches user data
   Stores: localStorage.cachedUserData, localStorage.bearerToken
   ```

4. **Organization Redirect** (`AuthHandler.tsx:handleUserLogin()`)

   ```
   User on: auth.uchhal.in
   Action: Fetches org data, determines user's org subdomain
   Redirects to: {user-org}.uchhal.in/dashboard#access_token=...
   ```

5. **Final Landing** (`page.tsx:handleAuth0Callback()`)
   ```
   User lands on: spd.uchhal.in/dashboard#access_token=...
   Action: Processes token from hash, stores auth data
   Result: User authenticated on their org subdomain
   ```

##### Student Login Flow

1. **Login Initiation** (`useAuth.ts:login()`)

   ```
   User on: spd.uchhal.in
   Action: Clicks login
   Stores: sessionStorage.loginOriginSubdomain = 'spd'
   Redirects to: auth.uchhal.in/login
   ```

2. **Student Authentication** (`login/page.tsx:handleStudentLogin()`)

   ```
   User on: auth.uchhal.in/login
   Action: Enters first name and date of birth, submits form
   API Call: POST /students/auth with credentials
   Stores: localStorage.studentAuth, localStorage.bearerToken
   ```

3. **Return to Org Subdomain** (`login/page.tsx:handleStudentLogin()`)

   ```
   User on: auth.uchhal.in
   Action: Detects loginOriginSubdomain from sessionStorage
   Redirects to: spd.uchhal.in/dashboard#student_auth=<encoded_data>
   ```

4. **Final Landing** (`page.tsx:handleAuth0Callback()`)
   ```
   User lands on: spd.uchhal.in/dashboard#student_auth=...
   Action: Processes student auth data from hash, stores in localStorage
   Result: Student authenticated on their org subdomain
   ```

### Environment Variables

Required environment variables:

```env
# Auth0 Configuration
NEXT_PUBLIC_Auth0_DOMAIN_NAME=dev-p3hppyisuuaems5y.us.auth0.com
NEXT_PUBLIC_AUTH0_Client_Id=your-client-id-here

# Backend API
NEXT_PUBLIC_BaseURLAuth=https://apis.testkdlakshya.uchhal.in/auth
```

## Testing

### Development Testing (localhost)

#### Admin/Teacher Login Testing

1. Set up hosts file for subdomain testing:

   ```
   127.0.0.1 auth.localhost
   127.0.0.1 spd.localhost
   127.0.0.1 math.localhost
   ```

2. Visit `http://spd.localhost:3000`
3. Click login button
4. Should redirect to `http://auth.localhost:3000/login`
5. Click "Admin / Teacher Login" button
6. Complete Auth0 authentication
7. Should return to `http://auth.localhost:3000/`
8. Should automatically redirect to `http://spd.localhost:3000/dashboard`

#### Student Login Testing

1. Visit `http://spd.localhost:3000`
2. Click login button
3. Should redirect to `http://auth.localhost:3000/login`
4. Enter student credentials (first name and date of birth)
5. Click "Sign In as Student"
6. Should redirect to `http://spd.localhost:3000/dashboard` with student auth data
7. Verify student is logged in and can access dashboard

### Production Testing

#### Admin/Teacher Login Testing

1. Visit `https://spd.uchhal.in`
2. Click login button
3. Should redirect to `https://auth.uchhal.in/login`
4. Click "Admin / Teacher Login" button
5. Complete Auth0 authentication
6. Should return to `https://auth.uchhal.in/`
7. Should automatically redirect to `https://spd.uchhal.in/dashboard`

#### Student Login Testing

1. Visit `https://spd.uchhal.in`
2. Click login button
3. Should redirect to `https://auth.uchhal.in/login`
4. Enter student credentials (first name and date of birth)
5. Click "Sign In as Student"
6. Should redirect to `https://spd.uchhal.in/dashboard` with student auth data
7. Verify student is logged in and can access dashboard

## Troubleshooting

### Common Issues

1. **Infinite redirect loop**

   - Check that Auth0 callback URL is set to `auth.uchhal.in/` only
   - Verify middleware is not blocking the authentication flow
   - Check browser console for redirect logs

2. **Token not found after redirect**

   - Ensure access token is being passed via URL hash (`#access_token=...`)
   - Check that `page.tsx:handleAuth0Callback()` is processing the hash
   - Verify localStorage permissions are enabled

3. **Wrong subdomain after login**

   - Verify user's `orgId` in database matches organization subdomain
   - Check `AuthHandler` logs for organization data fetch
   - Ensure API endpoint `/organizations/{id}` returns correct subdomain

4. **CORS errors**

   - Add all org subdomains to Auth0 "Allowed Web Origins"
   - Verify backend API allows requests from all subdomains
   - Check browser network tab for failed CORS preflight requests

5. **Student auth not persisting after redirect**
   - Check that student auth data is being passed in URL hash correctly
   - Verify `page.tsx:handleAuth0Callback()` is detecting `student_auth` parameter
   - Ensure localStorage.studentAuth is being set on org subdomain
   - Check browser console for student auth processing logs

### Debug Logging

The application includes extensive console logging for debugging:

- 🔑 Auth-related operations (Admin/Teacher)
- 🎓 Student login operations
- 🔄 Redirects and navigation
- 💾 Data storage operations
- 🏢 Organization data fetches
- ⚠️ Warnings and errors
- 📡 API calls and responses

Check browser console for detailed flow information.

### Key Differences Between Flows

| Feature                  | Admin/Teacher (Auth0)             | Student (Basic Auth)               |
| ------------------------ | --------------------------------- | ---------------------------------- |
| Authentication Method    | OAuth2 (Auth0)                    | Username/Password (Backend API)    |
| Callback Method          | Auth0 redirects to auth.uchhal.in | Direct API response                |
| Token Type               | Bearer Token (JWT)                | Basic Auth Token                   |
| Cross-subdomain Transfer | URL hash with access_token        | URL hash with student_auth         |
| User Data Fetch          | After Auth0 callback from backend | Returned directly in auth response |
| Storage                  | localStorage.cachedUserData       | localStorage.studentAuth           |
