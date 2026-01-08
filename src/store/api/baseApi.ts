import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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

// Base query with automatic token injection
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_CONFIG.EXTERNAL_API,
  timeout: 60000, // 60s timeout increased to prevent timeout errors
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux store
    const token = (getState() as RootState).auth.token?.token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/vnd.api+json');
    }

    return headers;
  },
});

// Base query with retry logic for 500 errors (Lambda cold starts)
const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  console.log('🔵 [RTK Query] Request:', args);

  let result = await baseQueryWithAuth(args, api, extraOptions);

  if (result.error) {
    console.error('🔴 [RTK Query] Error:', {
      args,
      error: result.error,
      status: (result.error as any).status,
      data: (result.error as any).data,
    });
  } else {
    console.log('🟢 [RTK Query] Success:', {
      args,
      data: result.data,
    });
  }

  // Retry on 500 errors (Lambda cold start)
  if (result.error && (result.error as any).status === 500) {
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
    const token = (getState() as RootState).auth.token?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
      console.log('🔑 [classApi] Token added to headers');
    } else {
      console.warn('⚠️ [classApi] No token found in Redux store');
    }
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

// Class API query with retry logic for 500 errors
const classQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
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
      const token = (getState() as RootState).auth.token?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
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
