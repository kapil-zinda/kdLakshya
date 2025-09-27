# Auth0 Configuration for Multi-Subdomain Support

## Overview

This application now supports dynamic Auth0 redirect URLs for multiple subdomains (e.g., spd.uchhal.in, math.uchhal.in, etc.).

## Required Auth0 Configuration Changes

### 1. Allowed Callback URLs

Add the following URLs to your Auth0 application's "Allowed Callback URLs" setting:

**Production:**

- `https://spd.uchhal.in/`
- `https://math.uchhal.in/`
- `https://auth.uchhal.in/`
- `https://*.uchhal.in/` (if wildcard subdomains are supported)

**Development:**

- `http://localhost:3000/`
- `http://spd.localhost:3000/`
- `http://math.localhost:3000/`

### 2. Allowed Web Origins

Add the following to "Allowed Web Origins":

- `https://spd.uchhal.in`
- `https://math.uchhal.in`
- `https://auth.uchhal.in`
- `http://localhost:3000`

### 3. Allowed Logout URLs

Add the following to "Allowed Logout URLs":

- `https://spd.uchhal.in/`
- `https://math.uchhal.in/`
- `https://auth.uchhal.in/`
- `http://localhost:3000/`

## How the New Flow Works

1. **User visits any subdomain** (e.g., `spd.uchhal.in`)
2. **Clicks login** → Stores current subdomain in sessionStorage
3. **Redirects to Auth0** with dynamic redirect_uri matching current domain
4. **Auth0 redirects back** to the same domain (e.g., `spd.uchhal.in`)
5. **App processes token** and redirects to `/dashboard` on the same subdomain

## Key Changes Made

### Login Flow Updates

- **Dynamic redirect URI**: Uses current domain instead of fixed `sls.uchhal.in`
- **Subdomain preservation**: Stores origin subdomain for post-login redirect
- **Dashboard redirect**: Always redirects to `/dashboard` after successful authentication

### Files Modified

- `src/app/login/page.tsx` - Updated admin/teacher login handler
- `src/app/providers.tsx` - Updated token exchange and redirect logic
- `src/components/auth/SignInButton.tsx` - Updated sign-in flow
- `src/components/HomePageComponent.tsx` - Updated login handlers

### Environment Variables

The app now uses dynamic redirect URIs, but you may still want to set a fallback:

```env
NEXT_PUBLIC_AUTH0_LOGIN_REDIRECT_URL="https://spd.uchhal.in/"
```

## Testing

1. Visit `spd.uchhal.in`
2. Click login
3. Complete Auth0 authentication
4. Should redirect back to `spd.uchhal.in/dashboard`

## Troubleshooting

- Ensure all subdomain URLs are added to Auth0 settings
- Check browser console for redirect URL logs
- Verify environment variables are set correctly
- Make sure DNS/hosting supports subdomain routing
