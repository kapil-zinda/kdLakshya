'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { ApiService, type OrganizationPatch } from '@/services/api';
import { useAppDispatch } from '@/store/hooks';
import { clearOrganizationData } from '@/store/slices/organizationSlice';

interface Statistic {
  id?: string;
  label: string;
  value: string;
  icon: string;
}

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
  fontFamily: string;

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

  // Statistics
  statistics: Statistic[];
}

export default function SchoolSettings() {
  return (
    <DashboardWrapper allowedRoles={['admin']} redirectTo="/">
      {() => <SchoolSettingsContent />}
    </DashboardWrapper>
  );
}

function SchoolSettingsContent() {
  // Neutral placeholders, not a specific real-looking (but wrong) school -
  // these should only ever be visible for the brief window before the
  // real organization data loads (the Save button stays disabled via
  // dataLoading until then, so these can't accidentally be saved over
  // real settings).
  const [settings, setSettings] = useState<SchoolSettings>({
    // Basic Information
    name: '',
    subdomain: '',
    description: '',
    buildingStreet: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    pocName: '',
    pocEmail: '',
    phone: '',
    establishedYear: '',

    // Branding
    primaryColor: '#1e40af',
    secondaryColor: '#059669',
    accentColor: '#dc2626',
    logo: '',
    fontFamily: 'Arial',

    // About Section
    aboutTitle: '',
    aboutContent: '',
    mission: '',
    vision: '',
    values: [],
    aboutImages: [],

    // Hero Section
    heroTitle: '',
    heroSubtitle: '',
    heroDescription: '',
    heroImage: '',

    // Social Media
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    youtubeUrl: '',

    // Statistics
    statistics: [],
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
  const dispatch = useAppDispatch();

  // Use Redux-cached organization data
  const { organizationData } = useOrganizationData();
  const { userData } = useUserDataRedux();

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

    // Check for tab query parameter in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (
        tabParam &&
        [
          'basic',
          'branding',
          'content',
          'hero',
          'social',
          'statistics',
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam);
      }
    }

    // Load existing settings from localStorage if available
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [router]);

  // Populate settings from cached organization data
  useEffect(() => {
    if (organizationData) {
      console.log('Populating settings from cached organization data');
      setDataLoading(true);

      setSettings((prev) => ({
        ...prev,
        // Basic information
        name: organizationData.name || prev.name,
        description: organizationData.description || prev.description,
        buildingStreet:
          organizationData.contact?.address?.street || prev.buildingStreet,
        city: organizationData.contact?.address?.city || prev.city,
        state: organizationData.contact?.address?.state || prev.state,
        country: organizationData.contact?.address?.country || prev.country,
        pincode: organizationData.contact?.address?.zipCode || prev.pincode,
        pocEmail: organizationData.contact?.email || prev.pocEmail,
        phone: organizationData.contact?.phone || prev.phone,
        establishedYear:
          organizationData.founded?.toString() || prev.establishedYear,

        // Branding
        logo: organizationData.branding?.logo || prev.logo,
        primaryColor:
          organizationData.branding?.primaryColor || prev.primaryColor,
        secondaryColor:
          organizationData.branding?.secondaryColor || prev.secondaryColor,
        accentColor: organizationData.branding?.accentColor || prev.accentColor,
        fontFamily: organizationData.branding?.fontFamily || prev.fontFamily,

        // About section
        aboutTitle: organizationData.about?.title || prev.aboutTitle,
        aboutContent: organizationData.about?.content || prev.aboutContent,
        mission: organizationData.about?.mission || prev.mission,
        vision: organizationData.about?.vision || prev.vision,
        values: organizationData.about?.values || prev.values,
        aboutImages: organizationData.about?.images || prev.aboutImages,

        // Hero section
        heroTitle: organizationData.hero?.title || prev.heroTitle,
        heroSubtitle: organizationData.hero?.subtitle || prev.heroSubtitle,
        heroDescription:
          organizationData.hero?.description || prev.heroDescription,
        heroImage: organizationData.hero?.backgroundImage || prev.heroImage,

        // Social media
        facebookUrl: organizationData.social?.facebook || prev.facebookUrl,
        twitterUrl: organizationData.social?.twitter || prev.twitterUrl,
        instagramUrl: organizationData.social?.instagram || prev.instagramUrl,
        linkedinUrl: organizationData.social?.linkedin || prev.linkedinUrl,
        youtubeUrl: organizationData.social?.youtube || prev.youtubeUrl,

        // Statistics
        statistics:
          organizationData.stats?.items?.map((stat) => ({
            id: stat.id,
            label: stat.label,
            value: stat.value,
            icon: stat.icon || '📊',
          })) || prev.statistics,
      }));

      setDataLoading(false);
    }
  }, [organizationData]);

  // Store original settings after data is loaded
  useEffect(() => {
    if (!dataLoading && !originalSettings) {
      console.log('Storing original settings:', settings);
      setOriginalSettings({ ...settings });
      setModifiedFields(new Set());
    }
  }, [dataLoading, settings, originalSettings]);

  const handleSave = async () => {
    if (dataLoading) {
      setError('Please wait for data to finish loading before saving.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Get orgId from Redux instead of making API call
      const orgId = userData?.orgId;
      if (!orgId) {
        setError('Organization ID not found. Please refresh the page.');
        setLoading(false);
        return;
      }

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
            'establishedYear',
          ];
          const modifiedBasicFields = Array.from(modifiedFields).filter(
            (field) => basicFields.includes(field),
          );

          if (modifiedBasicFields.length === 0) {
            setSuccessMessage('No changes to save.');
            break;
          }

          console.log('Modified basic fields:', modifiedBasicFields);

          // Build PATCH data with smart grouping:
          // - If ANY address field changes, send COMPLETE address
          // - If ANY contact field changes, send COMPLETE contact
          // - Send other fields only if modified
          const organizationData: OrganizationPatch = {};

          // Check main org fields
          if (modifiedFields.has('name')) {
            organizationData.name = settings.name.trim();
          }
          if (modifiedFields.has('subdomain')) {
            organizationData.subdomain = settings.subdomain.trim();
          }
          if (modifiedFields.has('description')) {
            organizationData.description = settings.description.trim();
          }
          if (modifiedFields.has('establishedYear')) {
            const foundedYear = parseInt(settings.establishedYear, 10);
            if (!isNaN(foundedYear)) {
              organizationData.founded = foundedYear;
            }
          }

          // Check if ANY address field was modified
          const addressFields = [
            'buildingStreet',
            'city',
            'state',
            'country',
            'pincode',
          ];
          const hasAddressChange = addressFields.some((field) =>
            modifiedFields.has(field),
          );

          // If any address field changed, send COMPLETE address
          if (hasAddressChange) {
            organizationData.address = {
              building_street: settings.buildingStreet.trim(),
              city: settings.city.trim(),
              state: settings.state.trim(),
              country: settings.country.trim(),
              pincode: settings.pincode.trim(),
            };
          }

          // Check if ANY contact field was modified
          const contactFields = ['pocName', 'pocEmail', 'phone'];
          const hasContactChange = contactFields.some((field) =>
            modifiedFields.has(field),
          );

          // If any contact field changed, send COMPLETE contact
          if (hasContactChange) {
            organizationData.contact = {
              poc_name: settings.pocName.trim(),
              poc_email: settings.pocEmail.trim(),
              phone: settings.phone.trim(),
            };
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
              fontFamily: settings.fontFamily,
            },
          };
          await ApiService.updateSiteConfig(orgId, siteConfigData);

          // Clear organization cache to force refetch with new branding
          dispatch(clearOrganizationData());

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
            description: settings.heroDescription,
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

        case 'statistics':
          // Delete statistics that were removed from the list (the trash
          // icon only used to filter them out of local state - it never
          // called the backend, so they reappeared on the next refetch).
          const currentStatIds = new Set(
            settings.statistics.map((s) => s.id).filter(Boolean),
          );
          const removedStatIds = (originalSettings?.statistics || [])
            .map((s) => s.id)
            .filter((id): id is string => !!id && !currentStatIds.has(id));

          if (removedStatIds.length > 0) {
            await Promise.all(
              removedStatIds.map((id) => ApiService.deleteStat(orgId, id)),
            );
          }

          // Save statistics - create or update each statistic
          const savePromises = settings.statistics.map(async (stat) => {
            if (stat.id) {
              // Update existing statistic
              return ApiService.updateStat(orgId, stat.id, {
                label: stat.label,
                value: stat.value,
                icon: stat.icon,
              });
            } else {
              // Create new statistic
              return ApiService.createStat(orgId, {
                label: stat.label,
                value: stat.value,
                icon: stat.icon,
              });
            }
          });

          await Promise.all(savePromises);
          // Statistics will be reloaded when organization data is refetched
          setSuccessMessage('Statistics saved successfully!');
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

  const updateSetting = (
    field: keyof SchoolSettings,
    value: SchoolSettings[keyof SchoolSettings],
  ) => {
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
    { id: 'statistics', label: 'Statistics', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/dashboard"
                className="text-muted-foreground hover:text-foreground mr-4"
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
              <h1 className="text-xl font-semibold text-foreground">
                School Settings
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {/* <Link
                href="/template"
                target="_blank"
                className="text-indigo-600 hover:text-indigo-500 text-sm"
              >
                Preview Website
              </Link> */}
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
            <nav className="bg-card rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                {tabs.map((tab) => (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
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

            <div className="bg-card rounded-lg shadow-sm p-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Organization Name{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => updateSetting('name', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        required
                      />
                    </div>

                    {/* <div>
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
                    </div> */}

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Description
                      </label>
                      <textarea
                        value={settings.description}
                        onChange={(e) =>
                          updateSetting('description', e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="Brief description of your organization"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Building/Street Address{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.buildingStreet}
                        onChange={(e) =>
                          updateSetting('buildingStreet', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="123 Main Street, Block A"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.city}
                        onChange={(e) => updateSetting('city', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="City name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.state}
                        onChange={(e) => updateSetting('state', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="State name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.country}
                        onChange={(e) =>
                          updateSetting('country', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="Country name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={settings.pincode}
                        onChange={(e) =>
                          updateSetting('pincode', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="6-digit pincode"
                        maxLength={6}
                        pattern="[0-9]{6}"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Point of Contact Name{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={settings.pocName}
                        onChange={(e) =>
                          updateSetting('pocName', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="Principal/Admin name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Contact Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={settings.pocEmail}
                        onChange={(e) =>
                          updateSetting('pocEmail', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="contact@organization.edu"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => updateSetting('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="+91-9876543210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Established Year
                      </label>
                      <input
                        type="text"
                        value={settings.establishedYear}
                        onChange={(e) =>
                          updateSetting('establishedYear', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="e.g., 1985"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Branding Tab */}
              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Branding & Colors
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={settings.logo}
                        onChange={(e) => updateSetting('logo', e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                      />
                      {settings.logo && (
                        <div className="mt-2">
                          <Image
                            src={settings.logo}
                            alt="Logo Preview"
                            width={80}
                            height={80}
                            unoptimized
                            className="w-20 h-20 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.primaryColor}
                            onChange={(e) =>
                              updateSetting('primaryColor', e.target.value)
                            }
                            className="w-12 h-10 border border-border rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.primaryColor}
                            onChange={(e) =>
                              updateSetting('primaryColor', e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings.secondaryColor}
                            onChange={(e) =>
                              updateSetting('secondaryColor', e.target.value)
                            }
                            className="w-12 h-10 border border-border rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={settings.secondaryColor}
                            onChange={(e) =>
                              updateSetting('secondaryColor', e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Font Family
                        </label>
                        <div className="space-y-2">
                          {/* Grid of font preview cards */}
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto border border-border rounded-md p-2 bg-background">
                            {[
                              'Arial',
                              'Helvetica',
                              'Times New Roman',
                              'Georgia',
                              'Courier New',
                              'Verdana',
                              'Tahoma',
                              'Trebuchet MS',
                              'Comic Sans MS',
                              'Impact',
                              'Roboto',
                              'Open Sans',
                              'Lato',
                              'Montserrat',
                              'Poppins',
                              'Press Start 2P',
                              'Pacifico',
                            ].map((font) => (
                              <button
                                key={font}
                                type="button"
                                onClick={() =>
                                  updateSetting('fontFamily', font)
                                }
                                className={`font-preview-card p-3 text-left border rounded transition-all ${
                                  settings.fontFamily === font
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-border hover:border-indigo-300 hover:bg-muted'
                                }`}
                                style={{
                                  fontFamily: `'${font}', sans-serif !important`,
                                }}
                              >
                                <div
                                  className="text-sm font-medium"
                                  style={{
                                    fontFamily: `'${font}', sans-serif !important`,
                                  }}
                                >
                                  {font}
                                </div>
                                <div
                                  className="text-xs text-muted-foreground mt-1"
                                  style={{
                                    fontFamily: `'${font}', sans-serif !important`,
                                  }}
                                >
                                  The quick brown fox
                                </div>
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Currently selected:{' '}
                            <span
                              className="font-medium"
                              style={{
                                fontFamily: `'${settings.fontFamily}', sans-serif`,
                              }}
                            >
                              {settings.fontFamily}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* <div>
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
                      </div> */}
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="mt-6 p-4 border border-border rounded-lg">
                    <h4 className="text-sm font-medium text-foreground mb-3">
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
                    </div>
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    About Section Content
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      About Title
                    </label>
                    <input
                      type="text"
                      value={settings.aboutTitle}
                      onChange={(e) =>
                        updateSetting('aboutTitle', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      About Content
                    </label>
                    <textarea
                      value={settings.aboutContent}
                      onChange={(e) =>
                        updateSetting('aboutContent', e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mission Statement
                    </label>
                    <textarea
                      value={settings.mission}
                      onChange={(e) => updateSetting('mission', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Vision Statement
                    </label>
                    <textarea
                      value={settings.vision}
                      onChange={(e) => updateSetting('vision', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
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
                          className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
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
                    <label className="block text-sm font-medium text-foreground mb-2">
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
                          className="flex-1 px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
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
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Image Preview
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {settings.aboutImages.map(
                            (image, index) =>
                              image && (
                                <div key={index} className="relative">
                                  <Image
                                    src={image}
                                    alt={`About image ${index + 1}`}
                                    width={320}
                                    height={96}
                                    unoptimized
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
                  <h3 className="text-lg font-semibold text-foreground">
                    Hero Section
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hero Title
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitle}
                      onChange={(e) =>
                        updateSetting('heroTitle', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hero Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.heroSubtitle}
                      onChange={(e) =>
                        updateSetting('heroSubtitle', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hero Description
                    </label>
                    <textarea
                      value={settings.heroDescription}
                      onChange={(e) =>
                        updateSetting('heroDescription', e.target.value)
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Hero Background Image URL
                    </label>
                    <input
                      type="url"
                      value={settings.heroImage}
                      onChange={(e) =>
                        updateSetting('heroImage', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                    />
                    {settings.heroImage && (
                      <div className="mt-2">
                        <Image
                          src={settings.heroImage}
                          alt="Hero Preview"
                          width={800}
                          height={128}
                          unoptimized
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
                  <h3 className="text-lg font-semibold text-foreground">
                    Social Media Links
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={settings.facebookUrl}
                        onChange={(e) =>
                          updateSetting('facebookUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="https://facebook.com/yourschool"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Twitter URL
                      </label>
                      <input
                        type="url"
                        value={settings.twitterUrl}
                        onChange={(e) =>
                          updateSetting('twitterUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="https://twitter.com/yourschool"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={settings.instagramUrl}
                        onChange={(e) =>
                          updateSetting('instagramUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="https://instagram.com/yourschool"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        LinkedIn URL
                      </label>
                      <input
                        type="url"
                        value={settings.linkedinUrl}
                        onChange={(e) =>
                          updateSetting('linkedinUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="https://linkedin.com/company/yourschool"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        YouTube URL
                      </label>
                      <input
                        type="url"
                        value={settings.youtubeUrl}
                        onChange={(e) =>
                          updateSetting('youtubeUrl', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-background text-foreground"
                        placeholder="https://youtube.com/yourschool"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Statistics Tab */}
              {activeTab === 'statistics' && (
                <div className="space-y-6 -mx-6">
                  <div className="flex justify-between items-center mb-6 px-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        Statistics & Achievements
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Showcase key metrics and achievements on your school
                        website
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        updateSetting('statistics', [
                          ...settings.statistics,
                          { label: '', value: '', icon: '' },
                        ])
                      }
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors"
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
                      Add Statistic
                    </button>
                  </div>

                  {settings.statistics.length === 0 ? (
                    <div className="text-center py-16 bg-muted/50 rounded-xl border-2 border-dashed border-border mx-6">
                      <div className="text-muted-foreground mb-4">
                        <svg
                          className="w-20 h-20 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">
                        No statistics added yet
                      </h4>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                        Add statistics to showcase your school&apos;s
                        achievements, student count, success rates, and more
                      </p>
                      <button
                        onClick={() =>
                          updateSetting('statistics', [
                            { label: '', value: '', icon: '' },
                          ])
                        }
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
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
                        Add Your First Statistic
                      </button>
                    </div>
                  ) : (
                    <div className="px-6">
                      <div className="max-w-4xl mx-auto space-y-5">
                        {settings.statistics.map((stat, index) => (
                          <div
                            key={index}
                            className="p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-5">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                  <span className="text-indigo-600 font-semibold text-sm">
                                    {index + 1}
                                  </span>
                                </div>
                                <h4 className="text-base font-semibold text-foreground">
                                  Statistic {index + 1}
                                </h4>
                              </div>
                              <button
                                onClick={() => {
                                  const newStats = settings.statistics.filter(
                                    (_, i) => i !== index,
                                  );
                                  updateSetting('statistics', newStats);
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Remove statistic"
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

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <div className="md:col-span-2">
                                <div className="grid grid-cols-2 gap-5">
                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Label
                                    </label>
                                    <input
                                      type="text"
                                      value={stat.label}
                                      onChange={(e) => {
                                        const newStats = [
                                          ...settings.statistics,
                                        ];
                                        newStats[index] = {
                                          ...newStats[index],
                                          label: e.target.value,
                                        };
                                        updateSetting('statistics', newStats);
                                      }}
                                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-background text-foreground"
                                      placeholder="e.g., Total Students"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">
                                      Value
                                    </label>
                                    <input
                                      type="text"
                                      value={stat.value}
                                      onChange={(e) => {
                                        const newStats = [
                                          ...settings.statistics,
                                        ];
                                        newStats[index] = {
                                          ...newStats[index],
                                          value: e.target.value,
                                        };
                                        updateSetting('statistics', newStats);
                                      }}
                                      className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-background text-foreground"
                                      placeholder="e.g., 5000+"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                  Icon (emoji)
                                </label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    value={stat.icon}
                                    onChange={(e) => {
                                      const newStats = [...settings.statistics];
                                      newStats[index] = {
                                        ...newStats[index],
                                        icon: e.target.value,
                                      };
                                      updateSetting('statistics', newStats);
                                    }}
                                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm pr-12 bg-background text-foreground"
                                    placeholder="e.g., 👥"
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <div className="relative group">
                                      <button
                                        type="button"
                                        className="text-muted-foreground hover:text-foreground p-1"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          const picker =
                                            e.currentTarget.nextElementSibling;
                                          if (picker) {
                                            picker.classList.toggle('hidden');
                                          }
                                        }}
                                      >
                                        😊
                                      </button>
                                      <div className="hidden absolute right-0 top-full mt-2 bg-card border border-border rounded-lg shadow-lg p-3 z-10 w-64">
                                        <div className="grid grid-cols-6 gap-2">
                                          {[
                                            '👥',
                                            '📚',
                                            '🏆',
                                            '🎓',
                                            '⭐',
                                            '📖',
                                            '✏️',
                                            '🎯',
                                            '💡',
                                            '🌟',
                                            '📊',
                                            '📈',
                                            '🏅',
                                            '🎖️',
                                            '🏛️',
                                            '🎨',
                                            '🔬',
                                            '🧪',
                                            '💻',
                                            '⚽',
                                            '🏀',
                                            '🎭',
                                            '🎵',
                                            '🌍',
                                          ].map((emoji) => (
                                            <button
                                              key={emoji}
                                              type="button"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                const newStats = [
                                                  ...settings.statistics,
                                                ];
                                                newStats[index] = {
                                                  ...newStats[index],
                                                  icon: emoji,
                                                };
                                                updateSetting(
                                                  'statistics',
                                                  newStats,
                                                );
                                                // Hide picker
                                                const picker =
                                                  e.currentTarget.parentElement;
                                                if (picker) {
                                                  picker.classList.add(
                                                    'hidden',
                                                  );
                                                }
                                              }}
                                              className="text-2xl hover:bg-accent rounded p-1 transition-colors"
                                            >
                                              {emoji}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-1.5 text-xs text-muted-foreground">
                                  Type or click 😊 to select
                                </p>
                              </div>
                            </div>

                            {/* Preview */}
                            {stat.label && stat.value && (
                              <div className="mt-6 pt-6 border-t border-border">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                  Preview
                                </p>
                                <div className="flex justify-center">
                                  <div className="inline-flex items-center space-x-4 bg-gradient-to-br from-indigo-50 to-blue-50 px-6 py-4 rounded-lg border border-indigo-100">
                                    {stat.icon && (
                                      <div className="text-3xl">
                                        {stat.icon}
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                      </div>
                                      <div className="text-sm text-gray-600 mt-1">
                                        {stat.label}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
