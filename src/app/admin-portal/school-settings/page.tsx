'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SchoolSettings {
  // Basic Information
  name: string;
  buildingNumber: string;
  town: string;
  district: string;
  pincode: string;
  phone: string;
  email: string;
  affiliatedCode: string;
  establishedYear: string;

  // Branding
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;

  // About Section
  aboutTitle: string;
  aboutContent: string;
  mission: string;
  vision: string;
  values: string[];

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;

  // Social Media
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

export default function SchoolSettings() {
  const [settings, setSettings] = useState<SchoolSettings>({
    // Basic Information
    name: 'SHREE LAHARI SINGH MEMO. INTER COLLEGE',
    buildingNumber: 'Building 1',
    town: 'GHANGHAULI',
    district: 'ALIGARH',
    pincode: '202001',
    phone: '+91 571 123 4567',
    email: 'info@shreelaharischool.edu.in',
    affiliatedCode: 'UP12345',
    establishedYear: '1985',

    // Branding
    primaryColor: '#1e40af',
    secondaryColor: '#059669',
    accentColor: '#dc2626',
    logo: 'https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=200&fit=crop',

    // About Section
    aboutTitle: 'About Our School',
    aboutContent:
      'We are committed to providing quality education that nurtures young minds and builds character. Our institution has been a beacon of learning excellence for decades.',
    mission:
      'To provide quality education that develops critical thinking, creativity, and character in our students.',
    vision:
      'To be a leading educational institution that prepares students for success in a global society.',
    values: [
      'Excellence in Education',
      'Character Development',
      'Innovation and Creativity',
      'Community Service',
      'Lifelong Learning',
    ],

    // Hero Section
    heroTitle: 'Welcome to Excellence',
    heroSubtitle: 'Nurturing Minds, Building Futures',
    heroDescription:
      'Join our community of learners where every student is empowered to achieve their full potential through innovative teaching and holistic development.',
    heroImage:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=1200&h=800&fit=crop',

    // Social Media
    facebookUrl: 'https://facebook.com/shreelaharischool',
    twitterUrl: 'https://twitter.com/shreelaharischool',
    instagramUrl: 'https://instagram.com/shreelaharischool',
    youtubeUrl: 'https://youtube.com/shreelaharischool',
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const router = useRouter();

  useEffect(() => {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) {
      router.push('/admin-portal/login');
      return;
    }

    // Load existing settings from localStorage if available
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage (in production, save to database)
      localStorage.setItem('schoolSettings', JSON.stringify(settings));

      // Show success message
      alert(
        'School settings saved successfully! The changes will be reflected on the website.',
      );

      // Optional: Trigger a page refresh to see changes immediately
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      alert('Error saving settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (field: keyof SchoolSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateValueAtIndex = (
    field: keyof SchoolSettings,
    index: number,
    value: string,
  ) => {
    const currentValues = settings[field] as string[];
    const newValues = [...currentValues];
    newValues[index] = value;
    updateSetting(field, newValues);
  };

  const addValue = (field: keyof SchoolSettings) => {
    const currentValues = settings[field] as string[];
    updateSetting(field, [...currentValues, '']);
  };

  const removeValue = (field: keyof SchoolSettings, index: number) => {
    const currentValues = settings[field] as string[];
    const newValues = currentValues.filter((_, i) => i !== index);
    updateSetting(field, newValues);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '🏫' },
    { id: 'branding', label: 'Branding', icon: '🎨' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'hero', label: 'Hero Section', icon: '🖼️' },
    { id: 'social', label: 'Social Media', icon: '🌐' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/admin-portal/dashboard"
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
                School Settings
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/template"
                target="_blank"
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                Preview Website
              </Link>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className="mr-3">{tab.icon}</span>
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        School Name
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => updateSetting('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Established Year
                      </label>
                      <input
                        type="text"
                        value={settings.establishedYear}
                        onChange={(e) =>
                          updateSetting('establishedYear', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building Number
                      </label>
                      <input
                        type="text"
                        value={settings.buildingNumber}
                        onChange={(e) =>
                          updateSetting('buildingNumber', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Building 1, Block A, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Town/Village
                      </label>
                      <input
                        type="text"
                        value={settings.town}
                        onChange={(e) => updateSetting('town', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Town or village name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District
                      </label>
                      <input
                        type="text"
                        value={settings.district}
                        onChange={(e) =>
                          updateSetting('district', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="District name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={settings.pincode}
                        onChange={(e) =>
                          updateSetting('pincode', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="6-digit pincode"
                        maxLength={6}
                        pattern="[0-9]{6}"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => updateSetting('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => updateSetting('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Affiliated Code
                      </label>
                      <input
                        type="text"
                        value={settings.affiliatedCode}
                        onChange={(e) =>
                          updateSetting('affiliatedCode', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="School affiliation code (e.g., UP12345)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Branding & Colors
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={settings.logo}
                        onChange={(e) => updateSetting('logo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      {settings.logo && (
                        <div className="mt-2">
                          <img
                            src={settings.logo}
                            alt="Logo Preview"
                            className="w-20 h-20 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) =>
                              updateSetting('primaryColor', e.target.value)
                            }
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.primaryColor}
                            onChange={(e) =>
                              updateSetting('primaryColor', e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) =>
                              updateSetting('secondaryColor', e.target.value)
                            }
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.secondaryColor}
                            onChange={(e) =>
                              updateSetting('secondaryColor', e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Accent Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.accentColor}
                            onChange={(e) =>
                              updateSetting('accentColor', e.target.value)
                            }
                            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.accentColor}
                            onChange={(e) =>
                              updateSetting('accentColor', e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Color Preview
                    </h4>
                    <div className="flex space-x-4">
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        Primary
                      </div>
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: settings.secondaryColor }}
                      >
                        Secondary
                      </div>
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center text-white text-xs font-medium"
                        style={{ backgroundColor: settings.accentColor }}
                      >
                        Accent
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    About Section Content
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Title
                    </label>
                    <input
                      type="text"
                      value={settings.aboutTitle}
                      onChange={(e) =>
                        updateSetting('aboutTitle', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Content
                    </label>
                    <textarea
                      value={settings.aboutContent}
                      onChange={(e) =>
                        updateSetting('aboutContent', e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mission Statement
                    </label>
                    <textarea
                      value={settings.mission}
                      onChange={(e) => updateSetting('mission', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vision Statement
                    </label>
                    <textarea
                      value={settings.vision}
                      onChange={(e) => updateSetting('vision', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Core Values
                    </label>
                    {settings.values.map((value, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="text"
                          value={value}
                          onChange={(e) =>
                            updateValueAtIndex('values', index, e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder={`Value ${index + 1}`}
                        />
                        <button
                          onClick={() => removeValue('values', index)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <svg
                            className="w-4 h-4"
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
                    ))}
                    <button
                      onClick={() => addValue('values')}
                      className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      + Add Value
                    </button>
                  </div>
                </div>
              )}

              {/* Hero Section Tab */}
              {activeTab === 'hero' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hero Section
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitle}
                      onChange={(e) =>
                        updateSetting('heroTitle', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.heroSubtitle}
                      onChange={(e) =>
                        updateSetting('heroSubtitle', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Description
                    </label>
                    <textarea
                      value={settings.heroDescription}
                      onChange={(e) =>
                        updateSetting('heroDescription', e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hero Background Image URL
                    </label>
                    <input
                      type="url"
                      value={settings.heroImage}
                      onChange={(e) =>
                        updateSetting('heroImage', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    {settings.heroImage && (
                      <div className="mt-2">
                        <img
                          src={settings.heroImage}
                          alt="Hero Preview"
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === 'social' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Social Media Links
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={settings.facebookUrl}
                        onChange={(e) =>
                          updateSetting('facebookUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://facebook.com/yourschool"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Twitter URL
                      </label>
                      <input
                        type="url"
                        value={settings.twitterUrl}
                        onChange={(e) =>
                          updateSetting('twitterUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://twitter.com/yourschool"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={settings.instagramUrl}
                        onChange={(e) =>
                          updateSetting('instagramUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://instagram.com/yourschool"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={settings.youtubeUrl}
                        onChange={(e) =>
                          updateSetting('youtubeUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://youtube.com/yourschool"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
