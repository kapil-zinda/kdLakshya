import { NextRequest, NextResponse } from 'next/server';

interface StudentLoginRequest {
  username: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: StudentLoginRequest = await request.json();
    const { username, password } = body;

    // Validate required fields
    if (!username || !password) {
      return NextResponse.json(
        {
          errors: [
            {
              status: '400',
              code: 'VALIDATION_ERROR',
              title: 'Validation Error',
              detail: 'Username and password are required',
            },
          ],
        },
        { status: 400 },
      );
    }

    // Validate username format (basic validation)
    if (username.trim().length < 3) {
      return NextResponse.json(
        {
          errors: [
            {
              status: '400',
              code: 'VALIDATION_ERROR',
              title: 'Validation Error',
              detail: 'Username must be at least 3 characters long',
            },
          ],
        },
        { status: 400 },
      );
    }

    // Call the backend API for student authentication
    const { makeApiCall } = await import('@/utils/ApiRequest');

    console.log('Calling student auth API');
    console.log('With credentials:', { username: username.trim(), password });

    try {
      const responseData = await makeApiCall({
        path: '/students/auth',
        method: 'POST',
        baseUrl: 'auth',
        skipAuth: true, // No auth needed for login
        payload: {
          data: {
            type: 'student_auth',
            attributes: {
              username: username.trim(),
              password: password,
            },
          },
        },
      });

      console.log('API Response data:', responseData);

      // Successful login - return the full student data with token
      console.log('Login successful, returning data');
      return NextResponse.json({
        success: true,
        data: responseData.data,
      });
    } catch (error: any) {
      // Handle API errors
      console.error('API Error:', error);

      // Check if error response exists
      if (error.response) {
        return NextResponse.json(error.response.data, {
          status: error.response.status,
        });
      }

      // Generic error
      return NextResponse.json(
        {
          errors: [
            {
              status: '500',
              code: 'API_ERROR',
              title: 'API Error',
              detail: error.message || 'Failed to authenticate',
            },
          ],
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      {
        errors: [
          {
            status: '500',
            code: 'INTERNAL_ERROR',
            title: 'Internal Server Error',
            detail: 'An error occurred while processing your request',
          },
        ],
      },
      { status: 500 },
    );
  }
}
