import { NextRequest, NextResponse } from 'next/server';

// Mock products/services data - in production this would come from your database
const mockProductsData = [
  {
    id: 1,
    name: 'Primary Education (Grades K-5)',
    price: 25000, // Annual fee in INR
    description:
      'Foundation years focusing on fundamental skills and character development.',
    image: '/images/sls-primary.jpg',
    category: 'academic',
    duration: '1 year',
    features: [
      'Play-based learning',
      'Moral value education',
      'Environmental awareness',
      'Cultural activities',
      'Individual attention',
      'Health and nutrition programs',
    ],
    ageGroup: '5-10 years',
    curriculum: 'CBSE',
    available: true,
    capacity: 120,
    enrolled: 95,
  },
  {
    id: 2,
    name: 'Secondary Education (Grades 6-10)',
    price: 30000, // Annual fee in INR
    description:
      'Comprehensive education preparing students for higher studies.',
    image: '/images/sls-secondary.jpg',
    category: 'academic',
    duration: '1 year',
    features: [
      'CBSE curriculum',
      'Science and computer labs',
      'Sports and games',
      'Life skills development',
      'Career guidance',
      'Peer learning programs',
    ],
    ageGroup: '11-15 years',
    curriculum: 'CBSE',
    available: true,
    capacity: 150,
    enrolled: 142,
  },
  {
    id: 3,
    name: 'Sports Academy',
    price: 15000, // Annual fee in INR
    description:
      'Specialized sports training and physical development programs.',
    image: '/images/sls-sports.jpg',
    category: 'extracurricular',
    duration: '1 year',
    features: [
      'Professional coaching',
      'Modern sports facilities',
      'Inter-school competitions',
      'Fitness training',
      'Team building activities',
      'Sports psychology sessions',
    ],
    ageGroup: '8-18 years',
    curriculum: 'Sports Education',
    available: true,
    capacity: 80,
    enrolled: 67,
  },
  {
    id: 4,
    name: 'Arts & Cultural Program',
    price: 12000, // Annual fee in INR
    description:
      'Creative arts, music, dance, and cultural activities program.',
    image: '/images/sls-arts.jpg',
    category: 'extracurricular',
    duration: '1 year',
    features: [
      'Music and dance classes',
      'Visual arts training',
      'Drama and theater',
      'Cultural festivals participation',
      'Creative writing workshops',
      'Public speaking development',
    ],
    ageGroup: '6-18 years',
    curriculum: 'Arts Education',
    available: true,
    capacity: 60,
    enrolled: 45,
  },
  {
    id: 5,
    name: 'Computer Science & Technology',
    price: 20000, // Annual fee in INR
    description:
      'Advanced computer education and technology skills development.',
    image: '/images/sls-computer.jpg',
    category: 'academic',
    duration: '1 year',
    features: [
      'Programming languages',
      'Web development',
      'Digital literacy',
      'Robotics basics',
      'Computer graphics',
      'Technology project work',
    ],
    ageGroup: '10-18 years',
    curriculum: 'Technology Education',
    available: true,
    capacity: 40,
    enrolled: 38,
  },
  {
    id: 6,
    name: 'Summer Camp Program',
    price: 8000, // Program fee in INR
    description:
      'Fun-filled summer activities combining learning with recreation.',
    image: '/images/sls-summer-camp.jpg',
    category: 'seasonal',
    duration: '6 weeks',
    features: [
      'Outdoor adventures',
      'Skill development workshops',
      'Team building games',
      'Nature exploration',
      'Creative projects',
      'Leadership activities',
    ],
    ageGroup: '6-16 years',
    curriculum: 'Experiential Learning',
    available: false, // Seasonal availability
    capacity: 100,
    enrolled: 0,
  },
];

export async function GET(request: NextRequest) {
  try {
    // In a real application, you would:
    // 1. Query your database for products/services
    // 2. Apply filters based on query parameters
    // 3. Handle pagination and sorting
    // 4. Return products specific to the organization/subdomain

    // Extract query parameters for filtering (optional)
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const available = url.searchParams.get('available');

    let filteredProducts = mockProductsData;

    // Apply category filter if provided
    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category,
      );
    }

    // Apply availability filter if provided
    if (available !== null) {
      const isAvailable = available === 'true';
      filteredProducts = filteredProducts.filter(
        (product) => product.available === isAvailable,
      );
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    console.log('API: Products data requested', {
      category,
      available,
      resultCount: filteredProducts.length,
    });

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products data' },
      { status: 500 },
    );
  }
}
