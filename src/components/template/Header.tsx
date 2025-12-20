'use client';

import { useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { OrganizationConfig } from '@/types/organization';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  organization: OrganizationConfig;
}

const navigationItems = [
  { label: 'Home', href: '/', action: null },
  { label: 'About', href: '/about', action: null },
  { label: 'Faculties', href: '/faculties', action: null },
  { label: 'Gallery', href: '/gallery', action: null },
  { label: 'Contact', href: '/contact', action: null },
];

export function Header({ organization }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const getItemWithTTL = (key: string) => {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) return null;

        try {
          const item = JSON.parse(itemStr);
          // Check if it's in TTL format
          if (item.value && item.expiry) {
            const now = new Date().getTime();
            if (now > item.expiry) {
              localStorage.removeItem(key);
              return null;
            }
            return item.value;
          }
          // If not in TTL format, return the raw value
          return item;
        } catch (e) {
          // If it's not JSON, it might be a plain string token
          return itemStr;
        }
      };

      const token = getItemWithTTL('bearerToken');
      const adminAuth = localStorage.getItem('adminAuth');
      const studentAuth = localStorage.getItem('studentAuth');
      const hasAuthSession = document.cookie.includes('appSession');

      console.log('Auth check:', {
        token: !!token,
        adminAuth: !!adminAuth,
        studentAuth: !!studentAuth,
        hasAuthSession,
      });
      setIsAuthenticated(
        !!(token || adminAuth || studentAuth || hasAuthSession),
      );
    };

    checkAuth();
    // Check auth status when localStorage changes
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  const handleAuthLogin = () => {
    // Always redirect to AUTH for authentication, regardless of current subdomain
    const currentHost = window.location.host;
    const currentSubdomain = currentHost.split('.')[0];
    const isLocalhost =
      currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

    // Store the current subdomain so we can redirect back after login
    // Only store if not already on auth subdomain
    if (currentSubdomain !== 'auth') {
      sessionStorage.setItem('loginOriginSubdomain', currentSubdomain);
      console.log(
        '📝 Stored origin subdomain for post-login redirect:',
        currentSubdomain,
      );
    }

    let authUrl;
    if (isLocalhost) {
      // For development, use localhost:3000 as the auth domain
      const port = currentHost.split(':')[1] || '3000';
      // Pass origin subdomain as URL parameter
      const returnParam =
        currentSubdomain !== 'auth' && currentSubdomain !== 'localhost'
          ? `?return_to=${currentSubdomain}`
          : '';
      authUrl = `http://auth.localhost:${port}/login${returnParam}`;
    } else {
      // For production, always redirect to auth.uchhal.in for authentication
      const domain = currentHost.split('.').slice(1).join('.'); // Get base domain (uchhal.in)
      // Pass origin subdomain as URL parameter for cross-subdomain tracking
      const returnParam =
        currentSubdomain !== 'auth' ? `?return_to=${currentSubdomain}` : '';
      authUrl = `https://auth.${domain}/login${returnParam}`;
    }

    console.log('🔑 Header: Redirecting to AUTH login page:', authUrl);
    console.log('🔑 Will return to subdomain after login:', currentSubdomain);
    window.location.href = authUrl;
  };

  const handleLogout = () => {
    // Clear all authentication data (including student auth)
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('studentAuth');
    localStorage.removeItem('authState');
    localStorage.removeItem('codeVerifier');
    sessionStorage.removeItem('authCodeProcessed');
    sessionStorage.removeItem('isAuthCallback');

    // Force re-check of auth status
    setIsAuthenticated(false);

    // Simple redirect to homepage
    window.location.href = '/';
  };

  return (
    <header className="bg-background/98 shadow-sm sticky top-0 z-50 border-b border-border backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20">
          {/* Logo and Name */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div
              className="h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base md:text-lg"
              style={{ backgroundColor: organization.branding.primaryColor }}
            >
              {organization.name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <h1
                className="text-xl font-medium"
                style={{
                  color: organization.branding.primaryColor,
                  transition: 'none !important',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                  fontSize: '1.25rem',
                  lineHeight: '1.75rem',
                }}
              >
                {organization.name}
              </h1>
              <p
                className="text-sm font-light text-muted-foreground"
                style={{
                  transition: 'none !important',
                  transform: 'translateZ(0)',
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                  fontSize: '0.875rem',
                  lineHeight: '1.25rem',
                }}
              >
                {organization.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className={`font-medium transition-all duration-200 hover:scale-105 cursor-pointer px-2 py-1 rounded-md ${
                        isActive ? 'border-b-2' : 'text-foreground'
                      }`}
                      style={{
                        color: isActive
                          ? organization.branding.primaryColor
                          : undefined,
                        borderBottomColor: isActive
                          ? organization.branding.primaryColor
                          : 'transparent',
                        backgroundColor: isActive
                          ? `${organization.branding.primaryColor}10`
                          : 'transparent',
                        fontWeight: isActive ? '600' : '500',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color =
                            organization.branding.primaryColor;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.color = '';
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Theme Toggle & Auth Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <ThemeToggle />
            <div>
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Button
                    className="font-medium px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 text-white"
                    variant="outline"
                    onClick={() => handleNavigation('/dashboard')}
                  >
                    Dashboard
                  </Button>
                  <Button
                    className="font-medium px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 text-white hover:text-white"
                    style={{
                      backgroundColor: '#ef4444',
                      borderColor: '#ef4444',
                      color: 'white',
                    }}
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  className="font-medium px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 text-white hover:text-white"
                  style={{
                    backgroundColor: organization.branding.primaryColor,
                    borderColor: organization.branding.primaryColor,
                    color: 'white',
                  }}
                  onClick={handleAuthLogin}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-accent transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border bg-background backdrop-blur-sm">
            <nav className="py-3 sm:py-4">
              <ul className="space-y-3 sm:space-y-4 px-2 sm:px-0">
                {navigationItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <button
                        onClick={() => {
                          handleNavigation(item.href);
                          setIsMenuOpen(false);
                        }}
                        className={`block py-2 sm:py-3 px-2 font-medium transition-colors duration-200 text-sm sm:text-base rounded-lg w-full text-left text-foreground hover:bg-muted/50`}
                        style={{
                          color: isActive
                            ? organization.branding.primaryColor
                            : undefined,
                          backgroundColor: isActive
                            ? `${organization.branding.primaryColor}15`
                            : undefined,
                          fontWeight: isActive ? '600' : '500',
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
                <li className="pt-3 sm:pt-4 px-2 sm:px-0 flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Theme
                  </span>
                  <ThemeToggle />
                </li>
                <li className="px-2 sm:px-0">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <Button
                        className="w-full font-medium py-2.5 sm:py-3 text-sm sm:text-base rounded-full shadow-sm text-white hover:text-white"
                        style={{
                          backgroundColor: organization.branding.primaryColor,
                          borderColor: organization.branding.primaryColor,
                          color: 'white',
                        }}
                        onClick={() => {
                          handleNavigation('/dashboard');
                          setIsMenuOpen(false);
                        }}
                      >
                        Dashboard
                      </Button>
                      <Button
                        className="w-full font-medium py-2.5 sm:py-3 text-sm sm:text-base rounded-full shadow-sm text-white hover:text-white"
                        style={{
                          backgroundColor: '#ef4444',
                          borderColor: '#ef4444',
                          color: 'white',
                        }}
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full font-medium py-2.5 sm:py-3 text-sm sm:text-base rounded-full shadow-sm text-white hover:text-white"
                      style={{
                        backgroundColor: organization.branding.primaryColor,
                        borderColor: organization.branding.primaryColor,
                        color: 'white',
                      }}
                      onClick={() => {
                        handleAuthLogin();
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign in
                    </Button>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
