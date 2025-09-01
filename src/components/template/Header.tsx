'use client';

import { useState } from 'react';

import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
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
  const pathname = usePathname();

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  const handleAuthLogin = () => {
    const AUTH0_Client_Id = process.env.NEXT_PUBLIC_AUTH0_Client_Id || '';
    const AUTH0_Domain_Name = process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME || '';
    const login_redirect =
      process.env.NEXT_PUBLIC_AUTH0_LOGIN_REDIRECT_URL || '';

    try {
      window.location.href = `https://${AUTH0_Domain_Name}/authorize?response_type=code&client_id=${AUTH0_Client_Id}&redirect_uri=${login_redirect}&scope=${encodeURIComponent('openid profile email')}`;
    } catch (error) {
      console.error('Login redirect error:', error);
    }
  };

  return (
    <header
      className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
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
                className="text-sm font-light"
                style={{
                  color: '#6b7280',
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
                        isActive ? 'border-b-2' : ''
                      }`}
                      style={{
                        color: isActive
                          ? organization.branding.primaryColor
                          : '#374151',
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
                          e.currentTarget.style.color = '#374151';
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

          {/* Sign In Button */}
          <div className="hidden md:block">
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
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X
                className="h-5 w-5 sm:h-6 sm:w-6"
                style={{ color: organization.branding.primaryColor }}
              />
            ) : (
              <Menu
                className="h-5 w-5 sm:h-6 sm:w-6"
                style={{ color: organization.branding.primaryColor }}
              />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div
            className="lg:hidden border-t border-gray-100 bg-white"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
          >
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
                        className={`block py-2 sm:py-3 px-2 font-medium transition-colors duration-200 text-sm sm:text-base rounded-lg hover:bg-gray-50 w-full text-left ${
                          isActive ? 'bg-gray-100' : ''
                        }`}
                        style={{
                          color: isActive
                            ? organization.branding.primaryColor
                            : '#374151',
                          backgroundColor: isActive
                            ? `${organization.branding.primaryColor}15`
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
                            e.currentTarget.style.color = '#374151';
                          }
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                })}
                <li className="pt-3 sm:pt-4 px-2 sm:px-0">
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
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
