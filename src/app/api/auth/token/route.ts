import { NextResponse } from 'next/server';

import { getAccessToken } from '@auth0/nextjs-auth0';

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
