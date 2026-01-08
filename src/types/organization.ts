export interface OrganizationConfig {
  // Basic Information
  name: string;
  type: 'school' | 'college' | 'university' | 'institute' | 'organization';
  tagline: string;
  description: string;
  founded: number;

  // Contact Information
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
  };

  // Visual Branding
  branding: {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily?: string;
  };

  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaButtons: {
      primary: { text: string; link: string };
      secondary?: { text: string; link: string };
    };
  };

  // About Section
  about: {
    title: string;
    content: string;
    mission: string;
    vision: string;
    values: string[];
    images: string[];
  };

  // Programs/Services
  programs: {
    title: string;
    items: {
      name: string;
      description: string;
      image: string;
      link: string;
      features: string[];
    }[];
  };

  // Statistics/Achievements
  stats: {
    title: string;
    items: {
      label: string;
      value: string;
      icon?: string;
    }[];
  };

  // Faculty/Staff (optional)
  faculty?: {
    title: string;
    featured: {
      name: string;
      position: string;
      image: string;
      bio: string;
      qualifications: string[];
    }[];
  };

  // News/Updates
  news: {
    title: string;
    items: {
      title: string;
      excerpt: string;
      date: string;
      image: string;
      link: string;
    }[];
  };

  // Social Links
  social: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };

  // Site Configuration
  siteConfig: {
    domain: string;
    title: string;
    metaDescription: string;
    keywords: string[];
    language: string;
    timezone: string;
    affiliatedCode?: string;
  };
}
