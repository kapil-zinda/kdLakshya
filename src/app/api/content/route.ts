import { NextRequest, NextResponse } from 'next/server';

// Mock content data - in production this would come from your CMS/database
const mockContentData = {
  title: 'Sri Lahari Public School',
  banner:
    'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  sections: [
    {
      id: 'tagline',
      type: 'tagline',
      title: 'School Tagline',
      content: 'Excellence in Education, Character in Life',
      data: {},
    },
    {
      id: 'description',
      type: 'description',
      title: 'School Description',
      content:
        'A premier educational institution committed to nurturing young minds and fostering holistic development in the heart of Uchhal.',
      data: {},
    },
    {
      id: 'hero',
      type: 'hero',
      title: 'Welcome to Sri Lahari Public School',
      content: 'Nurturing Excellence in the Heart of Uchhal',
      image:
        'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
      data: {
        buttons: [
          {
            text: 'Apply for Admissions',
            link: '/admissions',
            type: 'primary',
          },
          { text: 'Virtual Tour', link: '/tour', type: 'secondary' },
        ],
      },
    },
    {
      id: 'about',
      type: 'about',
      title: 'About Sri Lahari Public School',
      content:
        'Sri Lahari Public School is a distinguished educational institution located in the serene environment of Saadham, Uchhal. We are committed to providing quality education that combines traditional values with modern teaching methodologies.',
      image: '/images/sls-about-1.jpg',
      data: {},
    },
    {
      id: 'mission',
      type: 'mission',
      title: 'Our Mission',
      content:
        'To provide holistic education that develops intellectual, emotional, and social capabilities of every student.',
      data: {},
    },
    {
      id: 'vision',
      type: 'vision',
      title: 'Our Vision',
      content:
        'To be a center of excellence in education, creating responsible global citizens with strong moral values.',
      data: {},
    },
    {
      id: 'values',
      type: 'values',
      title: 'Our Values',
      content: 'Core values that guide our institution',
      data: {
        values: [
          'Academic excellence with moral values',
          'Respect for nature and environment',
          'Cultural heritage and traditions',
          'Innovation in learning methods',
          'Community service and social responsibility',
        ],
      },
    },
    {
      id: 'contact',
      type: 'contact',
      title: 'Contact Information',
      content: 'Get in touch with us',
      data: {
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
    },
    {
      id: 'branding',
      type: 'branding',
      title: 'Brand Assets',
      content: 'School branding information',
      data: {
        logo: '/images/sls-logo.png',
        colors: {
          primary: '#059669',
          secondary: '#10B981',
          accent: '#F59E0B',
        },
      },
    },
    {
      id: 'social',
      type: 'social',
      title: 'Social Media',
      content: 'Follow us on social media',
      data: {
        facebook: 'https://facebook.com/srilahariuchhal',
        twitter: 'https://twitter.com/srilahariuchhal',
        instagram: 'https://instagram.com/srilahariuchhal',
        linkedin: 'https://linkedin.com/school/sri-lahari-public-school',
        youtube: 'https://youtube.com/@srilahariuchhal',
      },
    },
    {
      id: 'news_1',
      type: 'news',
      title: 'Annual Cultural Festival 2024',
      content:
        'Students showcase their talents in our grand cultural celebration.',
      image: '/images/sls-news-1.jpg',
      data: {
        date: '2024-02-20',
        category: 'events',
        author: 'Admin',
      },
    },
    {
      id: 'news_2',
      type: 'news',
      title: 'Environment Day Celebration',
      content:
        'Tree plantation drive and awareness programs organized by students.',
      image: '/images/sls-news-2.jpg',
      data: {
        date: '2024-02-15',
        category: 'environment',
        author: 'Admin',
      },
    },
    {
      id: 'affiliation',
      type: 'affiliation',
      title: 'School Affiliation',
      content: 'CBSE affiliated school',
      data: {
        code: 'CBSE67890',
        board: 'CBSE',
        established: '2010',
      },
    },
  ],
  lastUpdated: new Date().toISOString(),
  version: '1.2.0',
};

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Query your CMS or database for content
    // 2. Handle localization based on user preferences
    // 3. Return dynamic content based on subdomain/tenant

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    console.log('API: Content data requested');

    return NextResponse.json(mockContentData);
  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content data' },
      { status: 500 },
    );
  }
}
