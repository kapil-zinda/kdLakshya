import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../index';

// API Configuration
const API_CONFIG = {
  EXTERNAL_API:
    process.env.NEXT_PUBLIC_BaseURLAuth ||
    'https://apis.testkdlakshya.uchhal.in/auth',
  CLASS_API:
    process.env.NEXT_PUBLIC_BaseURLClass ||
    'https://apis.testkdlakshya.uchhal.in', // Base domain only - paths are full in endpoints
  WORKSPACE_API:
    process.env.NEXT_PUBLIC_BaseURLWorkspace ||
    'https://apis.testkdlakshya.uchhal.in',
};

// Base query with automatic token injection
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: API_CONFIG.EXTERNAL_API,
  timeout: 30000, // 30s timeout for Lambda cold starts
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux store
    const token = (getState() as RootState).auth.token?.token;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    return headers;
  },
});

// Base query with retry logic for 500 errors (Lambda cold starts)
const baseQueryWithRetry = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  // Retry on 500 errors (Lambda cold start)
  if (result.error && result.error.status === 500) {
    console.log('🔄 Retrying request due to 500 error (Lambda cold start)...');
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s
    result = await baseQueryWithAuth(args, api, extraOptions);
  }

  return result;
};

// Create the base API
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  // Default cache time: 60 seconds
  keepUnusedDataFor: 60,
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
  ],
  endpoints: () => ({}),
});

// Create separate API instances for different base URLs
export const classApi = createApi({
  reducerPath: 'classApi',
  baseQuery: fetchBaseQuery({
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
  }),
  keepUnusedDataFor: 30, // 30 seconds for classes
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
  keepUnusedDataFor: 60,
  tagTypes: ['Files', 'S3'],
  endpoints: () => ({}),
});
