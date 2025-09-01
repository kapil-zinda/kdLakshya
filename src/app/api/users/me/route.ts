import { NextRequest, NextResponse } from 'next/server';

const BaseURLAuth = process.env.NEXT_PUBLIC_BaseURLAuth || '';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 },
      );
    }

    const token = authHeader.split(' ')[1];

    const response = await fetch(`${BaseURLAuth}/users/me?include=permission`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    const userData = data.data;

    // Determine user role based on permissions
    let role = 'student'; // default role

    if (userData.user_permissions) {
      // Check for admin permissions
      if (
        userData.user_permissions['admin'] ||
        userData.user_permissions['organization_admin']
      ) {
        role = 'admin';
      }
      // Check for teacher permissions
      else if (
        userData.user_permissions['teacher'] ||
        userData.user_permissions['instructor']
      ) {
        role = 'teacher';
      }
      // Otherwise default to student
    }

    return NextResponse.json({
      id: userData.id,
      email: userData.attributes.email,
      firstName: userData.attributes.first_name,
      lastName: userData.attributes.last_name,
      role: role,
      permissions: userData.user_permissions,
      orgId: userData.attributes.org,
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 },
    );
  }
}
