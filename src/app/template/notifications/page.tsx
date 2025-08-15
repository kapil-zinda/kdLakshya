'use client';

import { useState } from 'react';

import Link from 'next/link';

interface NotificationItem {
  id: string;
  title: string;
  date: string;
  isNew?: boolean;
  content: string;
  category: 'admission' | 'event' | 'academic' | 'general';
}

export default function NotificationsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);

  const allNotifications: NotificationItem[] = [
    {
      id: '1',
      title: 'Admission Open for Academic Year 2024-25',
      date: '15 Jan 2024',
      isNew: true,
      category: 'admission',
      content:
        'We are pleased to announce that admissions are now open for the Academic Year 2024-25. Parents and students can apply online through our admission portal. The last date for submission is 28th February 2024.',
    },
    {
      id: '2',
      title: 'Annual Sports Day - Registration Started',
      date: '10 Jan 2024',
      isNew: true,
      category: 'event',
      content:
        'The Annual Sports Day 2024 registration is now open for all students. Various competitions including athletics, swimming, basketball, and football are available. Register before 25th January 2024.',
    },
    {
      id: '3',
      title: 'Parent-Teacher Meeting Schedule Released',
      date: '08 Jan 2024',
      category: 'academic',
      content:
        "The schedule for Parent-Teacher meetings has been released. Meetings will be conducted from 20th to 25th January 2024. Please check your ward's class schedule on the student portal.",
    },
    {
      id: '4',
      title: 'Winter Break Holiday Notice',
      date: '20 Dec 2023',
      category: 'general',
      content:
        'School will remain closed for Winter Break from 25th December 2023 to 5th January 2024. Classes will resume on 8th January 2024. Have a wonderful holiday!',
    },
    {
      id: '5',
      title: 'Science Exhibition 2024 - Call for Projects',
      date: '15 Dec 2023',
      category: 'academic',
      content:
        'Students are invited to participate in the Annual Science Exhibition 2024. Submit your innovative science projects by 30th January 2024. Prizes will be awarded to outstanding projects.',
    },
    {
      id: '6',
      title: 'New Library Books Collection',
      date: '12 Dec 2023',
      category: 'general',
      content:
        'New collection of books has been added to the school library including fiction, non-fiction, and reference books. Students can issue these books starting from 15th December 2023.',
    },
    {
      id: '7',
      title: 'Cultural Fest - Dance & Music Competition',
      date: '05 Dec 2023',
      category: 'event',
      content:
        'Annual Cultural Fest will feature Dance and Music competitions. Students from all grades can participate. Registration forms are available at the school office.',
    },
    {
      id: '8',
      title: 'Mid-Term Examination Schedule',
      date: '01 Dec 2023',
      category: 'academic',
      content:
        'Mid-term examinations will be conducted from 15th to 22nd December 2023. Exam schedule and syllabus details are available on the school website.',
    },
  ];

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
            <Link
              href="/template"
              className="text-blue-600 hover:text-blue-800 mr-4"
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
                    <span className="text-sm text-gray-500">
                      {notification.date}
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
              No notifications available for the selected category.
            </p>
          </div>
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
                    <span className="text-sm text-gray-500">
                      {selectedNotification.date}
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
