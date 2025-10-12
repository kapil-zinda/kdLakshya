/**
 * Get authentication headers based on user type
 * Students use x-api-key, while admin/teachers use Bearer token
 */
export function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  // Check if user is a student
  const studentAuth = localStorage.getItem('studentAuth');

  if (studentAuth) {
    try {
      const studentData = JSON.parse(studentAuth);
      const apiKey = studentData.basicAuthToken;

      if (apiKey) {
        console.log('Using student x-api-key authentication');
        return {
          'x-api-key': apiKey,
        };
      }
    } catch (error) {
      console.error('Error parsing student auth:', error);
    }
  }

  // For admin/teachers, use Bearer token
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

  return {};
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
