import { getStudentApiKey } from '@/utils/authHeaders';
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

import type { RootState } from '../index';

// API Configuration
const API_CONFIG = {
  EXTERNAL_API:
    process.env.NEXT_PUBLIC_BaseURLAuth ||
    'https://apis.testkdlakshya.uchhal.in/auth',
  CLASS_API:
    process.env.NEXT_PUBLIC_BaseURLClass ||
    'https://apis.testkdlakshya.uchhal.in/class', // Base URL includes /class prefix
  WORKSPACE_API:
    process.env.NEXT_PUBLIC_BaseURLWorkspace ||
    'https://apis.testkdlakshya.uchhal.in',
};

/**
 * Set the Authorization header for whichever session is active.
 *
 * Staff (teacher/admin) authenticate with an Auth0 bearer token, which lives in
 * the Redux store. Students authenticate with an api key, which lives in
 * localStorage and never reaches Redux - so relying on the Redux token alone
 * sent student requests with no credential at all, and API Gateway answered
 * 401. Both credential kinds travel on `Authorization`; the scheme distinguishes
 * them, which is also what lets the gateway name that one header as the
 * authorizer's identity source.
 */
const applyAuthorization = (headers: Headers, state: RootState) => {
  const token = state.auth.token?.token;

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
    return;
  }

  const apiKey = getStudentApiKey();

  if (apiKey) {
    headers.set('Authorization', `ApiKey ${apiKey}`);
  }
};

// Base query with automatic token injection
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_CONFIG.EXTERNAL_API,
  timeout: 60000, // 60s timeout increased to prevent timeout errors
  prepareHeaders: (headers, { getState }) => {
    applyAuthorization(headers, getState() as RootState);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/vnd.api+json');
    }

    return headers;
  },
});

// Base query with retry logic for 500 errors (Lambda cold starts)
const baseQueryWithRetry: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  console.log('🔵 [RTK Query] Request:', args);

  let result = await baseQueryWithAuth(args, api, extraOptions);

  if (result.error) {
    console.error('🔴 [RTK Query] Error:', {
      args,
      error: result.error,
      status: result.error.status,
      // FETCH_ERROR variants carry no payload, so only read `data` when present.
      data: 'data' in result.error ? result.error.data : undefined,
    });
  } else {
    console.log('🟢 [RTK Query] Success:', {
      args,
      data: result.data,
    });
  }

  // Retry on 500 errors (Lambda cold start)
  if (result.error && result.error.status === 500) {
    console.log('🔄 Retrying request due to 500 error (Lambda cold start)...');
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s
    result = await baseQueryWithAuth(args, api, extraOptions);

    if (result.error) {
      console.error('🔴 [RTK Query] Retry failed:', result.error);
    } else {
      console.log('🟢 [RTK Query] Retry succeeded:', result.data);
    }
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  // Keep data for 5 minutes (300 seconds) - data persists in Redux store beyond this
  keepUnusedDataFor: 300,
  // Prevent automatic refetching on mount/focus/reconnect - only refetch when explicitly needed
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  // Tag types for cache invalidation
  tagTypes: [
    'User',
    'Organization',
    'Students',
    'Classes',
    'Teachers',
    'Fees',
    'Attendance',
    'Exams',
    'Subjects',
    'Results',
    'SiteConfig',
    'Content',
    'Gallery',
  ],
  endpoints: () => ({}),
});

// Base query for class API with auth
const classBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.CLASS_API,
  timeout: 30000,
  prepareHeaders: (headers, { getState }) => {
    applyAuthorization(headers, getState() as RootState);
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

// Class API query with retry logic for 500 errors
const classQueryWithRetry: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await classBaseQuery(args, api, extraOptions);

  // Retry on 500 errors (Lambda cold start)
  if (result.error && result.error.status === 500) {
    console.log(
      '🔄 [classApi] Retrying request due to 500 error (Lambda cold start)...',
    );
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s
    result = await classBaseQuery(args, api, extraOptions);
  }

  return result;
};

// Create separate API instances for different base URLs
export const classApi = createApi({
  reducerPath: 'classApi',
  baseQuery: classQueryWithRetry,
  keepUnusedDataFor: 300, // 5 minutes for classes
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  tagTypes: [
    'Classes',
    'ClassStudents',
    'Students',
    'Subjects',
    'Exams',
    'Fees',
    'Attendance',
  ],
  endpoints: () => ({}),
});

export const workspaceApi = createApi({
  reducerPath: 'workspaceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.WORKSPACE_API,
    timeout: 30000,
    prepareHeaders: (headers, { getState }) => {
      applyAuthorization(headers, getState() as RootState);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      return headers;
    },
  }),
  keepUnusedDataFor: 300, // 5 minutes
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  tagTypes: ['Files', 'S3'],
  endpoints: () => ({}),
});

// Public base query without authentication for public endpoints
const publicBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.EXTERNAL_API,
  timeout: 30000,
  prepareHeaders: (headers) => {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/vnd.api+json');
    }
    return headers;
  },
});

// Create public API for endpoints that don't require authentication
export const publicApi = createApi({
  reducerPath: 'publicApi',
  baseQuery: publicBaseQuery,
  keepUnusedDataFor: 300,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  tagTypes: ['Gallery', 'PublicContent'],
  endpoints: () => ({}),
});
