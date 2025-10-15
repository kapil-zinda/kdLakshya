'use client';

import { useEffect, useState } from 'react';

import { ApiService } from '@/services/api';
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
  const [loading, setLoading] = useState(false);

  // Helper function to truncate text if it exceeds 60 words
  const truncateText = (text: string, maxWords: number = 45): string => {
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) {
      return text;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Load real notifications from API
  const loadNotifications = async () => {
    if (!showNotifications || !news) return;

    try {
      setLoading(true);
      const orgId = await ApiService.getCurrentOrgId();
      const newsResponse = await ApiService.getNews(orgId);

      // Transform API data to notification format
      const apiNotifications = newsResponse.data
        .map((newsItem) => ({
          id: newsItem.id,
          title: newsItem.attributes.title,
          content: newsItem.attributes.content,
          isNew:
            new Date().getTime() - newsItem.attributes.publishedAt * 1000 <
            7 * 24 * 60 * 60 * 1000, // New if published within 7 days
        }))
        .slice(0, 5); // Show max 5 notifications

      setNotifications(apiNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      // Fallback to hardcoded data if API fails
      const fallbackNotifications = news.items
        .map((item, index) => ({
          id: String(index + 1),
          title: item.title,
          content:
            'This is a detailed view of the notification. You can add more content here based on your requirements.',
          isNew: index < 2,
        }))
        .slice(0, 5);
      setNotifications(fallbackNotifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [showNotifications, news]);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Title Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 sm:mb-6 tracking-tight"
            style={{ color: branding.primaryColor }}
          >
            {data.title}
          </h2>
          <div
            className="w-16 sm:w-20 h-1 mx-auto mb-6 sm:mb-8 rounded-full"
            style={{ backgroundColor: branding.accentColor }}
          ></div>
        </div>

        {/* Hero Image/Notifications and Content Section */}
        <div className="mb-12 sm:mb-16 lg:mb-20">
          {showNotifications && news ? (
            // Layout with Notifications on Left and Content on Right (Home Page)
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Notifications Panel - Left Side */}
              <div className="lg:col-span-1 order-2 lg:order-1">
                {loading ? (
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-fit">
                    <div
                      className="px-4 py-3 rounded-t-lg border-b border-gray-200"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <h3 className="text-white font-semibold text-lg flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                        {news.title || 'Latest Updates'}
                      </h3>
                    </div>
                    <div className="p-4 text-center text-gray-500">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-2"></div>
                      Loading notifications...
                    </div>
                  </div>
                ) : (
                  <NotificationPanel
                    notifications={notifications}
                    title={news.title || 'Latest Updates'}
                    primaryColor={branding.primaryColor}
                    accentColor={branding.accentColor}
                  />
                )}
              </div>

              {/* Content - Right Side */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="bg-gray-50 rounded-lg p-6 sm:p-8 h-full">
                  <div className="prose prose-gray max-w-none">
                    <p
                      className="text-base sm:text-lg leading-relaxed"
                      style={{ color: '#6b7280' }}
                    >
                      {data.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : data.images && data.images.length > 0 && data.images[0] ? (
            // Layout with Hero Image on Left and Content on Right (About Page)
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Hero Image - Left Side */}
              <div className="order-1">
                <div className="relative rounded-lg overflow-hidden shadow-lg h-full min-h-[300px] lg:min-h-[400px]">
                  <img
                    src={data.images[0]}
                    alt="About Hero"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content - Right Side */}
              <div className="order-2">
                <div className="bg-gray-50 rounded-lg p-6 sm:p-8 h-full flex items-center">
                  <div className="prose prose-gray max-w-none w-full">
                    <p
                      className="text-base sm:text-lg leading-relaxed"
                      style={{ color: '#6b7280' }}
                    >
                      {data.content}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Full Width Content - No Hero Image or Notifications
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8">
              <div className="prose prose-gray max-w-none">
                <p
                  className="text-base sm:text-lg leading-relaxed"
                  style={{ color: '#6b7280' }}
                >
                  {data.content}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center group px-4 sm:px-6">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: `${branding.primaryColor}10` }}
            >
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full"
                style={{ backgroundColor: branding.primaryColor }}
              ></div>
            </div>
            <h3
              className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4"
              style={{ color: branding.primaryColor }}
            >
              Our Mission
            </h3>
            <p
              className="text-sm sm:text-base leading-relaxed font-light"
              style={{ color: '#6b7280' }}
            >
              {truncateText(data.mission)}
            </p>
          </div>

          <div className="text-center group px-4 sm:px-6">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: `${branding.secondaryColor}10` }}
            >
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full"
                style={{ backgroundColor: branding.secondaryColor }}
              ></div>
            </div>
            <h3
              className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4"
              style={{ color: branding.primaryColor }}
            >
              Our Vision
            </h3>
            <p
              className="text-sm sm:text-base leading-relaxed font-light"
              style={{ color: '#6b7280' }}
            >
              {truncateText(data.vision)}
            </p>
          </div>

          <div className="text-center group px-4 sm:px-6 md:col-span-1">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: `${branding.accentColor}10` }}
            >
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full"
                style={{ backgroundColor: branding.accentColor }}
              ></div>
            </div>
            <h3
              className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4"
              style={{ color: branding.primaryColor }}
            >
              Our Values
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {data.values.slice(0, 5).map((value, index) => (
                <p
                  key={index}
                  className="text-xs sm:text-sm lg:text-base leading-relaxed font-light"
                  style={{ color: '#6b7280' }}
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
