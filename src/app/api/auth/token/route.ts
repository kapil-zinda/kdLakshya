import { NextRequest, NextResponse } from 'next/server';

import { getAccessToken } from '@auth0/nextjs-auth0';

export async function GET(request: NextRequest) {
  try {
    const { accessToken } = await getAccessToken(request);
    return NextResponse.json({ accessToken });
  } catch (error) {
    console.error('Error getting access token:', error);
    return NextResponse.json(
      { error: 'Failed to get access token' },
      { status: 500 },
    );
  }
}
