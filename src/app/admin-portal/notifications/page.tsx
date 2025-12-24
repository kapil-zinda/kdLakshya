'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { ApiService } from '@/services/api';

interface Notification {
  id: string;
  title: string;
  content: string;
  image?: string;
  category: 'admission' | 'event' | 'academic' | 'general';
  isNew: boolean;
  isActive: boolean;
  publishedAt?: number;
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] =
    useState<Notification | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    image: string;
    category: 'admission' | 'event' | 'academic' | 'general';
    isNew: boolean;
    isActive: boolean;
  }>({
    title: '',
    content: '',
    image: '',
    category: 'general',
    isNew: true,
    isActive: true,
  });
  const router = useRouter();
  const { userData } = useUserDataRedux();

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // Get organization ID from Redux
      const orgId = userData?.orgId;
      if (!orgId) {
        console.error('Organization ID not found');
        setNotifications([]);
        setLoading(false);
        return;
      }

      // Get news/notifications
      const newsResponse = await ApiService.getNews(orgId);

      // Transform API data to notification format
      const apiNotifications: Notification[] = newsResponse.data.map(
        (newsItem) => ({
          id: newsItem.id,
          title: newsItem.attributes.title,
          content: newsItem.attributes.content,
          image: newsItem.attributes.image,
          category: 'general' as const, // Map to existing categories based on your needs
          isNew: true, // You can determine this based on publishedAt date
          isActive: true, // Assume active if in API
          publishedAt: newsItem.attributes.publishedAt,
        }),
      );

      setNotifications(apiNotifications);
    } catch (error) {
      console.error('Failed to load notifications from API:', error);
      // Keep empty array if API fails - no static fallback
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tokenStr = localStorage.getItem('bearerToken');
    if (!tokenStr) {
      router.push('/');
      return;
    }
    try {
      const tokenItem = JSON.parse(tokenStr);
      const now = new Date().getTime();
      if (now > tokenItem.expiry) {
        router.push('/');
        return;
      }
    } catch (e) {
      router.push('/');
      return;
    }

    // Load notifications from API
    loadNotifications();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orgId = userData?.orgId;
      if (!orgId) {
        alert('Organization ID not found. Please refresh the page.');
        setLoading(false);
        return;
      }

      if (editingNotification) {
        // Update existing notification
        await ApiService.updateNews(orgId, editingNotification.id, {
          title: formData.title,
          content: formData.content,
          image: formData.image,
          publishedAt: Math.floor(Date.now() / 1000),
        });

        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === editingNotification.id
              ? {
                  ...notif,
                  ...formData,
                }
              : notif,
          ),
        );
      } else {
        // Create new notification
        const response = await ApiService.createNews(orgId, {
          title: formData.title,
          content: formData.content,
          image: formData.image,
          publishedAt: Math.floor(Date.now() / 1000),
        });

        const newNotification: Notification = {
          id: response.data.id,
          title: response.data.attributes.title,
          content: response.data.attributes.content,
          image: response.data.attributes.image,
          category: formData.category,
          isNew: formData.isNew,
          isActive: formData.isActive,
          publishedAt: response.data.attributes.publishedAt,
        };

        setNotifications((prev) => [newNotification, ...prev]);
      }

      resetForm();
    } catch (error) {
      console.error('Error saving notification:', error);
      alert('Failed to save notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      image: '',
      category: 'general',
      isNew: true,
      isActive: true,
    });
    setShowForm(false);
    setEditingNotification(null);
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      content: notification.content,
      image: notification.image || '',
      category: notification.category,
      isNew: notification.isNew,
      isActive: notification.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      try {
        const orgId = userData?.orgId;
        if (!orgId) {
          alert('Organization ID not found. Please refresh the page.');
          return;
        }
        await ApiService.deleteNews(orgId, id);
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      } catch (error) {
        console.error('Error deleting notification:', error);
        alert('Failed to delete notification. Please try again.');
      }
    }
  };

  const toggleActive = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, isActive: !notif.isActive } : notif,
      ),
    );
  };

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-gray-500 hover:text-gray-700 mr-4"
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
              <h1 className="text-xl font-semibold text-gray-900">
                Notification Management
              </h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Notification
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingNotification
                      ? 'Edit Notification'
                      : 'Create New Notification'}
                  </h3>
                  <button
                    onClick={resetForm}
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
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        image: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value as
                          | 'admission'
                          | 'event'
                          | 'academic'
                          | 'general',
                      }))
                    }
                  >
                    <option value="general">General</option>
                    <option value="admission">Admission</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                  </select>
                </div>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isNew: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Mark as New
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    {editingNotification ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600">Loading notifications from API...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Notifications List */}
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm border p-6 ${!notification.isActive ? 'opacity-60' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getCategoryColor(notification.category)}`}
                        >
                          {notification.category.charAt(0).toUpperCase() +
                            notification.category.slice(1)}
                        </span>
                        {notification.isNew && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-3">
                            New
                          </span>
                        )}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            notification.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {notification.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {notification.content}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => toggleActive(notification.id)}
                        className={`p-2 rounded-md ${
                          notification.isActive
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-50'
                        }`}
                        title={
                          notification.isActive ? 'Deactivate' : 'Activate'
                        }
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
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(notification)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Edit"
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Delete"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {notifications.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No notifications from API
                </h3>
                <p className="text-gray-600 mb-4">
                  No notifications found in the API endpoint.
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Create Notification
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
