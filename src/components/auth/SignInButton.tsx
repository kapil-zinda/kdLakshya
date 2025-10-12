'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@auth0/nextjs-auth0/client';
import { LogIn, LogOut, User } from 'lucide-react';

interface SignInButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

export function SignInButton({
  variant = 'default',
  size = 'default',
  className = '',
  style,
}: SignInButtonProps) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        style={style}
        disabled
      >
        Loading...
      </Button>
    );
  }

  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            style={style}
          >
            <User className="w-4 h-4 mr-2" />
            {user.name || user.email}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href="/api/auth/logout">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const handleSignIn = () => {
    // Store the current subdomain for post-login redirect
    const currentHost = window.location.host;
    const currentSubdomain = currentHost.split('.')[0];
    if (currentSubdomain && currentSubdomain !== 'localhost') {
      sessionStorage.setItem('loginOriginSubdomain', currentSubdomain);
    }

    // Redirect directly to Auth0 login
    const AUTH0_Domain_Name =
      process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME ||
      'dev-p3hppyisuuaems5y.us.auth0.com';
    const AUTH0_Client_Id =
      process.env.NEXT_PUBLIC_AUTH0_Client_Id ||
      'Yue4u4piwndowcgl5Q4TNlA3fPlrdiwL';

    // Use dynamic redirect URL based on current host
    const isLocalhost =
      currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
    const login_redirect = isLocalhost
      ? 'http://localhost:3000/'
      : `https://${currentHost}/`;

    window.location.href = `https://${AUTH0_Domain_Name}/authorize?response_type=code&client_id=${AUTH0_Client_Id}&redirect_uri=${encodeURIComponent(login_redirect)}&scope=${encodeURIComponent('openid profile email')}`;
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      style={style}
      onClick={handleSignIn}
    >
      <LogIn className="w-4 h-4 mr-2" />
      Sign In
    </Button>
  );
}
