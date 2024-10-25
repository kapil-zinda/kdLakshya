import { userData } from '@/app/interfaces/userInterface';
import { getItemWithTTL } from '@/utils/customLocalStorageWithTTL';
import axios from 'axios';

const BaseURL = process.env.NEXT_PUBLIC_BaseURL || '';

interface ApiRequest {
  path: string;
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

const replacePathParams = (path: string, params: Record<string, any>) => {
  return Object.keys(params).reduce((updatedPath, paramKey) => {
    return updatedPath.replace(`{${paramKey}}`, params[paramKey]);
  }, path);
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

  const updatedPath = replacePathParams(path, pathParams);

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
        ? { data: payload }
        : {}),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};
