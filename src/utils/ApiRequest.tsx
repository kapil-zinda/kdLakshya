'use client';

import { userData } from '@/app/interfaces/userInterface';
import { getAuthHeaders } from '@/utils/authHeaders';
import axios, { type AxiosRequestConfig } from 'axios';

const BaseURL = process.env.NEXT_PUBLIC_BaseURL || '';
const BaseURLAuth =
  process.env.NEXT_PUBLIC_BaseURLAuth ||
  'https://apis.testkdlakshya.uchhal.in/auth';
const BaseURLWorkspace =
  process.env.NEXT_PUBLIC_BaseURLWorkspace ||
  'https://apis.testkdlakshya.uchhal.in/workspace';
// `ragentic`, not `ragantic`. The backend directory is services/ragantic and
// the frontend said ragantic, but the deployed api_mapping_key (and the
// Terraform stack) is `ragentic` - and an unmapped path answers
// `403 Missing Authentication Token`, not 404.
const BaseURLRagantic =
  process.env.NEXT_PUBLIC_BaseURLRagantic ||
  'https://apis.testkdlakshya.uchhal.in/ragentic';

interface ApiRequest {
  path: string;
  headers?: Record<string, string>;
  payload?: Record<string, unknown>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  baseUrl?: 'default' | 'auth' | 'workspace' | 'ragantic' | string; // Allow custom base URLs
  customAuthHeaders?: Record<string, string>; // Allow custom auth headers (e.g., x-api-key)
  skipAuth?: boolean; // Skip automatic auth header injection
}

const replacePathAndQueryParams = (
  path: string,
  params: Record<string, string | number>,
) => {
  const updatedUrl = Object.keys(params).reduce((updatedUrl, paramKey) => {
    return updatedUrl.replace(
      new RegExp(`{${paramKey}}`, 'g'),
      String(params[paramKey]),
    );
  }, path);

  return updatedUrl;
};

// In-flight GET request deduplication. Concurrent callers asking for the same
// URL share one promise; the entry is cleared once the request settles, so the
// next call goes back over the wire.
const inflightGetRequests = new Map<string, Promise<unknown>>();

const replacePayloadParams = (
  payload: Record<string, unknown>,
  params: Record<string, string | number>,
): Record<string, unknown> => {
  const replaceInValue = (value: unknown): unknown => {
    if (typeof value === 'string') {
      return Object.keys(params).reduce((str, key) => {
        return str.replace(new RegExp(`{${key}}`, 'g'), String(params[key]));
      }, value);
    } else if (typeof value === 'object' && value !== null) {
      // Recursively handle nested objects or arrays
      if (Array.isArray(value)) {
        return value.map(replaceInValue);
      } else {
        return Object.keys(value).reduce(
          (newObj, key) => {
            newObj[key] = replaceInValue(
              (value as Record<string, unknown>)[key],
            );
            return newObj;
          },
          {} as Record<string, unknown>,
        );
      }
    }
    return value; // If it's not a string or object, return as is
  };

  return replaceInValue(payload) as Record<string, unknown>;
};

export const makeApiCall = async ({
  path,
  headers = {},
  payload = {},
  method = 'GET',
  baseUrl = 'default',
  customAuthHeaders,
  skipAuth = false,
}: ApiRequest) => {
  const pathParams = {
    org_id: userData.orgId,
    user_id: userData.userId,
    user_key_id: userData.keyId,
  };

  const updatedPath = replacePathAndQueryParams(path, pathParams);

  const updatedPayload = replacePayloadParams(payload, pathParams);

  // Determine which base URL to use
  let selectedBaseUrl: string;
  if (baseUrl === 'auth') {
    selectedBaseUrl = BaseURLAuth;
  } else if (baseUrl === 'workspace') {
    selectedBaseUrl = BaseURLWorkspace;
  } else if (baseUrl === 'ragantic') {
    selectedBaseUrl = BaseURLRagantic;
  } else if (baseUrl === 'default') {
    selectedBaseUrl = BaseURL;
  } else {
    // Custom base URL provided
    selectedBaseUrl = baseUrl;
  }

  const fullUrl = `${selectedBaseUrl}${updatedPath}`;

  // Get auth headers based on user type (student or admin/teacher)
  // Use custom auth headers if provided, otherwise use default
  let authHeaders: Record<string, string> = {};
  if (!skipAuth) {
    if (customAuthHeaders) {
      authHeaders = customAuthHeaders;
    } else {
      authHeaders = getAuthHeaders();
    }
  }

  const config: AxiosRequestConfig = {
    url: fullUrl,
    method,
    headers: {
      'Content-Type': 'application/vnd.api+json', // Default header
      ...headers, // Custom headers can override default
      ...authHeaders,
    },
    ...(method === 'POST' || method === 'PUT' || method === 'PATCH'
      ? { data: updatedPayload }
      : { data: {} }), // Force empty data object for GET/DELETE to preserve Content-Type header
    transformRequest: [
      (data, requestHeaders) => {
        // Ensure Content-Type is always vnd.api+json and never gets overridden by axios
        const contentType = requestHeaders.get('Content-Type');
        if (
          typeof contentType !== 'string' ||
          !contentType.includes('vnd.api+json')
        ) {
          requestHeaders.set('Content-Type', 'application/vnd.api+json');
        }
        return JSON.stringify(data);
      },
    ],
  };

  const executeRequest = async () => {
    try {
      const response = await axios(config);

      return response.data;
    } catch (error) {
      // Never log `config.headers` or the response headers: they carry the
      // Authorization value, which is a live Auth0 bearer token for staff and
      // base64(username:date-of-birth) for students. This used to print on
      // every request, in production, putting a replayable credential in the
      // browser console for anything with devtools or console access to read.
      //
      // Route/method/status is enough to locate a failure; the body is
      // deliberately omitted too, since request payloads carry student PII.
      if (axios.isAxiosError(error)) {
        console.error('API call failed', {
          url: fullUrl,
          method,
          status: error.response?.status,
          message: error.message,
        });
      } else {
        console.error('API call failed', {
          url: fullUrl,
          method,
          message: error instanceof Error ? error.message : String(error),
        });
      }
      throw error;
    }
  };

  // Dedupe concurrent identical GETs so multiple components mounting at once
  // (e.g. Providers + DashboardWrapper + PravahaChat) share a single network
  // round-trip instead of racing.
  if (method === 'GET') {
    const dedupeKey = `GET:${fullUrl}`;
    const existing = inflightGetRequests.get(dedupeKey);
    if (existing) {
      return existing;
    }

    const promise = executeRequest().finally(() => {
      inflightGetRequests.delete(dedupeKey);
    });
    inflightGetRequests.set(dedupeKey, promise);
    return promise;
  }

  return executeRequest();
};
