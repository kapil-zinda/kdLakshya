import { NextRequest, NextResponse } from 'next/server';

import axios from 'axios';

// Server-side only — never prefixed with NEXT_PUBLIC_, so this never reaches the browser bundle.
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID || '';
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET || '';
const AUTH0_DOMAIN_NAME = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';

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

    if (!AUTH0_CLIENT_ID || !AUTH0_CLIENT_SECRET || !AUTH0_DOMAIN_NAME) {
      return NextResponse.json(
        { error: 'Auth0 server configuration is missing' },
        { status: 500 },
      );
    }

    const data = new URLSearchParams();
    data.append('grant_type', 'authorization_code');
    data.append('client_id', AUTH0_CLIENT_ID);
    data.append('client_secret', AUTH0_CLIENT_SECRET);
    data.append('code', code);
    data.append('redirect_uri', redirect_uri);

    const response = await axios({
      method: 'post',
      url: `https://${AUTH0_DOMAIN_NAME}/oauth/token`,
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
