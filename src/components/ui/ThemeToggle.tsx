'use client';

import { useEffect, useRef, useState } from 'react';

import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle SSR hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    // Add a small delay before closing
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // 200ms delay
  };

  // Get current theme icon
  const getCurrentIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />;
    if (theme === 'dark') return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="relative">
        <button className="inline-flex items-center justify-center rounded-md h-9 w-9 border border-border bg-background hover:bg-accent">
          <Sun className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Compact Button */}
      <button
        className="inline-flex items-center justify-center rounded-md h-9 w-9 border border-border bg-background hover:bg-accent transition-colors"
        aria-label="Toggle theme"
      >
        {getCurrentIcon()}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 rounded-lg border border-border bg-background shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-colors ${
              theme === 'light'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            <Sun className="h-4 w-4 mr-3" />
            Light
          </button>
          <button
            onClick={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            <Moon className="h-4 w-4 mr-3" />
            Dark
          </button>
          <button
            onClick={() => {
              if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
              }
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium transition-colors ${
              theme === 'system'
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground hover:bg-accent'
            }`}
          >
            <Monitor className="h-4 w-4 mr-3" />
            System
          </button>
        </div>
      )}
    </div>
  );
}
