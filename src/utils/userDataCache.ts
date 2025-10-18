/**
 * Centralized user data cache to prevent multiple concurrent API calls
 * This ensures only one request to /users/me is made at a time
 */

// Hardcoded orgId for localhost development
const LOCALHOST_ORG_ID = '68d6b128d88f00c8b1b4a89a';

interface UserMeData {
  id: string;
  orgId: string;
  permissions: Record<string, any>;
  attributes: any;
}

/**
 * Check if running on localhost
 */
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('localhost:')
  );
}

interface CacheEntry {
  data: UserMeData;
  timestamp: number;
}

// In-memory cache with 5-minute TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cache: CacheEntry | null = null;

// Track in-flight requests to prevent duplicate API calls
let inflightRequest: Promise<UserMeData> | null = null;

/**
 * Get user data with caching and deduplication
 * @param token - Bearer token for authentication
 * @param forceRefresh - Force a fresh API call even if cached data exists
 */
export async function getUserData(
  token: string,
  forceRefresh: boolean = false,
): Promise<UserMeData> {
  const now = Date.now();

  // Return cached data if valid and not forcing refresh
  if (!forceRefresh && cache && now - cache.timestamp < CACHE_TTL) {
    console.log('✅ Returning cached user data');
    return cache.data;
  }

  // If there's already a request in flight, wait for it
  if (inflightRequest) {
    console.log('⏳ Waiting for in-flight request to complete');
    return inflightRequest;
  }

  // Make new request
  console.log('📞 Fetching fresh user data from API');
  inflightRequest = fetchUserDataFromAPI(token);

  try {
    const data = await inflightRequest;

    // Cache the result
    cache = {
      data,
      timestamp: now,
    };

    return data;
  } finally {
    // Clear inflight request
    inflightRequest = null;
  }
}

/**
 * Fetch user data from backend API
 */
async function fetchUserDataFromAPI(token: string): Promise<UserMeData> {
  const BaseURLAuth =
    process.env.NEXT_PUBLIC_BaseURLAuth ||
    'https://apis.testkdlakshya.uchhal.in/auth';

  const response = await fetch(`${BaseURLAuth}/users/me?include=permission`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/vnd.api+json',
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const userData = data.data;
  const attrs = userData.attributes;

  // Use hardcoded orgId for localhost, otherwise get from API response
  const orgId = isLocalhost()
    ? LOCALHOST_ORG_ID
    : attrs.orgId || attrs.org_id || attrs.org;

  if (isLocalhost()) {
    console.log('🏠 Using hardcoded localhost orgId:', LOCALHOST_ORG_ID);
  }

  return {
    id: userData.id,
    orgId,
    permissions: attrs.permissions || userData.user_permissions || {},
    attributes: attrs,
  };
}

/**
 * Clear the cache (useful when logging out or on auth errors)
 */
export function clearUserDataCache() {
  cache = null;
  inflightRequest = null;
  console.log('🗑️ User data cache cleared');
}

/**
 * Get cached data without making an API call
 * Returns null if no valid cache exists
 */
export function getCachedUserData(): UserMeData | null {
  const now = Date.now();

  if (cache && now - cache.timestamp < CACHE_TTL) {
    return cache.data;
  }

  return null;
}

/**
 * Get orgId directly - uses hardcoded value for localhost
 * This is useful when you need orgId but don't want to make an API call
 */
export function getOrgId(): string | null {
  // For localhost, always return the hardcoded orgId
  if (isLocalhost()) {
    console.log('🏠 Using hardcoded localhost orgId:', LOCALHOST_ORG_ID);
    return LOCALHOST_ORG_ID;
  }

  // Try to get from cache first
  const cachedData = getCachedUserData();
  if (cachedData) {
    return cachedData.orgId;
  }

  // Try localStorage caches
  if (typeof window !== 'undefined') {
    // Check cachedUserData
    const cachedUserData = localStorage.getItem('cachedUserData');
    if (cachedUserData) {
      try {
        const userData = JSON.parse(cachedUserData);
        if (userData.orgId) {
          return userData.orgId;
        }
      } catch (e) {
        console.error('Error parsing cached user data:', e);
      }
    }

    // Check sessionStorage
    const sessionUserData = sessionStorage.getItem('userData');
    if (sessionUserData) {
      try {
        const userData = JSON.parse(sessionUserData);
        if (userData.orgId) {
          return userData.orgId;
        }
      } catch (e) {
        console.error('Error parsing session user data:', e);
      }
    }

    // Check standalone cache
    const cachedOrgId = sessionStorage.getItem('currentOrgId');
    if (cachedOrgId) {
      return cachedOrgId;
    }
  }

  return null;
}
