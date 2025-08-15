'use client';

import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { OrganizationConfig } from '@/types/organization';
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  Menu,
  Settings,
  X,
} from 'lucide-react';

interface HeaderProps {
  organization: OrganizationConfig;
}

const navigationItems = [
  { label: 'Home', href: '/template', action: null },
  { label: 'About', href: '/template/about', action: null },
  { label: 'Faculties', href: '/template/faculties', action: null },
  { label: 'Gallery', href: '/template/gallery', action: null },
  { label: 'Contact', href: '/template/contact', action: null },
];

export function Header({ organization }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigation = (href: string) => {
    window.location.href = href;
  };

  const handleRoleSelection = (role: 'student' | 'teacher' | 'admin') => {
    if (role === 'admin') {
      window.location.href = '/admin-portal/login';
    } else {
      window.location.href =
        role === 'student' ? '/template/student' : '/template/teacher';
    }
    setIsDropdownOpen(false);
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
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className="font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
                    style={{ color: '#374151' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color =
                        organization.branding.primaryColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#374151';
                    }}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Sign In Dropdown */}
          <div className="hidden md:block relative" ref={dropdownRef}>
            <Button
              className="font-medium px-4 sm:px-6 py-2 text-sm sm:text-base rounded-full shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 text-white hover:text-white flex items-center"
              style={{
                backgroundColor: organization.branding.primaryColor,
                borderColor: organization.branding.primaryColor,
                color: 'white',
              }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              Sign in
              <ChevronDown
                className={`h-4 w-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
              />
            </Button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                <button
                  onClick={() => handleRoleSelection('student')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center text-gray-700 hover:text-gray-900"
                >
                  <GraduationCap
                    className="h-4 w-4 mr-2"
                    style={{ color: organization.branding.primaryColor }}
                  />
                  As a Student
                </button>
                <button
                  onClick={() => handleRoleSelection('teacher')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center text-gray-700 hover:text-gray-900"
                >
                  <BookOpen
                    className="h-4 w-4 mr-2"
                    style={{ color: organization.branding.secondaryColor }}
                  />
                  As a Teacher
                </button>
                <button
                  onClick={() => handleRoleSelection('admin')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center text-gray-700 hover:text-gray-900"
                >
                  <Settings
                    className="h-4 w-4 mr-2"
                    style={{ color: '#6366f1' }}
                  />
                  As an Admin
                </button>
              </div>
            )}
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
                {navigationItems.map((item) => (
                  <li key={item.href}>
                    <button
                      onClick={() => {
                        handleNavigation(item.href);
                        setIsMenuOpen(false);
                      }}
                      className="block py-2 sm:py-3 px-2 font-medium transition-colors duration-200 text-sm sm:text-base rounded-lg hover:bg-gray-50 w-full text-left"
                      style={{ color: '#374151' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color =
                          organization.branding.primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#374151';
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
                <li className="pt-3 sm:pt-4 px-2 sm:px-0">
                  <div className="space-y-2">
                    <Button
                      className="w-full font-medium py-2.5 sm:py-3 text-sm sm:text-base rounded-full shadow-sm text-white hover:text-white flex items-center justify-center"
                      style={{
                        backgroundColor: organization.branding.primaryColor,
                        borderColor: organization.branding.primaryColor,
                        color: 'white',
                      }}
                      onClick={() => {
                        handleRoleSelection('student');
                        setIsMenuOpen(false);
                      }}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Sign in as Student
                    </Button>
                    <Button
                      className="w-full font-medium py-2.5 sm:py-3 text-sm sm:text-base rounded-full shadow-sm text-white hover:text-white flex items-center justify-center"
                      style={{
                        backgroundColor: organization.branding.secondaryColor,
                        borderColor: organization.branding.secondaryColor,
                        color: 'white',
                      }}
                      onClick={() => {
                        handleRoleSelection('teacher');
                        setIsMenuOpen(false);
                      }}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Sign in as Teacher
                    </Button>
                    <Button
                      className="w-full font-medium py-2.5 sm:py-3 text-sm sm:text-base rounded-full shadow-sm text-white hover:text-white flex items-center justify-center"
                      style={{
                        backgroundColor: '#6366f1',
                        borderColor: '#6366f1',
                        color: 'white',
                      }}
                      onClick={() => {
                        handleRoleSelection('admin');
                        setIsMenuOpen(false);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Sign in as Admin
                    </Button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
