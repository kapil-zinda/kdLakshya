import { OrganizationConfig } from '@/types/organization';

interface OrganizationInput {
  name: string;
  type: OrganizationConfig['type'];
  tagline?: string;
  description?: string;
  founded?: number;
  contact: {
    email: string;
    phone: string;
    address: OrganizationConfig['contact']['address'];
  };
  branding?: Partial<OrganizationConfig['branding']>;
  domain: string;
}

export function generateOrganizationConfig(
  input: OrganizationInput,
): OrganizationConfig {
  const defaultBranding = {
    logo: '/images/logo.png',
    favicon: '/favicon.ico',
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    accentColor: '#EF4444',
  };

  const organizationTypes = {
    school: {
      tagline: 'Excellence in Education',
      description:
        'A premier educational institution committed to nurturing young minds and fostering holistic development.',
      programs: {
        title: 'Our Academic Programs',
        items: [
          {
            name: 'Primary Education (Grades K-5)',
            description:
              'Foundation years focusing on fundamental skills, creativity, and social development.',
            image: '/images/primary.jpg',
            link: '/programs/primary',
            features: [
              'Play-based learning',
              'Individual attention',
              'Creative arts',
              'Character development',
            ],
          },
          {
            name: 'Middle School (Grades 6-8)',
            description:
              'Transitional years emphasizing critical thinking and subject specialization.',
            image: '/images/middle.jpg',
            link: '/programs/middle',
            features: [
              'Subject specialization',
              'Project-based learning',
              'Leadership development',
              'Technology integration',
            ],
          },
          {
            name: 'Senior School (Grades 9-12)',
            description:
              'Advanced academic programs with comprehensive preparation for higher education.',
            image: '/images/senior.jpg',
            link: '/programs/senior',
            features: [
              'Multiple streams',
              'Advanced facilities',
              'Career counseling',
              'Competitive exam prep',
            ],
          },
        ],
      },
      stats: [
        { label: 'Students Enrolled', value: '1,500+', icon: '👥' },
        { label: 'Expert Faculty', value: '120+', icon: '👨‍🏫' },
        { label: 'Years of Excellence', value: '15+', icon: '🏆' },
        { label: 'Alumni Network', value: '3,000+', icon: '🎓' },
      ],
    },
    college: {
      tagline: 'Shaping Future Leaders',
      description:
        'A distinguished institution of higher learning dedicated to academic excellence and professional development.',
      programs: {
        title: 'Our Degree Programs',
        items: [
          {
            name: 'Undergraduate Programs',
            description:
              'Comprehensive bachelor degree programs across various disciplines.',
            image: '/images/undergraduate.jpg',
            link: '/programs/undergraduate',
            features: [
              'Multiple disciplines',
              'Industry partnerships',
              'Research opportunities',
              'Practical training',
            ],
          },
          {
            name: 'Postgraduate Programs',
            description:
              'Advanced master degree programs for specialized knowledge and skills.',
            image: '/images/postgraduate.jpg',
            link: '/programs/postgraduate',
            features: [
              'Specialized curriculum',
              'Expert faculty',
              'Research projects',
              'Industry connections',
            ],
          },
          {
            name: 'Professional Courses',
            description:
              'Industry-focused courses designed for immediate employability.',
            image: '/images/professional.jpg',
            link: '/programs/professional',
            features: [
              'Industry relevant',
              'Hands-on training',
              'Placement support',
              'Certification programs',
            ],
          },
        ],
      },
      stats: [
        { label: 'Students Enrolled', value: '5,000+', icon: '👥' },
        { label: 'Faculty Members', value: '300+', icon: '👨‍🏫' },
        { label: 'Years of Excellence', value: '25+', icon: '🏆' },
        { label: 'Placement Rate', value: '90%+', icon: '💼' },
      ],
    },
    institute: {
      tagline: 'Innovation Through Education',
      description:
        'A specialized institution focused on cutting-edge research and professional training.',
      programs: {
        title: 'Our Training Programs',
        items: [
          {
            name: 'Professional Training',
            description:
              'Industry-specific training programs for skill development.',
            image: '/images/training.jpg',
            link: '/programs/training',
            features: [
              'Industry experts',
              'Practical approach',
              'Certification',
              'Job placement',
            ],
          },
          {
            name: 'Research Programs',
            description:
              'Advanced research programs for innovation and development.',
            image: '/images/research.jpg',
            link: '/programs/research',
            features: [
              'Research facilities',
              'Expert guidance',
              'Publications',
              'Collaborations',
            ],
          },
        ],
      },
      stats: [
        { label: 'Trainees Enrolled', value: '2,000+', icon: '👥' },
        { label: 'Expert Trainers', value: '80+', icon: '👨‍🏫' },
        { label: 'Success Rate', value: '95%+', icon: '🏆' },
        { label: 'Industry Partners', value: '50+', icon: '🤝' },
      ],
    },
    university: {
      tagline: 'Excellence in Higher Education',
      description:
        'A distinguished university dedicated to advanced learning, research, and intellectual growth.',
      programs: {
        title: 'Our Academic Programs',
        items: [
          {
            name: 'Undergraduate Programs',
            description:
              'Comprehensive degree programs for bachelor-level education.',
            image: '/images/undergraduate.jpg',
            link: '/programs/undergraduate',
            features: [
              'Liberal arts education',
              'Research opportunities',
              'Faculty mentorship',
              'Campus life',
            ],
          },
          {
            name: 'Graduate Programs',
            description:
              'Advanced degree programs for specialized knowledge and research.',
            image: '/images/graduate.jpg',
            link: '/programs/graduate',
            features: [
              'Research focus',
              'Expert supervision',
              'Thesis projects',
              'Academic excellence',
            ],
          },
          {
            name: 'Doctoral Programs',
            description:
              'PhD programs for cutting-edge research and scholarly pursuits.',
            image: '/images/doctoral.jpg',
            link: '/programs/doctoral',
            features: [
              'Original research',
              'Publication opportunities',
              'Conference presentations',
              'Academic careers',
            ],
          },
        ],
      },
      stats: [
        { label: 'Students', value: '15,000+', icon: '👥' },
        { label: 'Faculty', value: '800+', icon: '👨‍🏫' },
        { label: 'Research Centers', value: '50+', icon: '🔬' },
        { label: 'Alumni Network', value: '100,000+', icon: '🎓' },
      ],
    },
    organization: {
      tagline: 'Excellence in Service',
      description:
        'A premier organization committed to delivering exceptional services and making a positive impact.',
      programs: {
        title: 'Our Services',
        items: [
          {
            name: 'Consulting Services',
            description:
              'Expert consulting solutions tailored to your specific needs.',
            image: '/images/consulting.jpg',
            link: '/services/consulting',
            features: [
              'Expert guidance',
              'Custom solutions',
              'Strategic planning',
              'Result-oriented',
            ],
          },
          {
            name: 'Training Programs',
            description:
              'Professional development and skill enhancement programs.',
            image: '/images/training.jpg',
            link: '/services/training',
            features: [
              'Skill development',
              'Professional growth',
              'Certification',
              'Industry standards',
            ],
          },
        ],
      },
      stats: [
        { label: 'Clients Served', value: '1,000+', icon: '👥' },
        { label: 'Team Members', value: '200+', icon: '👨‍💼' },
        { label: 'Success Rate', value: '98%+', icon: '🏆' },
        { label: 'Years in Business', value: '15+', icon: '🏢' },
      ],
    },
  };

  const typeDefaults =
    organizationTypes[input.type] || organizationTypes.school;

  return {
    name: input.name,
    type: input.type,
    tagline: input.tagline || typeDefaults.tagline,
    description: input.description || typeDefaults.description,
    founded: input.founded || new Date().getFullYear() - 10,

    contact: input.contact,

    branding: {
      ...defaultBranding,
      ...input.branding,
    },

    hero: {
      title: `Welcome to ${input.name}`,
      subtitle: input.tagline || typeDefaults.tagline,
      backgroundImage: '/images/hero-bg.jpg',
      ctaButtons: {
        primary: { text: 'Learn More', link: '/about' },
        secondary: { text: 'Contact Us', link: '/contact' },
      },
    },

    about: {
      title: `About ${input.name}`,
      content: input.description || typeDefaults.description,
      mission: `To provide world-class education and training that empowers individuals to achieve their full potential.`,
      vision: `To be recognized as a leading institution that inspires excellence and innovation.`,
      values: [
        'Excellence in education and training',
        'Innovation in teaching methodologies',
        'Respect for diversity and inclusivity',
        'Community service and social responsibility',
        'Commitment to continuous improvement',
      ],
      images: [
        '/images/about-1.jpg',
        '/images/about-2.jpg',
        '/images/about-3.jpg',
      ],
    },

    programs: typeDefaults.programs,

    stats: {
      title: 'Our Achievements',
      items: typeDefaults.stats,
    },

    news: {
      title: 'Latest News & Events',
      items: [
        {
          title: 'New Academic Year Begins',
          excerpt:
            'We welcome students to another year of excellence and innovation.',
          date: new Date().toISOString().split('T')[0],
          image: '/images/news-1.jpg',
          link: '/news/new-academic-year',
        },
        {
          title: 'Excellence Awards Ceremony',
          excerpt:
            'Celebrating outstanding achievements of our students and faculty.',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          image: '/images/news-2.jpg',
          link: '/news/excellence-awards',
        },
      ],
    },

    social: {
      facebook: `https://facebook.com/${input.domain.replace(/\./g, '')}`,
      twitter: `https://twitter.com/${input.domain.replace(/\./g, '')}`,
      instagram: `https://instagram.com/${input.domain.replace(/\./g, '')}`,
      linkedin: `https://linkedin.com/company/${input.domain.replace(/\./g, '-')}`,
      youtube: `https://youtube.com/@${input.domain.replace(/\./g, '')}`,
    },

    siteConfig: {
      domain: input.domain,
      title: `${input.name} - ${input.tagline || typeDefaults.tagline}`,
      metaDescription: input.description || typeDefaults.description,
      keywords: [
        input.type,
        'education',
        'training',
        'excellence',
        input.name.toLowerCase().replace(/\s+/g, '-'),
      ],
      language: 'en',
      timezone: 'UTC',
    },
  };
}

// Quick setup function for common scenarios
export function quickSetup(
  name: string,
  type: OrganizationConfig['type'],
  email: string,
  phone: string,
  city: string,
  domain: string,
): OrganizationConfig {
  return generateOrganizationConfig({
    name,
    type,
    domain,
    contact: {
      email,
      phone,
      address: {
        street: '123 Main Street',
        city,
        state: 'State',
        country: 'Country',
        zipCode: '12345',
      },
    },
  });
}
