/**
 * The one canonical destination per role, shared by every login flow
 * (Auth0 admin/teacher, direct student login) and by /dashboard's legacy
 * forwarder. Used to redirect straight to the real destination as soon as a
 * role is known, instead of landing on a generic route and resolving the
 * role afterwards - see the R3 fix (2026-08-25) that collapsed the old
 * homepage -> /dashboard -> canonical-path chain into a single redirect.
 */
export function canonicalDashboardPath(role?: string): string {
  if (role === 'admin') return '/admin-portal/dashboard';
  if (role === 'teacher') return '/teacher-dashboard';
  return '/student-dashboard';
}
