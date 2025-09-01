import { OrganizationConfig } from '@/types/organization';

interface CollegeConfig {
  subdomain: string;
  data: OrganizationConfig;
}

export const collegeConfigs: CollegeConfig[] = [
  {
    subdomain: 'sls',
    data: {
      name: 'Sri Lahari Public School',
      type: 'school',
      tagline: 'Excellence in Education',
      description:
        'A premier educational institution committed to nurturing young minds and fostering holistic development.',
      founded: 2010,

      contact: {
        email: 'info@srilahariuchhal.in',
        phone: '+91-5946-234567',
        address: {
          street: 'Saadham, Uchhal',
          city: 'Uchhal',
          state: 'Uttarakhand',
          country: 'India',
          zipCode: '263657',
        },
      },

      branding: {
        logo: '/images/sls-logo.png',
        favicon: '/favicon.ico',
        primaryColor: '#059669',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
      },

      hero: {
        title: 'Welcome to Sri Lahari Public School',
        subtitle: 'Nurturing Excellence in the Heart of Uchhal',
        backgroundImage:
          'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        ctaButtons: {
          primary: { text: 'Apply for Admissions', link: '/admissions' },
          secondary: { text: 'Virtual Tour', link: '/tour' },
        },
      },

      about: {
        title: 'About Sri Lahari Public School',
        content:
          'Sri Lahari Public School is a distinguished educational institution located in the serene environment of Saadham, Uchhal. We are committed to providing quality education that combines traditional values with modern teaching methodologies.',
        mission:
          'To provide holistic education that develops intellectual, emotional, and social capabilities of every student.',
        vision:
          'To be a center of excellence in education, creating responsible global citizens with strong moral values.',
        values: [
          'Academic excellence with moral values',
          'Respect for nature and environment',
          'Cultural heritage and traditions',
          'Innovation in learning methods',
          'Community service and social responsibility',
        ],
        images: [
          '/images/sls-about-1.jpg',
          '/images/sls-about-2.jpg',
          '/images/sls-about-3.jpg',
        ],
      },

      programs: {
        title: 'Our Academic Programs',
        items: [
          {
            name: 'Primary Education (Grades K-5)',
            description:
              'Foundation years focusing on fundamental skills and character development.',
            image: '/images/sls-primary.jpg',
            link: '/programs/primary',
            features: [
              'Play-based learning',
              'Moral value education',
              'Environmental awareness',
              'Cultural activities',
            ],
          },
          {
            name: 'Secondary Education (Grades 6-10)',
            description:
              'Comprehensive education preparing students for higher studies.',
            image: '/images/sls-secondary.jpg',
            link: '/programs/secondary',
            features: [
              'CBSE curriculum',
              'Science and computer labs',
              'Sports and games',
              'Life skills development',
            ],
          },
        ],
      },

      stats: {
        title: 'Our Achievements',
        items: [
          { label: 'Students Enrolled', value: '850+', icon: '👥' },
          { label: 'Dedicated Teachers', value: '45+', icon: '👨‍🏫' },
          { label: 'Years of Service', value: '14+', icon: '🏆' },
          { label: 'Alumni Success', value: '1,200+', icon: '🎓' },
          { label: 'Academic Awards', value: '65+', icon: '🥇' },
          { label: 'Sports Achievements', value: '35+', icon: '🏅' },
        ],
      },

      faculty: {
        title: 'Meet Our Leadership',
        featured: [
          {
            name: 'Mrs. Sunita Sharma',
            position: 'Principal',
            image: '/images/sls-principal.jpg',
            bio: 'A dedicated educator with 20+ years of experience in school administration and academic leadership.',
            qualifications: [
              'M.Ed. from Kumaon University',
              'B.Ed. from HNB Garhwal University',
              'Certified School Leadership Program',
            ],
          },
        ],
      },

      news: {
        title: 'Latest News & Events',
        items: [
          {
            title: 'Annual Cultural Festival 2024',
            excerpt:
              'Students showcase their talents in our grand cultural celebration.',
            date: '2024-02-20',
            image: '/images/sls-news-1.jpg',
            link: '/news/cultural-festival-2024',
          },
          {
            title: 'Environment Day Celebration',
            excerpt:
              'Tree plantation drive and awareness programs organized by students.',
            date: '2024-02-15',
            image: '/images/sls-news-2.jpg',
            link: '/news/environment-day',
          },
        ],
      },

      social: {
        facebook: 'https://facebook.com/srilahariuchhal',
        twitter: 'https://twitter.com/srilahariuchhal',
        instagram: 'https://instagram.com/srilahariuchhal',
        linkedin: 'https://linkedin.com/school/sri-lahari-public-school',
        youtube: 'https://youtube.com/@srilahariuchhal',
      },

      siteConfig: {
        domain: 'sls.uchhal.in',
        title: 'Sri Lahari Public School - Quality Education in Uchhal',
        metaDescription:
          'Premier educational institution in Uchhal, Uttarakhand offering quality education with strong moral values and environmental consciousness.',
        keywords: [
          'school in uchhal',
          'uttarakhand school',
          'cbse school uchhal',
          'quality education',
          'sri lahari school',
        ],
        language: 'en',
        timezone: 'Asia/Kolkata',
        affiliatedCode: 'CBSE67890',
      },
    },
  },
  {
    subdomain: 'amity',
    data: {
      name: 'Amity Global School',
      type: 'school',
      tagline: 'Excellence in Education',
      description:
        'A premier educational institution committed to nurturing young minds and fostering holistic development.',
      founded: 2005,

      contact: {
        email: 'info@amityglobal.uchhal.in',
        phone: '+91-120-4392222',
        address: {
          street: 'Educational Complex, Uchhal',
          city: 'Uchhal',
          state: 'Uttarakhand',
          country: 'India',
          zipCode: '263657',
        },
      },

      branding: {
        logo: '/images/amity-logo.png',
        favicon: '/favicon.ico',
        primaryColor: '#1E40AF',
        secondaryColor: '#3B82F6',
        accentColor: '#EF4444',
      },

      hero: {
        title: 'Welcome to Amity Global School',
        subtitle: "Shaping Tomorrow's Leaders Through Excellence in Education",
        backgroundImage:
          'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
        ctaButtons: {
          primary: { text: 'Apply for Admissions', link: '/admissions' },
          secondary: { text: 'Virtual Tour', link: '/tour' },
        },
      },

      about: {
        title: 'About Amity Global School',
        content:
          'Amity Global School is a premier educational institution that has been at the forefront of quality education. We are committed to providing a nurturing environment where students can excel academically while developing their character and leadership skills.',
        mission:
          'To provide world-class education that empowers students to become confident, creative, and compassionate global citizens.',
        vision:
          'To be recognized as a leading educational institution that inspires excellence and innovation in learning.',
        values: [
          'Excellence in academics and character building',
          'Innovation in teaching methodologies',
          'Respect for diversity and inclusivity',
          'Environmental consciousness and sustainability',
          'Community service and social responsibility',
        ],
        images: [
          '/images/amity-about-1.jpg',
          '/images/amity-about-2.jpg',
          '/images/amity-about-3.jpg',
        ],
      },

      programs: {
        title: 'Our Academic Programs',
        items: [
          {
            name: 'Primary Education (Grades K-5)',
            description:
              'Foundation years focusing on fundamental skills, creativity, and social development.',
            image: '/images/amity-primary.jpg',
            link: '/programs/primary',
            features: [
              'Play-based learning approach',
              'Individual attention and care',
              'Art, music, and physical education',
              'Character development programs',
            ],
          },
          {
            name: 'Secondary Education (Grades 6-10)',
            description:
              'Comprehensive curriculum with focus on critical thinking and skill development.',
            image: '/images/amity-secondary.jpg',
            link: '/programs/secondary',
            features: [
              'CBSE curriculum',
              'Advanced laboratories',
              'Technology integration',
              'Leadership programs',
            ],
          },
          {
            name: 'Senior Secondary (Grades 11-12)',
            description:
              'Specialized streams preparing students for higher education and careers.',
            image: '/images/amity-senior.jpg',
            link: '/programs/senior',
            features: [
              'Science, Commerce, and Humanities',
              'Career counseling',
              'Competitive exam preparation',
              'Industry partnerships',
            ],
          },
        ],
      },

      stats: {
        title: 'Our Achievements',
        items: [
          { label: 'Students Enrolled', value: '2,500+', icon: '👥' },
          { label: 'Expert Faculty', value: '180+', icon: '👨‍🏫' },
          { label: 'Years of Excellence', value: '19+', icon: '🏆' },
          { label: 'Alumni Network', value: '5,000+', icon: '🎓' },
          { label: 'Academic Awards', value: '150+', icon: '🥇' },
          { label: 'Sports Championships', value: '75+', icon: '🏅' },
        ],
      },

      faculty: {
        title: 'Meet Our Leadership',
        featured: [
          {
            name: 'Dr. Rashmi Singh',
            position: 'Principal',
            image: '/images/amity-principal.jpg',
            bio: 'With over 25 years of experience in education, Dr. Singh leads our institution with vision and dedication.',
            qualifications: [
              'Ph.D. in Education Management',
              'M.Ed. from Delhi University',
              'Former Teacher Trainer, NCERT',
            ],
          },
        ],
      },

      news: {
        title: 'Latest News & Events',
        items: [
          {
            title: 'Annual Science Fair 2024',
            excerpt:
              'Students showcase innovative projects at our biggest science exhibition.',
            date: '2024-03-15',
            image: '/images/amity-news-1.jpg',
            link: '/news/science-fair-2024',
          },
          {
            title: 'Inter-School Debate Competition',
            excerpt: 'Our debate team wins the regional championship.',
            date: '2024-03-10',
            image: '/images/amity-news-2.jpg',
            link: '/news/debate-competition',
          },
        ],
      },

      social: {
        facebook: 'https://facebook.com/amityglobaluchhal',
        twitter: 'https://twitter.com/amityglobaluchhal',
        instagram: 'https://instagram.com/amityglobaluchhal',
        linkedin: 'https://linkedin.com/school/amity-global-school-uchhal',
        youtube: 'https://youtube.com/@amityglobaluchhal',
      },

      siteConfig: {
        domain: 'amity.uchhal.in',
        title: 'Amity Global School Uchhal - Excellence in Education',
        metaDescription:
          'Premier Amity institution in Uchhal offering world-class education with focus on academic excellence and global perspectives.',
        keywords: [
          'amity school uchhal',
          'best school uttarakhand',
          'cbse school',
          'education',
          'admissions',
          'academic excellence',
        ],
        language: 'en',
        timezone: 'Asia/Kolkata',
        affiliatedCode: 'CBSE54321',
      },
    },
  },
];

export function getConfigBySubdomain(
  subdomain: string,
): OrganizationConfig | null {
  const config = collegeConfigs.find((c) => c.subdomain === subdomain);
  return config ? config.data : null;
}
