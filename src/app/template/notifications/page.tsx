'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { ApiService } from '@/services/api';
import { getSubdomain } from '@/utils/subdomainUtils';

interface NotificationItem {
  id: string;
  title: string;
  isNew?: boolean;
  content: string;
  category: 'admission' | 'event' | 'academic' | 'general';
}

export default function NotificationsPage() {
  const [allNotifications, setAllNotifications] = useState<NotificationItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const subdomain = getSubdomain();

      // First get organization ID
      const orgResponse = await ApiService.getOrganization(subdomain || 'sls');
      const orgId = orgResponse.data.id;

      // Then get news/notifications
      const newsResponse = await ApiService.getNews(orgId);

      // Transform API data to notification format
      const apiNotifications: NotificationItem[] = newsResponse.data.map(
        (newsItem) => ({
          id: newsItem.id,
          title: newsItem.attributes.title,
          content: newsItem.attributes.content,
          category: 'general' as const, // Default category - you can enhance this mapping
          isNew:
            new Date().getTime() - newsItem.attributes.publishedAt * 1000 <
            7 * 24 * 60 * 60 * 1000, // New if published within 7 days
        }),
      );

      setAllNotifications(apiNotifications);
    } catch (error) {
      console.error('Failed to load notifications from API:', error);
      // Keep empty array if API fails - no static fallback
      setAllNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const categories = [
    { key: 'all', label: 'All Notifications' },
    { key: 'admission', label: 'Admissions' },
    { key: 'academic', label: 'Academic' },
    { key: 'event', label: 'Events' },
    { key: 'general', label: 'General' },
  ];

  const filteredNotifications =
    selectedCategory === 'all'
      ? allNotifications
      : allNotifications.filter((n) => n.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors = {
      admission: 'bg-blue-100 text-blue-800',
      academic: 'bg-green-100 text-green-800',
      event: 'bg-purple-100 text-purple-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800 mr-4">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              All Notifications
            </h1>
          </div>
          <p className="text-gray-600">
            Stay updated with the latest announcements and important information
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading notifications from API...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedNotification(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {notification.isNew && (
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getCategoryColor(notification.category)}`}
                        >
                          {notification.category.charAt(0).toUpperCase() +
                            notification.category.slice(1)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {notification.content}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 ml-4 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredNotifications.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M15 17h5l-5 5v-5zm-5-8h5m-5-4h5m-1 8h-4m4-4h-4m-2-4v16l8-8-8-8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-600">
                  No notifications available from the API for the selected
                  category.
                </p>
              </div>
            )}
          </>
        )}

        {/* Modal for notification details */}
        {selectedNotification && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedNotification.title}
                  </h3>
                  <div className="flex items-center mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getCategoryColor(selectedNotification.category)}`}
                    >
                      {selectedNotification.category.charAt(0).toUpperCase() +
                        selectedNotification.category.slice(1)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-6">
                <div className="text-gray-700 leading-relaxed">
                  {selectedNotification.content}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
