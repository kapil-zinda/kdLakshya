import { userData } from '@/app/interfaces/userInterface';
import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';
import axios from 'axios';

const BaseURL = process.env.NEXT_PUBLIC_BaseURL || '';

interface ApiRequest {
  path: string;
  headers?: Record<string, string>;
  payload?: Record<string, unknown>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
}: ApiRequest) => {
  const bearerToken = getItemWithTTL('bearerToken');

  const pathParams = {
    org_id: userData.orgId,
    user_id: userData.userId,
    user_key_id: userData.keyId,
  };

  const updatedPath = replacePathAndQueryParams(path, pathParams);

  const updatedPayload = replacePayloadParams(payload, pathParams);

  const fullUrl = `${BaseURL}${updatedPath}`;

  try {
    const config = {
      url: fullUrl,
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${bearerToken}`,
      },
      ...(method === 'POST' || method === 'PUT' || method === 'PATCH'
        ? { data: updatedPayload }
        : {}),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
