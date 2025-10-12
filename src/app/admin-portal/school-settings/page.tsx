'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApiService } from '@/services/api';

interface SchoolSettings {
  // Basic Information
  name: string;
  subdomain: string;
  description: string;
  buildingStreet: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  pocName: string;
  pocEmail: string;
  phone: string;
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
  aboutImages: string[];

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;

  // Social Media
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
}

export default function SchoolSettings() {
  const [settings, setSettings] = useState<SchoolSettings>({
    // Basic Information
    name: 'SHREE LAHARI SINGH MEMO. INTER COLLEGE',
    subdomain: 'spd',
    description: 'Leading educational institution focused on excellence',
    buildingStreet: '123 Main Street, Block A',
    city: 'GHANGHAULI',
    state: 'UTTAR PRADESH',
    country: 'India',
    pincode: '202001',
    pocName: 'Principal Name',
    pocEmail: 'principal@school.edu.in',
    phone: '+91 571 123 4567',
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
    aboutImages: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop',
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
    linkedinUrl: 'https://linkedin.com/company/shreelaharischool',
    youtubeUrl: 'https://youtube.com/shreelaharischool',
  });

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modifiedFields, setModifiedFields] = useState<Set<string>>(new Set());
  const [originalSettings, setOriginalSettings] =
    useState<SchoolSettings | null>(null);
  const router = useRouter();

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
        localStorage.removeItem('bearerToken');
        router.push('/');
        return;
      }
    } catch (e) {
      localStorage.removeItem('bearerToken');
      router.push('/');
      return;
    }

    // Load existing settings from localStorage if available
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load data from all APIs
    const loadAllData = async () => {
      setDataLoading(true);
      try {
        await Promise.all([
          loadOrganizationSection(),
          loadAboutSection(),
          loadHeroSection(),
          loadBrandingSection(),
          loadSiteConfigSection(),
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadAllData();
  }, [router]);

  // Store original settings after data is loaded
  useEffect(() => {
    if (!dataLoading && !originalSettings) {
      console.log('Storing original settings:', settings);
      setOriginalSettings({ ...settings });
      setModifiedFields(new Set());
    }
  }, [dataLoading, settings, originalSettings]);

  const loadOrganizationSection = async () => {
    try {
      const orgId = await ApiService.getCurrentOrgId();

      // Get authentication token for the API call
      const tokenStr = localStorage.getItem('bearerToken');
      let accessToken = null;
      if (tokenStr) {
        try {
          const tokenItem = JSON.parse(tokenStr);
          const now = new Date().getTime();
          if (now <= tokenItem.expiry) {
            accessToken = tokenItem.value;
          }
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }

      const response = await ApiService.getOrganizationById(orgId, accessToken);
      const orgData = response.data.attributes;

      // Update settings with API data
      setSettings((prev) => ({
        ...prev,
        name: orgData.name || prev.name,
        subdomain: orgData.subdomain || prev.subdomain,
        description: orgData.description || prev.description,
        // Address mapping
        buildingStreet: orgData.address?.building_street || prev.buildingStreet,
        city: orgData.address?.city || prev.city,
        state: orgData.address?.state || prev.state,
        country: orgData.address?.country || prev.country,
        pincode: orgData.address?.pincode || prev.pincode,
        // Contact mapping
        pocName: orgData.contact?.poc_name || prev.pocName,
        pocEmail: orgData.contact?.poc_email || prev.pocEmail,
        phone: orgData.contact?.phone || prev.phone,
      }));

      console.log('Loaded organization data:', orgData);
      console.log('Updated settings:', settings);
    } catch (error) {
      console.error('Failed to load organization section:', error);
      // Don't show error for 404 (no organization exists yet)
      if (
        error instanceof Error &&
        !error.message.includes('Failed to fetch organization data') &&
        !error.message.includes('404')
      ) {
        setError('Failed to load organization data. Please try again.');
      }
    }
  };

  const loadAboutSection = async () => {
    try {
      const orgId = await ApiService.getCurrentOrgId();
      const response = await ApiService.getAbout(orgId);
      const aboutData = response.data.attributes;

      // Update settings with API data
      setSettings((prev) => ({
        ...prev,
        aboutTitle: aboutData.title,
        aboutContent: aboutData.content,
        mission: aboutData.mission,
        vision: aboutData.vision,
        values: aboutData.values,
        aboutImages: aboutData.images || [],
        facebookUrl: aboutData.social?.facebook || '',
        twitterUrl: aboutData.social?.twitter || '',
        instagramUrl: aboutData.social?.instagram || '',
        linkedinUrl: aboutData.social?.linkedin || '',
        youtubeUrl: aboutData.social?.youtube || '',
      }));
    } catch (error) {
      console.error('Failed to load about section:', error);
      // Don't show error for 404 (no about section exists yet) or expected "about section data" errors
      if (
        error instanceof Error &&
        !error.message.includes('Failed to fetch about section data') &&
        !error.message.includes('404')
      ) {
        // Show specific error for organization ID issues
        if (error.message.includes('Failed to get current organization ID')) {
          setError(
            'Unable to determine organization. Please check your URL or try refreshing the page.',
          );
        } else {
          setError('Failed to load about section data. Please try again.');
        }
      }
    }
  };

  const loadHeroSection = async () => {
    try {
      const orgId = await ApiService.getCurrentOrgId();
      const response = await ApiService.getHero(orgId);
      const heroData = response.data.attributes;

      // Update settings with API data
      setSettings((prev) => ({
        ...prev,
        heroTitle: heroData.headline,
        heroSubtitle: heroData.subheadline,
        heroDescription: heroData.ctaText, // Map ctaText to description
        heroImage: heroData.image,
      }));
    } catch (error) {
      console.error('Failed to load hero section:', error);
      // Don't show error for 404 (no hero section exists yet)
      if (
        error instanceof Error &&
        !error.message.includes('Failed to fetch hero section data') &&
        !error.message.includes('404')
      ) {
        console.log('Hero section not found, using defaults');
      }
    }
  };

  const loadBrandingSection = async () => {
    try {
      const orgId = await ApiService.getCurrentOrgId();
      const response = await ApiService.getBranding(orgId);
      const brandingData = response.data.attributes;

      // Update settings with API data
      setSettings((prev) => ({
        ...prev,
        logo: brandingData.logo,
        // Add other branding fields when available
      }));
    } catch (error) {
      console.error('Failed to load branding section:', error);
      // Don't show error for 404 (no branding section exists yet)
      if (
        error instanceof Error &&
        !error.message.includes('Failed to fetch branding data') &&
        !error.message.includes('404')
      ) {
        console.log('Branding section not found, using defaults');
      }
    }
  };

  const loadSiteConfigSection = async () => {
    try {
      const orgId = await ApiService.getCurrentOrgId();
      const response = await ApiService.getSiteConfig(orgId);
      const siteConfigData = response.data.attributes;

      // Update settings with API data
      setSettings((prev) => ({
        ...prev,
        primaryColor: siteConfigData.theme?.primaryColor || prev.primaryColor,
        secondaryColor:
          siteConfigData.theme?.secondaryColor || prev.secondaryColor,
        // Note: accentColor is not in siteconfig API, keeping local value
      }));
    } catch (error) {
      console.error('Failed to load site config section:', error);
      // Don't show error for 404 (no site config exists yet)
      if (
        error instanceof Error &&
        !error.message.includes('Failed to fetch site configuration') &&
        !error.message.includes('404')
      ) {
        console.log('Site config section not found, using defaults');
      }
    }
  };

  const handleSave = async () => {
    if (dataLoading) {
      setError('Please wait for data to finish loading before saving.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const orgId = await ApiService.getCurrentOrgId();

      // Call different APIs based on the active tab
      switch (activeTab) {
        case 'basic':
          // Check if any basic info fields were modified
          const basicFields = [
            'name',
            'subdomain',
            'description',
            'buildingStreet',
            'city',
            'state',
            'country',
            'pincode',
            'pocName',
            'pocEmail',
            'phone',
          ];
          const modifiedBasicFields = Array.from(modifiedFields).filter(
            (field) => basicFields.includes(field),
          );

          if (modifiedBasicFields.length === 0) {
            setSuccessMessage('No changes to save.');
            break;
          }

          console.log('Modified basic fields:', modifiedBasicFields);

          // Build PATCH data with only modified fields
          const organizationData: any = {};

          // Check if any main org fields were modified
          if (modifiedFields.has('name')) {
            organizationData.name = settings.name.trim();
          }
          if (modifiedFields.has('subdomain')) {
            organizationData.subdomain = settings.subdomain.trim();
          }
          if (modifiedFields.has('description')) {
            organizationData.description = settings.description.trim();
          }

          // Check if any address fields were modified
          const addressFields = [
            'buildingStreet',
            'city',
            'state',
            'country',
            'pincode',
          ];
          const modifiedAddressFields = addressFields.filter((field) =>
            modifiedFields.has(field),
          );

          if (modifiedAddressFields.length > 0) {
            organizationData.address = {};
            if (modifiedFields.has('buildingStreet')) {
              organizationData.address.building_street =
                settings.buildingStreet.trim();
            }
            if (modifiedFields.has('city')) {
              organizationData.address.city = settings.city.trim();
            }
            if (modifiedFields.has('state')) {
              organizationData.address.state = settings.state.trim();
            }
            if (modifiedFields.has('country')) {
              organizationData.address.country = settings.country.trim();
            }
            if (modifiedFields.has('pincode')) {
              organizationData.address.pincode = settings.pincode.trim();
            }
          }

          // Check if any contact fields were modified
          const contactFields = ['pocName', 'pocEmail', 'phone'];
          const modifiedContactFields = contactFields.filter((field) =>
            modifiedFields.has(field),
          );

          if (modifiedContactFields.length > 0) {
            organizationData.contact = {};
            if (modifiedFields.has('pocName')) {
              organizationData.contact.poc_name = settings.pocName.trim();
            }
            if (modifiedFields.has('pocEmail')) {
              organizationData.contact.poc_email = settings.pocEmail.trim();
            }
            if (modifiedFields.has('phone')) {
              organizationData.contact.phone = settings.phone.trim();
            }
          }

          console.log('PATCH data to send:', organizationData);

          await ApiService.updateOrganization(orgId, organizationData);

          // Reset modified fields after successful save
          setModifiedFields(new Set());
          setOriginalSettings({ ...settings });

          setSuccessMessage(`Updated: ${modifiedBasicFields.join(', ')}`);
          break;

        case 'branding':
          // Save logo to branding API
          const brandingData = {
            logo: settings.logo,
            // Add other branding fields when they're added to settings interface
          };
          await ApiService.updateBranding(orgId, brandingData);

          // Save colors to siteconfig API
          const siteConfigData = {
            theme: {
              primaryColor: settings.primaryColor,
              secondaryColor: settings.secondaryColor,
              fontFamily: 'Arial', // Default font family
            },
          };
          await ApiService.updateSiteConfig(orgId, siteConfigData);

          setSuccessMessage('Branding settings saved successfully!');
          break;

        case 'content':
          // Save about section to API
          const aboutData = {
            title: settings.aboutTitle,
            content: settings.aboutContent,
            mission: settings.mission,
            vision: settings.vision,
            values: settings.values,
            images: settings.aboutImages,
            social: {
              facebook: settings.facebookUrl,
              twitter: settings.twitterUrl,
              instagram: settings.instagramUrl,
              linkedin: settings.linkedinUrl,
              youtube: settings.youtubeUrl,
            },
          };
          await ApiService.updateAbout(orgId, aboutData);
          setSuccessMessage('About section saved successfully!');
          break;

        case 'hero':
          // Save hero section to API
          const heroData = {
            headline: settings.heroTitle,
            subheadline: settings.heroSubtitle,
            ctaText: 'Learn More', // Default CTA text
            ctaLink: '/about', // Default CTA link
            image: settings.heroImage,
          };
          await ApiService.updateHero(orgId, heroData);
          setSuccessMessage('Hero section saved successfully!');
          break;

        case 'social':
          // Save social media links as part of about section
          const socialData = {
            title: settings.aboutTitle,
            content: settings.aboutContent,
            mission: settings.mission,
            vision: settings.vision,
            values: settings.values,
            images: settings.aboutImages,
            social: {
              facebook: settings.facebookUrl,
              twitter: settings.twitterUrl,
              instagram: settings.instagramUrl,
              linkedin: settings.linkedinUrl,
              youtube: settings.youtubeUrl,
            },
          };
          await ApiService.updateAbout(orgId, socialData);
          setSuccessMessage('Social media links saved successfully!');
          break;

        default:
          throw new Error('Unknown tab selected');
      }

      // Save all settings to localStorage for local state management
      localStorage.setItem('schoolSettings', JSON.stringify(settings));

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Error saving settings. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (field: keyof SchoolSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Track which fields have been modified
    if (originalSettings) {
      const originalValue = originalSettings[field];
      if (originalValue !== value) {
        setModifiedFields((prev) => new Set(prev).add(field));
      } else {
        setModifiedFields((prev) => {
          const newSet = new Set(prev);
          newSet.delete(field);
          return newSet;
        });
      }
    }
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
                disabled={loading || dataLoading}
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
                {dataLoading
                  ? 'Loading Data...'
                  : loading
                    ? 'Saving...'
                    : 'Save Changes'}
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
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                <div className="flex">
                  <svg
                    className="w-5 h-5 mr-2 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-medium">Success</p>
                    <p className="text-sm">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

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
                        Organization Name{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => updateSetting('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subdomain
                      </label>
                      <input
                        type="text"
                        value={settings.subdomain}
                        onChange={(e) =>
                          updateSetting('subdomain', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., spd, math, english"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={settings.description}
                        onChange={(e) =>
                          updateSetting('description', e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Brief description of your organization"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Building/Street Address{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.buildingStreet}
                        onChange={(e) =>
                          updateSetting('buildingStreet', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="123 Main Street, Block A"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.city}
                        onChange={(e) => updateSetting('city', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="City name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.state}
                        onChange={(e) => updateSetting('state', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="State name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.country}
                        onChange={(e) =>
                          updateSetting('country', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Country name"
                        required
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
                        Point of Contact Name{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.pocName}
                        onChange={(e) =>
                          updateSetting('pocName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Principal/Admin name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={settings.pocEmail}
                        onChange={(e) =>
                          updateSetting('pocEmail', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="contact@organization.edu"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => updateSetting('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+91-9876543210"
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
                        placeholder="e.g., 1985"
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

                  {/* About Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      About Section Images
                    </label>
                    {settings.aboutImages.map((image, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 mb-2"
                      >
                        <input
                          type="url"
                          value={image}
                          onChange={(e) =>
                            updateValueAtIndex(
                              'aboutImages',
                              index,
                              e.target.value,
                            )
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="https://example.com/image.jpg"
                        />
                        <button
                          onClick={() => removeValue('aboutImages', index)}
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
                      onClick={() => addValue('aboutImages')}
                      className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                    >
                      + Add Image
                    </button>

                    {/* Image Preview */}
                    {settings.aboutImages.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Image Preview
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {settings.aboutImages.map(
                            (image, index) =>
                              image && (
                                <div key={index} className="relative">
                                  <img
                                    src={image}
                                    alt={`About image ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-md"
                                    onError={(e) => {
                                      (
                                        e.target as HTMLImageElement
                                      ).style.display = 'none';
                                    }}
                                  />
                                </div>
                              ),
                          )}
                        </div>
                      </div>
                    )}
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
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={settings.linkedinUrl}
                        onChange={(e) =>
                          updateSetting('linkedinUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="https://linkedin.com/company/yourschool"
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
