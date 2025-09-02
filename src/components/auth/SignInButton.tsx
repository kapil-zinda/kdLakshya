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

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      style={style}
      asChild
    >
      <a href="/api/auth/login">
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </a>
    </Button>
  );
}
