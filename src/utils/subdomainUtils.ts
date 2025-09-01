export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Return subdomain if it exists (e.g., 'sls' from 'sls.uchhal.in')
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
}

export function isValidSubdomain(subdomain: string): boolean {
  const validSubdomains = ['sls', 'amity'];
  return validSubdomains.includes(subdomain);
}
