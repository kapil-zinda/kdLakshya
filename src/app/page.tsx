'use client';

import { useEffect, useState } from 'react';

import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';
import { demoOrganizationData } from '@/data/organizationTemplate';
import { OrganizationConfig } from '@/types/organization';

interface SchoolSettings {
  name: string;
  buildingNumber: string;
  town: string;
  district: string;
  pincode: string;
  phone: string;
  email: string;
  affiliatedCode: string;
  establishedYear: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logo: string;
  aboutTitle: string;
  aboutContent: string;
  mission: string;
  vision: string;
  values: string[];
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  experienceYears: number;
  facebookUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
}

export default function Home() {
  const [organizationData, setOrganizationData] =
    useState<OrganizationConfig>(demoOrganizationData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('schoolSettings');
    if (savedSettings) {
      try {
        const settings: SchoolSettings = JSON.parse(savedSettings);

        // Create updated organization data with dynamic settings
        const updatedData: OrganizationConfig = {
          ...demoOrganizationData,
          name: settings.name,
          founded:
            parseInt(settings.establishedYear) || demoOrganizationData.founded,

          contact: {
            ...demoOrganizationData.contact,
            email: settings.email,
            phone: settings.phone,
            address: {
              ...demoOrganizationData.contact.address,
              street:
                settings.buildingNumber ||
                demoOrganizationData.contact.address.street,
              city: settings.town || demoOrganizationData.contact.address.city,
              state:
                settings.district || demoOrganizationData.contact.address.state,
              zipCode:
                settings.pincode ||
                demoOrganizationData.contact.address.zipCode,
            },
          },

          branding: {
            ...demoOrganizationData.branding,
            logo: settings.logo || demoOrganizationData.branding.logo,
            primaryColor: settings.primaryColor,
            secondaryColor: settings.secondaryColor,
            accentColor: settings.accentColor,
          },

          hero: {
            ...demoOrganizationData.hero,
            title: settings.heroTitle,
            subtitle: settings.heroSubtitle,
            backgroundImage:
              settings.heroImage || demoOrganizationData.hero.backgroundImage,
          },

          about: {
            ...demoOrganizationData.about,
            title: settings.aboutTitle,
            content: settings.aboutContent,
            mission: settings.mission,
            vision: settings.vision,
            values: settings.values.filter((value) => value.trim() !== ''),
          },

          stats: {
            ...demoOrganizationData.stats,
            items: [
              {
                label: 'Students Enrolled',
                value: `${settings.totalStudents.toLocaleString()}+`,
                icon: '👥',
              },
              {
                label: 'Expert Faculty',
                value: `${settings.totalTeachers}+`,
                icon: '👨‍🏫',
              },
              {
                label: 'Years of Excellence',
                value: `${settings.experienceYears}+`,
                icon: '🏆',
              },
              {
                label: 'Total Staff',
                value: `${settings.totalStaff}+`,
                icon: '👨‍💼',
              },
              { label: 'Academic Awards', value: '150+', icon: '🥇' },
              { label: 'Sports Championships', value: '75+', icon: '🏅' },
            ],
          },

          social: {
            facebook:
              settings.facebookUrl || demoOrganizationData.social.facebook,
            twitter: settings.twitterUrl || demoOrganizationData.social.twitter,
            instagram:
              settings.instagramUrl || demoOrganizationData.social.instagram,
            linkedin: demoOrganizationData.social.linkedin,
            youtube: settings.youtubeUrl || demoOrganizationData.social.youtube,
          },

          siteConfig: {
            ...demoOrganizationData.siteConfig,
            domain: demoOrganizationData.siteConfig.domain,
            title: `${settings.name} - Excellence in Education`,
            metaDescription: `${settings.aboutContent}`,
            affiliatedCode: settings.affiliatedCode,
          },
        };

        setOrganizationData(updatedData);
      } catch (error) {
        console.error('Error parsing school settings:', error);
        // Fall back to demo data if settings are invalid
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <OrganizationTemplate data={organizationData} />;
}
