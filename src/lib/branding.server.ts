import { headers } from 'next/headers';

import { resolveBrandColor } from '@/utils/color';

/**
 * Server-side branding resolution for the root layout.
 *
 * This replaces ThemeApplier, which read organisation data from a client-side
 * Redux fetch (useOrganizationData) and applied colours in a useEffect after
 * mount - so every page loaded with the default black-on-white theme first,
 * then visibly repainted once the fetch resolved. Resolving the subdomain
 * from the request's Host header and fetching branding here, in a Server
 * Component, means the school's colours are already in the very first byte
 * of HTML the browser receives; there is no flash to fix.
 *
 * This intentionally only resolves branding (colours + font), not the rest
 * of the organisation data (name, hero copy, stats, ...) that
 * useOrganizationData still fetches client-side via Redux - broadening this
 * to replace that entire data layer is a separate, much larger change.
 */

const DEFAULT_PRIMARY_HEX = '#059669';
const DEFAULT_SECONDARY_HEX = '#10B981';
const DEFAULT_FONT_FAMILY = 'Arial';

const AUTH_API_BASE =
  process.env.NEXT_PUBLIC_BaseURLAuth ||
  'https://apis.testkdlakshya.uchhal.in/auth';

const FETCH_TIMEOUT_MS = 3000;

// Cache this server-side for the same 5 minutes useOrganizationData already
// treats client-fetched branding as fresh for - keeps a school's colours
// from re-fetching on literally every request without ever going stale for
// long after an admin changes them in school-settings.
const REVALIDATE_SECONDS = 300;

export interface BrandTokens {
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  fontFamily: string;
}

function fallbackTokens(): BrandTokens {
  const primary = resolveBrandColor(DEFAULT_PRIMARY_HEX, DEFAULT_PRIMARY_HEX);
  const secondary = resolveBrandColor(
    DEFAULT_SECONDARY_HEX,
    DEFAULT_SECONDARY_HEX,
  );
  return {
    primary: primary.value,
    primaryForeground: primary.foreground,
    secondary: secondary.value,
    secondaryForeground: secondary.foreground,
    fontFamily: DEFAULT_FONT_FAMILY,
  };
}

/** Mirrors src/utils/subdomainUtils.ts's getSubdomain(), off the Host header instead of window.location. */
function subdomainFromHost(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return parts[0];
  }
  return null;
}

async function fetchJson(path: string): Promise<any> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(`${AUTH_API_BASE}${path}`, {
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    // Network error, timeout, or non-JSON body - branding is cosmetic, so a
    // page must still render with sane defaults rather than fail entirely.
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function resolveBrandTokens(): Promise<BrandTokens> {
  const headerList = headers();
  const host = headerList.get('host');
  const subdomain = subdomainFromHost(host);

  // The auth subdomain has no organisation of its own - see isAuthSubdomain()
  // in subdomainUtils.ts, which the client-side fetch also skips for.
  if (!subdomain || subdomain === 'auth') {
    return fallbackTokens();
  }

  const org = await fetchJson(`/organizations/subdomain/${subdomain}`);
  const orgId = org?.data?.id;
  if (!orgId) {
    return fallbackTokens();
  }

  const siteConfig = await fetchJson(`/${orgId}/siteconfig`);
  const theme = siteConfig?.data?.attributes?.theme;

  const primary = resolveBrandColor(
    theme?.primaryColor || DEFAULT_PRIMARY_HEX,
    DEFAULT_PRIMARY_HEX,
  );
  const secondary = resolveBrandColor(
    theme?.secondaryColor || DEFAULT_SECONDARY_HEX,
    DEFAULT_SECONDARY_HEX,
  );

  return {
    primary: primary.value,
    primaryForeground: primary.foreground,
    secondary: secondary.value,
    secondaryForeground: secondary.foreground,
    fontFamily: theme?.fontFamily || DEFAULT_FONT_FAMILY,
  };
}
