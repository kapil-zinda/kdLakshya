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
//
// Each path segment below MUST match the api_mapping_key the gateway is
// actually deployed under (swaroop/terraform/<service>/api_gw.tf). A mismatch
// does not 404 - API Gateway answers an unmapped path with
// `403 Missing Authentication Token`, and because gateway-generated errors
// carry no CORS headers the browser reports an opaque network failure. So a
// one-character typo here surfaces as "the API randomly returns 403".
//
// Three were wrong: CLASS_API said `/class` against a deployed `classes`,
// WORKSPACE_API omitted its `/workspace` prefix entirely while the endpoint
// paths assume it, and the ragantic base (in utils/ApiRequest.tsx) said
// `ragantic` against a deployed `ragentic`.
const API_CONFIG = {
  EXTERNAL_API:
    process.env.NEXT_PUBLIC_BaseURLAuth ||
    'https://apis.testkdlakshya.uchhal.in/auth',
  CLASS_API:
    process.env.NEXT_PUBLIC_BaseURLClass ||
    'https://apis.testkdlakshya.uchhal.in/classes',
  WORKSPACE_API:
    process.env.NEXT_PUBLIC_BaseURLWorkspace ||
    'https://apis.testkdlakshya.uchhal.in/workspace',
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

/**
 * Whether a failed request may be sent again.
 *
 * Only idempotent methods. The retry below exists for Lambda cold starts, but
 * it used to fire on any 500 whatever the method - and the backend returns 500
 * for several cases where the write has already been committed: response-schema
 * validation running after the handler, and InvalidPayload/Conflict/InvalidInput
 * all mapped to 500 instead of 400/409. So a POST that had actually succeeded
 * was sent a second time, producing duplicate students, duplicate fee payments
 * and duplicate enrollments. Retrying is only ever safe when repeating the call
 * cannot change server state.
 *
 * A bare string arg is a URL with no method, which fetchBaseQuery treats as GET.
 */
const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

const isRetriable = (args: string | FetchArgs): boolean =>
  typeof args === 'string'
    ? true
    : IDEMPOTENT_METHODS.has((args.method ?? 'GET').toUpperCase());

// Base query with retry logic for 500 errors (Lambda cold starts)
const baseQueryWithRetry: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  // Retry on 500 (Lambda cold start) - reads only, never writes.
  if (result.error && result.error.status === 500 && isRetriable(args)) {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s
    result = await baseQueryWithAuth(args, api, extraOptions);
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

  // Retry on 500 (Lambda cold start) - reads only. See isRetriable above.
  if (result.error && result.error.status === 500 && isRetriable(args)) {
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
