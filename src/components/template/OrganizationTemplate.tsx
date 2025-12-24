'use client';

import { OrganizationConfig } from '@/types/organization';

import { AboutSection } from './AboutSection';
import { Footer } from './Footer';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { NotificationBanner } from './NotificationBanner';
import { StatsSection } from './StatsSection';

interface OrganizationTemplateProps {
  data: OrganizationConfig;
  customSections?: React.ReactNode[];
}

export function OrganizationTemplate({
  data,
  customSections,
}: OrganizationTemplateProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Dynamic CSS Variables */}
      <style jsx global>{`
        :root {
          --primary-color: ${data.branding.primaryColor};
          --secondary-color: ${data.branding.secondaryColor};
          --accent-color: ${data.branding.accentColor};
        }

        /* Support both light and dark modes */
        .template-container * {
          color-scheme: light dark;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Smooth transitions and soft UI */
        .template-container * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Exclude header from global transitions to prevent blinking */
        .template-container header,
        .template-container header * {
          transition: none !important;
        }

        /* Allow specific transitions for header elements */
        .template-container header button {
          transition:
            color 0.2s ease,
            background-color 0.2s ease,
            transform 0.2s ease !important;
        }

        /* Fix header stability */
        .template-container header {
          backface-visibility: hidden;
          transform: translateZ(0);
          will-change: auto;
        }

        /* Specifically fix text elements in header */
        .template-container header h1,
        .template-container header p,
        .template-container header span {
          backface-visibility: hidden !important;
          transform: translateZ(0) !important;
          transition: none !important;
          will-change: auto !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }

        /* Soft shadows and rounded corners */
        .template-container .shadow-lg {
          box-shadow:
            0 10px 25px -3px rgba(0, 0, 0, 0.1),
            0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-radius: 16px;
        }

        .template-container .shadow-xl {
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-radius: 20px;
        }

        /* Smooth hover effects */
        .template-container .hover\\:scale-105:hover {
          transform: scale(1.02);
        }

        .template-container .hover\\:scale-110:hover {
          transform: scale(1.05);
        }

        /* Soft button styles */
        .template-container button {
          border-radius: 12px;
          font-weight: 500;
          letter-spacing: 0.025em;
        }

        /* Gentle background gradients */
        .template-container .bg-gradient-soft {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(248, 250, 252, 0.9) 100%
          );
        }
      `}</style>

      <div className="template-container">
        <Header organization={data} />

        <main>
          <HeroSection data={data.hero} branding={data.branding} />
          <NotificationBanner
            message="🎓 New admission process has started! Apply now for the upcoming academic year. Contact us for more details."
            backgroundColor={data.branding.primaryColor}
            textColor="#ffffff"
            speed={30}
          />
          <AboutSection
            data={data.about}
            branding={data.branding}
            organizationName={data.name}
            news={data.news}
          />
          {data.stats && data.stats.items && data.stats.items.length > 0 && (
            <StatsSection data={data.stats} branding={data.branding} />
          )}
          {/* Custom sections can be inserted here */}
          {customSections?.map((section, index) => (
            <div key={index}>{section}</div>
          ))}
        </main>

        <Footer organization={data} />
      </div>
    </div>
  );
}
