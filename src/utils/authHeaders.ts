/**
 * Build the Authorization header carrying a student's api key.
 *
 * Students used to send their key on `x-api-key` while staff sent a bearer
 * token on `Authorization`. Because the two client types used different
 * headers, the API Gateway authorizer could not name either one as its
 * identity source and fell back to `X-Forwarded-For` - which forced authorizer
 * caching to stay disabled, since a cache keyed on a shared school IP would
 * serve one student another student's permissions. Sending both credential
 * kinds on `Authorization` is what allows that cache to be turned on safely.
 *
 * The backend authorizer accepts `ApiKey <key>` here and still accepts the old
 * `x-api-key` header, so this can ship independently of the gateway change.
 */
export function studentApiKeyHeader(apiKey: string): Record<string, string> {
  return { Authorization: `ApiKey ${apiKey}` };
}

/**
 * Get authentication headers based on user type.
 * Both student api keys and staff bearer tokens travel on `Authorization`.
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  // Check a valid (non-expired) Bearer token first. bearerToken carries an
  // explicit expiry that's checked here, while studentAuth doesn't - so a
  // fresh admin/teacher login is a stronger signal of "the current active
  // session" than a leftover studentAuth key an incomplete logout on a
  // shared device failed to clear (see the logout-clearing fix elsewhere).
  //
  // This ordering is only sound because `bearerToken` now holds staff Auth0
  // tokens exclusively. Student login used to copy its api key here too, which
  // made this branch win for students and send their key as `Bearer <api key>`
  // - guaranteeing a 401/403 once Auth0 rejected it. Student login now clears
  // this key instead of writing it.
  const bearerTokenStr = localStorage.getItem('bearerToken');

  if (bearerTokenStr) {
    try {
      const tokenData = JSON.parse(bearerTokenStr);
      const now = Date.now();

      if (tokenData.value && now < tokenData.expiry) {
        return {
          Authorization: `Bearer ${tokenData.value}`,
        };
      }
    } catch (error) {
      console.error('Error parsing bearer token:', error);
    }
  }

  // Fall back to student auth
  const apiKey = getStudentApiKey();

  if (apiKey) {
    return studentApiKeyHeader(apiKey);
  }

  return {};
}

/**
 * The current student's api key, or null when this is not a student session.
 *
 * `bearerToken` is deliberately not consulted: it holds staff Auth0 tokens
 * only. A student's api key used to be copied there too, which meant it got
 * sent as `Authorization: Bearer <api key>` and was rejected by Auth0.
 */
export function getStudentApiKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const studentAuth = localStorage.getItem('studentAuth');
  if (!studentAuth) {
    return null;
  }

  try {
    return JSON.parse(studentAuth).basicAuthToken || null;
  } catch (error) {
    console.error('Error parsing student auth:', error);
    return null;
  }
}

/**
 * Check if the current user is a student
 */
export function isStudentUser(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const studentAuth = localStorage.getItem('studentAuth');
  return !!studentAuth;
}
