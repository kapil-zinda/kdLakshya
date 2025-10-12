'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: string;
  title: string;
  content: string;
  isNew?: boolean;
  link?: string;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
  title?: string;
  primaryColor?: string;
  accentColor?: string;
}

export function NotificationPanel({
  notifications,
  title = 'Notifications',
  primaryColor = '#1f2937',
  accentColor = '#3b82f6',
}: NotificationPanelProps) {
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-fit">
      {/* Header */}
      <div
        className="px-4 py-3 rounded-t-lg border-b border-gray-200"
        style={{ backgroundColor: primaryColor }}
      >
        <h3 className="text-white font-semibold text-lg flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
          {title}
        </h3>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications available
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => setSelectedNotification(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      {notification.isNew && (
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-2 animate-pulse"
                          style={{ backgroundColor: accentColor }}
                        ></span>
                      )}
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {notification.title}
                      </h4>
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0"
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
        )}
      </div>

      {/* View All Button */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <button
          onClick={() => router.push('/notifications')}
          className="w-full text-sm font-medium py-2 px-4 rounded-md transition-colors duration-200 hover:shadow-md"
          style={{
            backgroundColor: accentColor,
            color: 'white',
          }}
        >
          View All Notifications
        </button>
      </div>

      {/* Modal for notification details */}
      {selectedNotification && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-4 py-3 border-b flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <h3 className="text-white font-semibold">Notification Details</h3>
              <button
                onClick={() => setSelectedNotification(null)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="w-5 h-5"
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
            <div className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {selectedNotification.title}
              </h4>
              <div className="text-sm text-gray-700">
                {selectedNotification.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
