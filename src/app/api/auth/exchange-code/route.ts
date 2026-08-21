import { NextRequest, NextResponse } from 'next/server';

import axios from 'axios';

// Read per-request rather than at module scope so a corrected environment
// variable takes effect on redeploy without depending on when this module was
// first evaluated.
function auth0Config() {
  return {
    // The client id is not a secret - it is already in the public bundle for
    // the /authorize redirect. Falling back to the public name means only the
    // genuinely secret value has to be added to the environment, instead of
    // this route failing because the same id was not also duplicated under a
    // second, server-only name.
    clientId:
      process.env.AUTH0_CLIENT_ID ||
      process.env.NEXT_PUBLIC_AUTH0_Client_Id ||
      '',
    // Server-side only — never prefixed with NEXT_PUBLIC_, so it never reaches
    // the browser bundle.
    clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
    domain: process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '',
  };
}

/**
 * Exchanges an Auth0 authorization code for an access token.
 * This runs server-side so the client secret never ships to the browser
 * (previously this exchange happened in providers.tsx using
 * NEXT_PUBLIC_AUTH0_Client_Secret, which is inlined into the public JS bundle).
 */
export async function POST(request: NextRequest) {
  try {
    const { code, redirect_uri } = await request.json();

    if (!code || !redirect_uri) {
      return NextResponse.json(
        { error: 'code and redirect_uri are required' },
        { status: 400 },
      );
    }

    const { clientId, clientSecret, domain } = auth0Config();

    // Name the missing variables in the server log. A bare "configuration is
    // missing" 500 gave no way to tell which of the three was absent, and the
    // names cannot go in the response since that is attacker-visible.
    const missing = [
      !clientId && 'AUTH0_CLIENT_ID (or NEXT_PUBLIC_AUTH0_Client_Id)',
      !clientSecret && 'AUTH0_CLIENT_SECRET',
      !domain && 'NEXT_PUBLIC_Auth0_DOMAIN_NAME',
    ].filter(Boolean);

    if (missing.length > 0) {
      console.error(
        `Auth0 code exchange is not configured; missing: ${missing.join(', ')}`,
      );
      return NextResponse.json(
        { error: 'Auth0 server configuration is missing' },
        { status: 500 },
      );
    }

    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('client_id', clientId);
    data.append('client_secret', clientSecret);
    data.append('code', code);
    data.append('redirect_uri', redirect_uri);

    const response = await axios({
      method: 'post',
      url: `https://${domain}/oauth/token`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data,
    });

    return NextResponse.json({
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
    });
  } catch (error) {
    console.error('Auth0 code exchange failed:', error);
    return NextResponse.json(
      { error: 'Failed to exchange authorization code' },
      { status: 500 },
    );
  }
}
