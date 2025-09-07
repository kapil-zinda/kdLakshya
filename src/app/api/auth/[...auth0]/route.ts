import { NextResponse } from 'next/server';

import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  callback: handleCallback({
    afterCallback: async (req, res, session) => {
      // Store the access token in a way our frontend can use
      if (session?.accessToken) {
        const response = NextResponse.redirect(
          new URL('/auth-success', req.url),
        );
        response.cookies.set('userAccessToken', session.accessToken, {
          httpOnly: false, // Allow frontend access
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 86400, // 24 hours
        });
        return response;
      }
      return session;
    },
  }),
});
