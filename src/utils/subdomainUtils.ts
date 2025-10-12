import { ApiService } from '@/services/api';

export function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Return subdomain if it exists (e.g., 'auth' from 'auth.uchhal.in')
  if (parts.length >= 2) {
    return parts[0];
  }

  return null;
}

export function isValidSubdomain(subdomain: string): boolean {
  const validSubdomains = ['auth', 'amity', 'spd'];
  return validSubdomains.includes(subdomain);
}

/**
 * Determines the correct subdomain to use for fetching organization data
 * Priority: 1. User's organization subdomain, 2. URL subdomain, 3. Default 'amity'
 */
export async function getTargetSubdomain(
  userOrgId?: string,
  accessToken?: string,
): Promise<string> {
  let targetSubdomain = 'spd'; // Default fallback

  // Priority 1: If user is logged in, use their organization's subdomain
  if (userOrgId) {
    try {
      console.log(
        '🔍 getTargetSubdomain: User is logged in with orgId:',
        userOrgId,
      );
      console.log(
        '🔑 getTargetSubdomain: Using access token:',
        accessToken ? 'Yes' : 'No',
      );
      const orgData = await ApiService.getOrganizationById(
        userOrgId,
        accessToken,
      );
      console.log('🏢 getTargetSubdomain: Fetched org data:', orgData);
      targetSubdomain = orgData.data.attributes.subdomain;
      console.log(
        '✅ getTargetSubdomain: Using user organization subdomain:',
        targetSubdomain,
      );
      return targetSubdomain;
    } catch (error) {
      console.error(
        '❌ getTargetSubdomain: Error fetching user organization data:',
        error,
      );
      console.error('❌ getTargetSubdomain: Error details:', error);
      // Fall through to URL detection
    }
  } else {
    console.log('👤 getTargetSubdomain: No user orgId provided');
  }

  // Priority 2: Use subdomain from URL
  const urlSubdomain = getSubdomain();
  targetSubdomain = urlSubdomain || 'amity';
  console.log('🌐 getTargetSubdomain: Using URL subdomain:', targetSubdomain);

  return targetSubdomain;
}
