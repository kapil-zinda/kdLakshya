import { NextRequest, NextResponse } from 'next/server';

// Mock user info data - in production this would come from your database/analytics
const getUserInfoBySubdomain = (subdomain: string) => {
  const userInfoData: { [key: string]: any } = {
    sls: {
      users: 1250,
      active: true,
      statistics: {
        totalStudents: 850,
        totalTeachers: 45,
        totalStaff: 25,
        totalParents: 1200,
        activeThisMonth: 1180,
        newEnrollmentsThisYear: 120,
      },
      performance: {
        academicRating: 4.7,
        satisfactionScore: 92,
        attendanceRate: 94.5,
        passRate: 98.2,
      },
      facilities: {
        classrooms: 24,
        laboratories: 6,
        library: true,
        playground: true,
        computerLab: true,
        scienceLab: true,
        artRoom: true,
        musicRoom: true,
      },
      achievements: {
        academicAwards: 65,
        sportsChampionships: 35,
        culturalEvents: 120,
        communityProjects: 45,
      },
      location: {
        city: 'Uchhal',
        state: 'Uttarakhand',
        coordinates: {
          latitude: 29.3803,
          longitude: 79.4636,
        },
      },
      establishedYear: 2010,
      affiliations: ['CBSE', 'State Education Board'],
      lastUpdated: new Date().toISOString(),
    },
    amity: {
      users: 5200,
      active: true,
      statistics: {
        totalStudents: 2500,
        totalTeachers: 180,
        totalStaff: 120,
        totalParents: 4800,
        activeThisMonth: 4950,
        newEnrollmentsThisYear: 450,
      },
      performance: {
        academicRating: 4.9,
        satisfactionScore: 96,
        attendanceRate: 96.8,
        passRate: 99.1,
      },
      facilities: {
        classrooms: 85,
        laboratories: 20,
        library: true,
        playground: true,
        computerLab: true,
        scienceLab: true,
        artRoom: true,
        musicRoom: true,
        swimmingPool: true,
        auditorium: true,
      },
      achievements: {
        academicAwards: 150,
        sportsChampionships: 75,
        culturalEvents: 200,
        communityProjects: 80,
      },
      location: {
        city: 'Uchhal',
        state: 'Uttarakhand',
        coordinates: {
          latitude: 29.385,
          longitude: 79.465,
        },
      },
      establishedYear: 2005,
      affiliations: ['CBSE', 'NCERT', 'Cambridge International'],
      lastUpdated: new Date().toISOString(),
    },
  };

  // Return specific subdomain data or default data
  return (
    userInfoData[subdomain] || {
      users: 500,
      active: true,
      statistics: {
        totalStudents: 300,
        totalTeachers: 20,
        totalStaff: 15,
        totalParents: 450,
        activeThisMonth: 480,
        newEnrollmentsThisYear: 50,
      },
      performance: {
        academicRating: 4.5,
        satisfactionScore: 88,
        attendanceRate: 92.0,
        passRate: 96.5,
      },
      facilities: {
        classrooms: 12,
        laboratories: 3,
        library: true,
        playground: true,
        computerLab: true,
        scienceLab: true,
      },
      achievements: {
        academicAwards: 25,
        sportsChampionships: 15,
        culturalEvents: 50,
        communityProjects: 20,
      },
      location: {
        city: 'Unknown',
        state: 'Unknown',
      },
      establishedYear: 2015,
      affiliations: ['State Board'],
      lastUpdated: new Date().toISOString(),
    }
  );
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subdomain } = body;

    // Validate required subdomain parameter
    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain is required' },
        { status: 400 },
      );
    }

    // In a real application, you would:
    // 1. Validate the subdomain exists in your system
    // 2. Query your database/analytics service for user info
    // 3. Aggregate data from multiple sources
    // 4. Apply any necessary data transformations

    // Get user info data for the specified subdomain
    const userInfo = getUserInfoBySubdomain(subdomain);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    console.log('API: User info requested for subdomain:', subdomain);

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('User Info API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 },
    );
  }
}

// Also support GET requests for testing purposes
export async function GET(request: NextRequest) {
  try {
    // Default to 'sls' subdomain for GET requests
    const url = new URL(request.url);
    const subdomain = url.searchParams.get('subdomain') || 'sls';

    const userInfo = getUserInfoBySubdomain(subdomain);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    console.log('API: User info requested via GET for subdomain:', subdomain);

    return NextResponse.json(userInfo);
  } catch (error) {
    console.error('User Info API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user information' },
      { status: 500 },
    );
  }
}
