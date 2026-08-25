'use client';

import * as React from 'react';

import { usePathname } from 'next/navigation';

import { DynamicTitle } from '@/components/DynamicTitle';
import { determineUserRole } from '@/store/api/authApi';
import { isStudentUser } from '@/utils/authHeaders';
import { canonicalDashboardPath } from '@/utils/authRoutes';
import {
  loadTokenFromStorage,
  loadUserFromStorage,
  syncTokenToRedux,
  syncUserToRedux,
} from '@/utils/reduxAuthSync';
import { isAuthSubdomain } from '@/utils/subdomainUtils';
import axios from 'axios';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { toast } from 'react-toastify';

import { updateUserData } from './interfaces/userInterface';

const AUTH0_Client_Id = process.env.NEXT_PUBLIC_AUTH0_Client_Id || '';
const AUTH0_Domain_Name = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';
const login_redirect = process.env.NEXT_PUBLIC_AUTH0_LOGIN_REDIRECT_URL || '';

const PUBLIC_ROUTES = new Set([
  '/',
  '/gallery',
  '/about',
  '/faculties',
  '/contact',
  '/login',
  '/student-login',
]);
const isPublicRoute = (p: string | null) =>
  !!p && PUBLIC_ROUTES.has(p.split('?')[0]);

const USER_DATA_TTL_MS = 24 * 60 * 60 * 1000;
const isCachedUserDataFresh = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('cachedUserData');
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return (
      typeof parsed?.cacheTimestamp === 'number' &&
      Date.now() - parsed.cacheTimestamp < USER_DATA_TTL_MS
    );
  } catch {
    return false;
  }
};

export function Providers({ children }: ThemeProviderProps) {
  const [accessTkn, setAccessTkn] = React.useState<string | null>(null);
  const [isProcessingCode, setIsProcessingCode] = React.useState(false);
  // No longer set anywhere - the old redirectToOrgSubdomain helper that used
  // to flip this (and duplicated the redirect logic fetchAuthToken already
  // does correctly) was dead code, unreachable from any real call site, and
  // was removed as part of the R3 hop-count fix.
  const [isRedirecting] = React.useState(false);
  const pathname = usePathname();
  const fetchedUserForTokenRef = React.useRef<string | null>(null);

  const userMeData = React.useCallback(
    async (bearerToken: string) => {
      if (!bearerToken) return;

      // Skip /users/me call for students as we already have their data
      if (isStudentUser()) {
        console.log('Student user detected, skipping /users/me call');
        return;
      }

      // No /users/me on the auth subdomain — it has no org context and the user is mid-login.
      if (isAuthSubdomain()) {
        return;
      }

      // Skip when cached user data is within the 24h TTL.
      // loadUserFromStorage has already hydrated Redux from this same cache.
      if (isCachedUserDataFresh()) {
        console.log('✅ Using cached /users/me data (within 24h TTL)');
        return;
      }

      try {
        // Get auth headers (will use Bearer for admin/teachers)
        const { makeApiCall } = await import('@/utils/ApiRequest');

        const res = await makeApiCall({
          path: '/users/me?include=permission',
          method: 'GET',
          baseUrl: 'auth',
        });

        const userData = res.data; // Extract from nested structure
        const attributes = userData.attributes;
        const permissions =
          userData.user_permissions || attributes.permissions || {};

        // Handle both possible field names for org ID
        const orgId = attributes.orgId || attributes.org_id || attributes.org;

        // Determine user role (shared with authApi.ts - same /users/me shape)
        const userRole = determineUserRole(userData);

        updateUserData({
          userId: attributes.user_id || attributes.id,
          keyId: 'user-' + (attributes.user_id || attributes.id),
          orgKeyId: 'org-' + orgId,
          orgId: orgId,
          userEmail: attributes.email,
          firstName: attributes.first_name || attributes.name?.split(' ')[0],
          lastName:
            attributes.last_name ||
            attributes.name?.split(' ').slice(1).join(' '),
          permission: permissions,
          allowedTeams: Object.keys(permissions || {})
            .filter((key) => key.startsWith('team-'))
            .map((key) => key.match(/team-(\d+)/)?.[1])
            .filter(Boolean) as string[],
        });

        // Sync user data to Redux for new components
        syncUserToRedux({
          id: userData.id,
          email: attributes.email,
          firstName:
            attributes.first_name || attributes.name?.split(' ')[0] || '',
          lastName:
            attributes.last_name ||
            attributes.name?.split(' ').slice(1).join(' ') ||
            '',
          role: userRole,
          orgId: orgId || '',
          permissions: permissions,
        });

        // Write to localStorage for backward compatibility
        localStorage.setItem(
          'cachedUserData',
          JSON.stringify({
            id: userData.id,
            email: attributes.email,
            firstName:
              attributes.first_name || attributes.name?.split(' ')[0] || '',
            lastName:
              attributes.last_name ||
              attributes.name?.split(' ').slice(1).join(' ') ||
              '',
            role: userRole,
            orgId: orgId || '',
            permissions: permissions,
            type: attributes.type || attributes.role,
            phone: attributes.phone || '',
            designation: attributes.designation || '',
            experience: attributes.experience || '',
            profilePhoto: attributes.profile_photo || attributes.photo || '',
            cacheTimestamp: Date.now(), // Add timestamp for cache validation
          }),
        );
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If we get a 401 or 403, the token is invalid
        const status = (error as { response?: { status?: number } }).response
          ?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('bearerToken');
          setAccessTkn(null);
          loginHandler();
        } else {
          // A non-auth failure (network error, 500, timeout) left the
          // screen just never populating with no feedback at all -
          // let the user know something actually went wrong.
          toast.error(
            'Failed to load your profile. Please check your connection and try again.',
          );
        }
      }
    },
    [setAccessTkn],
  );

  const setItemWithTTL = (key: string, value: string, ttlHours: number) => {
    const now = new Date().getTime();
    const ttlMilliseconds = ttlHours * 60 * 60 * 1000;
    const item = {
      value: value,
      expiry: now + ttlMilliseconds,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  const getItemWithTTL = (key: string) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    try {
      const item = JSON.parse(itemStr);
      const now = new Date().getTime();

      if (now > item.expiry) {
        console.log('Token expired, removing from storage');
        localStorage.removeItem(key);
        setAccessTkn(null);
        return null;
      }

      // Check if token expires soon (within 5 minutes)
      const fiveMinutes = 5 * 60 * 1000;
      if (now > item.expiry - fiveMinutes) {
        console.log('Token expires soon, should refresh');
        // TODO: Implement token refresh here
      }

      return item.value;
    } catch (e) {
      console.log('Error parsing token from storage:', e);
      localStorage.removeItem(key);
      return null;
    }
  };

  const fetchAuthToken = React.useCallback(
    async (code: string) => {
      if (isProcessingCode) return;
      setIsProcessingCode(true);

      try {
        // Use dynamic redirect URI based on current domain
        const tokenExchangeHost = window.location.host;
        const tokenIsLocalhost =
          tokenExchangeHost.includes('localhost') ||
          tokenExchangeHost.includes('127.0.0.1');
        const dynamicRedirectUri = tokenIsLocalhost
          ? login_redirect
          : `https://${tokenExchangeHost}/`;

        // Exchange the code server-side (see /api/auth/exchange-code) so the
        // Auth0 client secret never has to live in the browser bundle.
        const response = await axios.post('/api/auth/exchange-code', {
          code,
          redirect_uri: dynamicRedirectUri,
        });

        const token = response.data.access_token;
        const expiresIn = response.data.expires_in || 3600; // Default to 1 hour if not provided
        const expiresInHours = Math.max(1, Math.floor(expiresIn / 3600)); // Convert seconds to hours, minimum 1 hour

        setAccessTkn(token);
        setItemWithTTL('bearerToken', token, expiresInHours);

        // Sync token to Redux store
        syncTokenToRedux(token, expiresIn);

        // Mark code as processed temporarily
        sessionStorage.setItem('authCodeProcessed', 'true');
        // A successful exchange ends any retry sequence.
        sessionStorage.removeItem('authExchangeRetried');

        // Only redirect immediately after OAuth callback, not on normal homepage visits
        const wasAuthCallback = sessionStorage.getItem('isAuthCallback');

        // Check if this is an auth callback that should trigger redirect to dashboard
        const currentHost = window.location.host;
        const isLocalhost =
          currentHost.includes('localhost') ||
          currentHost.includes('127.0.0.1');

        console.log(
          '✅ Token obtained, now fetching user org and redirecting...',
        );

        // SIMPLE FLOW: Get user → get org → redirect to org subdomain
        if (wasAuthCallback) {
          sessionStorage.removeItem('isAuthCallback');

          try {
            // Step 1: Call /users/me to get orgId
            console.log('📞 Step 1: Calling /users/me to get orgId...');
            const { makeApiCall } = await import('@/utils/ApiRequest');

            const userResponse = await makeApiCall({
              path: '/users/me?include=permission',
              method: 'GET',
              baseUrl: 'auth',
              customAuthHeaders: {
                Authorization: `Bearer ${token}`,
              },
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const userData = userResponse.data;
            console.log('👤 User data received:', userData);

            // Extract orgId from attributes
            const orgId =
              userData.attributes.orgId ||
              userData.attributes.org_id ||
              userData.attributes.org;

            // Same normalizer userMeData/authApi.ts use, not the raw
            // attributes.role field - that's a faculty-record field
            // ('faculty'/'staff'/...), not the RBAC role this app routes on.
            const role = determineUserRole(userData);
            const destination = canonicalDashboardPath(role);

            console.log('🏢 Extracted orgId:', orgId, '| role:', role);

            // Sync user data to Redux store
            syncUserToRedux({
              id: userData.id,
              email: userData.attributes.email,
              firstName:
                userData.attributes.first_name ||
                userData.attributes.name?.split(' ')[0] ||
                'User',
              lastName:
                userData.attributes.last_name ||
                userData.attributes.name?.split(' ').slice(1).join(' ') ||
                '',
              role,
              orgId: orgId || '',
            });

            if (!orgId) {
              console.error(
                `❌ No orgId found in user data, going straight to ${destination}`,
              );
              window.location.href = destination;
              return;
            }

            // Step 2: Call /organizations/{orgId} to get subdomain
            console.log(
              '📞 Step 2: Calling /organizations/' +
                orgId +
                ' to get subdomain...',
            );
            const orgResponse = await makeApiCall({
              path: `/organizations/${orgId}`,
              method: 'GET',
              baseUrl: 'auth',
              customAuthHeaders: {
                Authorization: `Bearer ${token}`,
              },
              headers: {
                'Content-Type': 'application/json',
              },
            });

            const orgData = orgResponse.data;
            const targetSubdomain = orgData.attributes.subdomain;

            console.log('🏢 Organization data received:', orgData);
            console.log('🎯 Target subdomain:', targetSubdomain);

            if (!targetSubdomain) {
              console.error(
                `❌ No subdomain found in org data, going straight to ${destination}`,
              );
              window.location.href = destination;
              return;
            }

            // Step 3: Redirect straight to the canonical destination - one
            // hop, whether or not a cross-subdomain jump is also needed,
            // instead of landing on '/' or '/dashboard' and letting a
            // second effect (page.tsx, then dashboard/page.tsx) figure out
            // the role and navigate again.
            const currentHost = window.location.host;
            const currentSubdomain = currentHost.split('.')[0];

            console.log('🌐 Current subdomain:', currentSubdomain);
            console.log('🎯 Target subdomain:', targetSubdomain);

            // Check if we need to redirect
            const needsRedirect =
              currentSubdomain === 'localhost' || // Plain localhost
              currentSubdomain === 'auth' || // Auth subdomain
              currentSubdomain !== targetSubdomain; // Different org subdomain

            if (needsRedirect) {
              console.log(
                '🔄 Redirecting to org subdomain:',
                targetSubdomain,
                destination,
              );

              if (isLocalhost) {
                const port = currentHost.split(':')[1] || '3000';
                const redirectUrl = `http://${targetSubdomain}.localhost:${port}${destination}#access_token=${encodeURIComponent(token)}`;
                console.log('🔗 Redirect URL:', redirectUrl);
                window.location.href = redirectUrl;
              } else {
                const domain = currentHost.split('.').slice(1).join('.');
                const redirectUrl = `https://${targetSubdomain}.${domain}${destination}#access_token=${encodeURIComponent(token)}`;
                console.log('🔗 Redirect URL:', redirectUrl);
                window.location.href = redirectUrl;
              }
            } else {
              console.log(
                '✅ Already on correct subdomain, going to',
                destination,
              );
              window.location.href = destination;
            }
          } catch (error) {
            console.error('❌ Error in faculty login flow:', error);
            // Fallback to the generic /dashboard forwarder on error, since
            // the role (and therefore the real destination) is exactly what
            // failed to resolve here.
            window.location.href = '/dashboard';
          }
        } else {
          console.log('⚠️ Not an auth callback, calling userMeData normally');
          await userMeData(token);
        }
      } catch (error) {
        console.error('Error fetching auth token:', error);
        const err = error as {
          response?: { data?: unknown; status?: number };
        };
        if (err.response) {
          console.error('Response data:', err.response?.data);
          console.error('Response status:', err.response?.status);
        }

        // Retrying login here used to be unconditional, and it looped forever:
        // this set 'authCodeProcessed' and loginHandler() removed it again as
        // its first act, so the guard never held. Auth0 still has a session, so
        // it hands back a fresh code immediately, the exchange fails again, and
        // the browser ping-pongs between the app and Auth0 - which also burns
        // the Auth0 tenant's rate limit for everybody else.
        const status = err.response?.status ?? 0;

        // A 5xx is our own server failing (a missing AUTH0_CLIENT_SECRET, say).
        // Another trip through Auth0 cannot fix that, so do not attempt one.
        if (status >= 500) {
          toast.error(
            'Sign-in is temporarily unavailable. Please try again shortly.',
          );
          return;
        }

        // Otherwise the code itself was rejected (expired, or already
        // redeemed). One fresh login attempt is worth making; a second means
        // something is durably wrong, so stop rather than loop.
        const RETRY_KEY = 'authExchangeRetried';
        if (sessionStorage.getItem(RETRY_KEY)) {
          sessionStorage.removeItem(RETRY_KEY);
          toast.error('Could not complete sign-in. Please try again.');
          return;
        }

        sessionStorage.setItem(RETRY_KEY, 'true');
        loginHandler();
      } finally {
        setIsProcessingCode(false);
      }
    },
    [isProcessingCode, setAccessTkn, setIsProcessingCode, userMeData],
  );

  const loginHandler = () => {
    try {
      // Clear all auth state for fresh start
      sessionStorage.removeItem('authCodeProcessed');
      localStorage.removeItem('bearerToken');
      localStorage.removeItem('authState');
      localStorage.removeItem('codeVerifier');
      setAccessTkn(null);

      // Use dynamic redirect URI based on current domain
      const loginHost = window.location.host;
      const loginIsLocalhost =
        loginHost.includes('localhost') || loginHost.includes('127.0.0.1');
      const loginRedirectUri = loginIsLocalhost
        ? login_redirect
        : `https://${loginHost}/`;

      console.log(
        'Initiating login to:',
        `https://${AUTH0_Domain_Name}/authorize`,
      );
      console.log('Using redirect URI:', loginRedirectUri);

      window.location.href = `https://${AUTH0_Domain_Name}/authorize?response_type=code&client_id=${AUTH0_Client_Id}&redirect_uri=${encodeURIComponent(loginRedirectUri)}&scope=${encodeURIComponent('openid profile email')}`;
    } catch (error) {
      console.error('Login redirect error:', error);
    }
  };

  // Every ApiService call independently checks token expiry and throws
  // 'Authentication token has expired' with no redirect attached — a
  // mid-session user otherwise sees a scattered, uncaught failure instead of
  // a clean bounce to login. Catch it globally and send them back to /login.
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message;
      if (message === 'Authentication token has expired') {
        localStorage.removeItem('bearerToken');
        localStorage.removeItem('persist:root');
        window.location.href = '/login';
      }
    };
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () =>
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection,
      );
  }, []);

  // Initialize auth state — runs once per token, not per navigation
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const onPublicRoute = isPublicRoute(pathname);

    // Check for access token / student auth data in the URL hash first (from
    // a cross-subdomain redirect - see login/page.tsx and the faculty login
    // flow above, both of which now redirect straight to the canonical
    // dashboard route with this hash attached, landing here regardless of
    // which page that route renders since Providers wraps the whole app).
    const urlHash = window.location.hash;
    const hashParams = new URLSearchParams(urlHash.substring(1));
    const tokenFromHash = hashParams.get('access_token');
    const studentAuthFromHash = hashParams.get('student_auth');

    if (studentAuthFromHash) {
      try {
        const decodedStudentAuth = JSON.parse(
          decodeURIComponent(studentAuthFromHash),
        );
        console.log('🎓 Found student auth data in URL hash, storing it');
        localStorage.setItem('studentAuth', JSON.stringify(decodedStudentAuth));
        localStorage.setItem(
          'bearerToken',
          JSON.stringify({
            value: decodedStudentAuth.basicAuthToken,
            expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }),
        );
      } catch (error) {
        console.error('❌ Error processing student auth data:', error);
      }

      // Clean the URL by removing the hash - DashboardWrapper reads
      // studentAuth straight from localStorage, no further navigation needed.
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search,
      );
      return;
    }

    if (tokenFromHash) {
      console.log('🔑 Found access token in URL hash, storing it');
      setAccessTkn(tokenFromHash);
      setItemWithTTL('bearerToken', tokenFromHash, 24); // Store for 24 hours

      // Sync token to Redux store (24 hours = 86400 seconds)
      syncTokenToRedux(tokenFromHash, 86400);

      // Clean the URL by removing the hash
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search,
      );

      if (!onPublicRoute && fetchedUserForTokenRef.current !== tokenFromHash) {
        fetchedUserForTokenRef.current = tokenFromHash;
        userMeData(tokenFromHash);
      }
      return;
    }

    // Check for stored token
    const token = getItemWithTTL('bearerToken');
    if (token) {
      setAccessTkn(token);

      // Load token and user data into Redux from localStorage
      loadTokenFromStorage();
      loadUserFromStorage();

      // DashboardWrapper fetches its own /users/me; public routes don't need it.
      // Ref guard ensures we fetch at most once per token, not per navigation.
      if (
        pathname !== '/dashboard' &&
        !onPublicRoute &&
        fetchedUserForTokenRef.current !== token
      ) {
        fetchedUserForTokenRef.current = token;
        userMeData(token);
      }
    }
  }, [pathname, userMeData]);

  // Handle auth code from URL
  React.useEffect(() => {
    if (typeof window !== 'undefined' && !isProcessingCode) {
      const urlParams = new URLSearchParams(window.location.search);
      const parsedAuthCode = urlParams.get('code');
      const codeProcessed = sessionStorage.getItem('authCodeProcessed');

      console.log('Auth code check:', {
        parsedAuthCode: !!parsedAuthCode,
        accessTkn: !!accessTkn,
        hasToken: !!getItemWithTTL('bearerToken'),
        codeProcessed: !!codeProcessed,
      });

      if (
        parsedAuthCode &&
        !accessTkn &&
        !getItemWithTTL('bearerToken') &&
        !codeProcessed
      ) {
        console.log('Processing auth code...');
        // Mark this as an auth callback so we can redirect after token exchange
        sessionStorage.setItem('isAuthCallback', 'true');

        // Clear the code from URL immediately to prevent reprocessing and stay on homepage
        const newUrl = window.location.origin + '/'; // Force homepage
        window.history.replaceState({}, document.title, newUrl);

        console.log(
          '🔄 Cleared auth code from URL, staying on:',
          window.location.pathname,
        );

        fetchAuthToken(parsedAuthCode);
      }
    }
  }, [accessTkn, isProcessingCode, fetchAuthToken]);

  // Show loader when processing auth code or redirecting
  if (isProcessingCode || isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">
              {isProcessingCode
                ? 'Authenticating...'
                : 'Redirecting to your organization...'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {isProcessingCode
                ? 'Please wait while we verify your credentials'
                : 'Please wait while we take you to the right place'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <DynamicTitle />
      {children}
    </NextThemesProvider>
  );
}
