'use client';

import { userData } from '@/app/interfaces/userInterface';
import { getAuthHeaders } from '@/utils/authHeaders';
import axios from 'axios';

const BaseURL = process.env.NEXT_PUBLIC_BaseURL || '';
const BaseURLAuth =
  process.env.NEXT_PUBLIC_BaseURLAuth ||
  'https://apis.testkdlakshya.uchhal.in/auth';
const BaseURLWorkspace =
  process.env.NEXT_PUBLIC_BaseURLWorkspace ||
  'https://apis.testkdlakshya.uchhal.in/workspace';

interface ApiRequest {
  path: string;
  headers?: Record<string, string>;
  payload?: Record<string, unknown>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  baseUrl?: 'default' | 'auth' | 'workspace' | string; // Allow custom base URLs
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
  } else if (baseUrl === 'default') {
    selectedBaseUrl = BaseURL;
  } else {
    // Custom base URL provided
    selectedBaseUrl = baseUrl;
  }

  const fullUrl = `${selectedBaseUrl}${updatedPath}`;

  try {
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

    const config: any = {
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
        (data: any, headers: any) => {
          // Ensure Content-Type is always vnd.api+json and never gets overridden by axios
          if (headers && !headers['Content-Type']?.includes('vnd.api+json')) {
            headers['Content-Type'] = 'application/vnd.api+json';
          }
          return JSON.stringify(data);
        },
      ],
    };

    console.log('🔵 API Request:', {
      url: fullUrl,
      method,
      headers: config.headers,
      payload: updatedPayload,
    });

    const response = await axios(config);

    console.log('🟢 API Response:', {
      url: fullUrl,
      status: response.status,
      data: response.data,
    });

    return response.data;
  } catch (error: any) {
    console.error('🔴 API call failed:', {
      url: fullUrl,
      method,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
    });
    throw error;
  }
};
