'use client';

import { useEffect } from 'react';

import { useOrganizationData } from '@/hooks/useOrganizationData';

/**
 * ThemeApplier Component
 *
 * This component applies the organization's custom theme (colors and font family)
 * to the entire website using CSS variables and inline styles.
 *
 * It reads the theme configuration from the organization data and applies it globally.
 */
export function ThemeApplier() {
  const { organizationData } = useOrganizationData();

  useEffect(() => {
    // Get theme configuration from organization data
    const primaryColor = organizationData?.branding?.primaryColor || '#000000';
    const secondaryColor =
      organizationData?.branding?.secondaryColor || '#ffffff';
    const fontFamily = organizationData?.branding?.fontFamily || 'Arial';

    // Apply colors as CSS variables
    document.documentElement.style.setProperty(
      '--theme-primary-color',
      primaryColor,
    );
    document.documentElement.style.setProperty(
      '--theme-secondary-color',
      secondaryColor,
    );

    // Apply font family to body
    document.body.style.fontFamily = `${fontFamily}, sans-serif`;

    // Also apply to common elements via CSS
    const style = document.getElementById('theme-custom-styles');
    if (style) {
      style.remove();
    }

    const newStyle = document.createElement('style');
    newStyle.id = 'theme-custom-styles';
    newStyle.innerHTML = `
      body,
      html,
      input:not(.font-preview-input),
      textarea,
      select,
      button:not(.font-preview-card) {
        font-family: '${fontFamily}', sans-serif !important;
      }

      /* Apply theme primary color to common elements */
      .btn-primary,
      .bg-primary {
        background-color: var(--theme-primary-color) !important;
      }

      .text-primary {
        color: var(--theme-primary-color) !important;
      }

      .border-primary {
        border-color: var(--theme-primary-color) !important;
      }

      /* Apply theme secondary color to common elements */
      .btn-secondary,
      .bg-secondary {
        background-color: var(--theme-secondary-color) !important;
      }

      .text-secondary {
        color: var(--theme-secondary-color) !important;
      }

      .border-secondary {
        border-color: var(--theme-secondary-color) !important;
      }
    `;
    document.head.appendChild(newStyle);

    console.log('Theme applied:', {
      primaryColor,
      secondaryColor,
      fontFamily,
    });

    // Cleanup function
    return () => {
      const styleToRemove = document.getElementById('theme-custom-styles');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [organizationData]);

  return null; // This component doesn't render anything
}
