import { NextResponse } from 'next/server';

import { getAccessToken } from '@auth0/nextjs-auth0';

// getAccessToken() reads the session cookie, so this can never be prerendered.
// Without this, the build tries to statically render the route and logs a
// DynamicServerError - harmless (it still resolves to a dynamic route) but it
// puts a stack trace in every build log for no reason.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { accessToken } = await getAccessToken();
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error getting access token:', error);
    return NextResponse.json(
      { error: 'Failed to get access token' },
      { status: 500 },
    );
  }
}
