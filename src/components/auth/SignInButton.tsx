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
    // Always redirect to SLS for authentication, regardless of current subdomain
    const currentHost = window.location.host;
    const isLocalhost =
      currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

    let authUrl;
    if (isLocalhost) {
      // For development, use localhost:3000 as the auth domain
      const port = currentHost.split(':')[1] || '3000';
      authUrl = `http://sls.localhost:${port}/api/auth/login`;
    } else {
      // For production, always redirect to sls.uchhal.in for authentication
      const domain = currentHost.split('.').slice(1).join('.'); // Get base domain (uchhal.in)
      authUrl = `https://sls.${domain}/api/auth/login`;
    }

    console.log('🔑 Redirecting to SLS for authentication:', authUrl);
    window.location.href = authUrl;
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
