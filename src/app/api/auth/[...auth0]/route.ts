import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  callback: handleCallback({
    redirectUri: '/auth-success',
  }),
});
