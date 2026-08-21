'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { OrganizationConfig } from '@/types/organization';

import { NotificationPanel } from './NotificationPanel';

interface AboutSectionProps {
  data: OrganizationConfig['about'];
  branding: OrganizationConfig['branding'];
  organizationName: string;
  news?: OrganizationConfig['news'];
  showNotifications?: boolean;
}

export function AboutSection({
  data,
  branding,
  news,
  showNotifications = true,
}: AboutSectionProps) {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      title: string;
      content: string;
      isNew?: boolean;
    }>
  >([]);

  // Helper function to truncate text if it exceeds 60 words
  const truncateText = (text: string, maxWords: number = 45): string => {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) {
      return text;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Use news data from props (already fetched by parent)
  useEffect(() => {
    if (!showNotifications || !news?.items) return;

    // Transform news items to notification format
    const newsNotifications = news.items
      .map((item, index) => ({
        id: String(index + 1),
        title: item.title,
        content: item.excerpt || item.title,
        isNew: index < 2, // Mark first 2 as new
      }))
      .slice(0, 5); // Show max 5 notifications

    setNotifications(newsNotifications);
  }, [showNotifications, news]);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 sm:mb-6 tracking-tight text-foreground">
            {data.title}
          </h2>
          <div
            className="w-16 sm:w-20 h-1 mx-auto mb-6 sm:mb-8 rounded-full"
            style={{ backgroundColor: branding.accentColor }}
          ></div>
        </div>

        {/* Hero Image/Notifications and Content Section */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          {showNotifications && news ? (
            // Layout with Notifications on Left and Content on Right (Home Page)
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              {/* Notifications Panel - Left Side */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                <NotificationPanel
                  notifications={notifications}
                  title={news.title || 'Latest Updates'}
                  primaryColor={branding.primaryColor}
                  accentColor={branding.accentColor}
                />
              </div>

              {/* Content - Right Side */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="bg-accent/80 dark:bg-card rounded-lg border border-border dark:border-white/10 p-8 sm:p-10 lg:p-12 h-full shadow-sm">
                  <div className="prose prose-gray max-w-none">
                    <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground">
                      {data.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : data.images && data.images.length > 0 && data.images[0] ? (
            // Layout with Hero Image on Left and Content on Right (About Page)
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
              {/* Hero Image - Left Side */}
              <div className="order-1">
                <div className="relative rounded-lg overflow-hidden shadow-lg border border-border dark:border-white/10 h-full min-h-[350px] lg:min-h-[450px]">
                  <Image
                    src={data.images[0]}
                    alt="About Hero"
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              </div>

              {/* Content - Right Side */}
              <div className="order-2">
                <div className="bg-accent/80 dark:bg-card rounded-lg border border-border dark:border-white/10 p-8 sm:p-10 lg:p-12 h-full flex items-center shadow-sm">
                  <div className="prose prose-gray max-w-none w-full">
                    <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground">
                      {data.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Full Width Content - No Hero Image or Notifications
            <div className="bg-accent/80 dark:bg-card rounded-lg border border-border dark:border-white/10 p-8 sm:p-10 lg:p-12 shadow-sm">
              <div className="prose prose-gray max-w-none">
                <p className="text-base sm:text-lg lg:text-xl leading-relaxed text-muted-foreground">
                  {data.content}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-16">
          <div className="text-center group px-6 sm:px-8 py-8 bg-accent/50 dark:bg-card/50 rounded-lg border border-border dark:border-white/5 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-22 lg:h-22 mx-auto mb-5 sm:mb-7 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 bg-accent/50 dark:bg-white/10 border-2 border-border dark:border-white/20">
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 rounded-full shadow-lg ring-2 ring-white dark:ring-white/90"
                style={{ backgroundColor: branding.primaryColor }}
              ></div>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-5 text-foreground">
              Our Mission
            </h3>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
              {truncateText(data.mission)}
            </p>
          </div>

          <div className="text-center group px-6 sm:px-8 py-8 bg-accent/50 dark:bg-card/50 rounded-lg border border-border dark:border-white/5 hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-22 lg:h-22 mx-auto mb-5 sm:mb-7 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 bg-accent/50 dark:bg-white/10 border-2 border-border dark:border-white/20">
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 rounded-full shadow-lg ring-2 ring-white dark:ring-white/90"
                style={{ backgroundColor: branding.secondaryColor }}
              ></div>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-5 text-foreground">
              Our Vision
            </h3>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground">
              {truncateText(data.vision)}
            </p>
          </div>

          <div className="text-center group px-6 sm:px-8 py-8 bg-accent/50 dark:bg-card/50 rounded-lg border border-border dark:border-white/5 hover:shadow-lg transition-all duration-300 md:col-span-1">
            <div className="w-16 h-16 sm:w-18 sm:h-18 lg:w-22 lg:h-22 mx-auto mb-5 sm:mb-7 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 bg-accent/50 dark:bg-white/10 border-2 border-border dark:border-white/20">
              <div
                className="w-7 h-7 sm:w-9 sm:h-9 lg:w-11 lg:h-11 rounded-full shadow-lg ring-2 ring-white dark:ring-white/90"
                style={{ backgroundColor: branding.accentColor }}
              ></div>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-4 sm:mb-5 text-foreground">
              Our Values
            </h3>
            <div className="space-y-2.5 sm:space-y-3.5">
              {data.values.slice(0, 5).map((value, index) => (
                <p
                  key={index}
                  className="text-sm sm:text-base lg:text-lg leading-relaxed text-muted-foreground"
                >
                  {value}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
