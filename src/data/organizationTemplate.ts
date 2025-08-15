import { OrganizationConfig } from '@/types/organization';

export const demoOrganizationData: OrganizationConfig = {
  name: 'Amity Global School Noida',
  type: 'school',
  tagline: 'Excellence in Education',
  description:
    'A premier educational institution committed to nurturing young minds and fostering holistic development.',
  founded: 2005,

  contact: {
    email: 'info@amityglobalnoida.com',
    phone: '+91-120-4392222',
    address: {
      street: 'J-3 Block, Sector 46',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      zipCode: '201301',
    },
  },

  branding: {
    logo: '/images/logo.png',
    favicon: '/favicon.ico',
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    accentColor: '#EF4444',
  },

  hero: {
    title: 'Welcome to Amity Global School Noida',
    subtitle: "Shaping Tomorrow's Leaders Through Excellence in Education",
    backgroundImage:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    ctaButtons: {
      primary: { text: 'Apply for Admissions', link: '/admissions' },
      secondary: { text: 'Virtual Tour', link: '/tour' },
    },
  },

  about: {
    title: 'About Our School',
    content:
      'Amity Global School Noida is a premier educational institution that has been at the forefront of quality education for over two decades. We are committed to providing a nurturing environment where students can excel academically while developing their character and leadership skills.',
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
      '/images/about-1.jpg',
      '/images/about-2.jpg',
      '/images/about-3.jpg',
    ],
  },

  programs: {
    title: 'Our Academic Programs',
    items: [
      {
        name: 'Primary Education (Grades K-5)',
        description:
          'Foundation years focusing on fundamental skills, creativity, and social development through play-based learning and structured academics.',
        image: '/images/primary.jpg',
        link: '/programs/primary',
        features: [
          'Play-based learning approach',
          'Individual attention and care',
          'Art, music, and physical education',
          'Character development programs',
        ],
      },
      {
        name: 'Middle School (Grades 6-8)',
        description:
          'Transitional years emphasizing critical thinking, subject specialization, and preparation for senior school challenges.',
        image: '/images/middle.jpg',
        link: '/programs/middle',
        features: [
          'Subject-specific teaching',
          'Project-based learning',
          'Leadership development',
          'Technology integration',
        ],
      },
      {
        name: 'Senior School (Grades 9-12)',
        description:
          'Advanced academic programs with multiple streams and comprehensive preparation for higher education and careers.',
        image: '/images/senior.jpg',
        link: '/programs/senior',
        features: [
          'Science, Commerce, and Humanities streams',
          'Advanced laboratory facilities',
          'Career counseling and guidance',
          'Preparation for competitive exams',
        ],
      },
    ],
  },

  stats: {
    title: 'Our Achievements',
    items: [
      { label: 'Students Enrolled', value: '2,500+', icon: '👥' },
      { label: 'Expert Faculty', value: '180+', icon: '👨‍🏫' },
      { label: 'Years of Excellence', value: '18+', icon: '🏆' },
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
        image: '/images/principal.jpg',
        bio: 'With over 25 years of experience in education, Dr. Singh leads our institution with vision and dedication.',
        qualifications: [
          'Ph.D. in Education Management',
          'M.Ed. from Delhi University',
          'Former Teacher Trainer, NCERT',
        ],
      },
      {
        name: 'Mr. Ankit Sharma',
        position: 'Vice Principal (Academics)',
        image: '/images/vice-principal.jpg',
        bio: 'A passionate educator focused on innovative teaching methodologies and academic excellence.',
        qualifications: [
          'M.Sc. Physics, IIT Delhi',
          'B.Ed. from Jamia Millia Islamia',
          '15+ years teaching experience',
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
          'Students showcase innovative projects at our biggest science exhibition of the year.',
        date: '2024-03-15',
        image: '/images/news-1.jpg',
        link: '/news/science-fair-2024',
      },
      {
        title: 'Inter-School Sports Championship',
        excerpt:
          'Our athletics team brings home multiple gold medals from the regional championship.',
        date: '2024-03-10',
        image: '/images/news-2.jpg',
        link: '/news/sports-championship',
      },
      {
        title: 'New STEM Laboratory Inauguration',
        excerpt:
          'State-of-the-art STEM facility opens to enhance hands-on learning experience.',
        date: '2024-03-05',
        image: '/images/news-3.jpg',
        link: '/news/stem-lab-inauguration',
      },
    ],
  },

  social: {
    facebook: 'https://facebook.com/amityglobalschoolnoida',
    twitter: 'https://twitter.com/amityglobalnoida',
    instagram: 'https://instagram.com/amityglobalschoolnoida',
    linkedin: 'https://linkedin.com/school/amity-global-school-noida',
    youtube: 'https://youtube.com/@amityglobalschoolnoida',
  },

  siteConfig: {
    domain: 'amityglobalschoolnoida.com',
    title: 'Amity Global School Noida - Excellence in Education',
    metaDescription:
      'Premier educational institution in Noida offering world-class education from kindergarten to grade 12 with focus on academic excellence and holistic development.',
    keywords: [
      'school in noida',
      'best school noida',
      'cbse school',
      'education',
      'admissions',
      'academic excellence',
    ],
    language: 'en',
    timezone: 'Asia/Kolkata',
    affiliatedCode: 'CBSE12345',
  },
};
