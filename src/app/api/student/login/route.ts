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
    const BaseURL =
      process.env.NEXT_PUBLIC_BaseURLAuth ||
      'https://apis.testkdlakshya.uchhal.in/auth';

    console.log('Calling student auth API:', `${BaseURL}/students/auth`);
    console.log('With credentials:', { username: username.trim(), password });

    const apiResponse = await fetch(`${BaseURL}/students/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
      body: JSON.stringify({
        data: {
          type: 'student_auth',
          attributes: {
            username: username.trim(),
            password: password,
          },
        },
      }),
    });

    console.log('API Response status:', apiResponse.status);

    const responseData = await apiResponse.json();
    console.log('API Response data:', responseData);

    if (!apiResponse.ok) {
      // Return the error from the API
      console.error('API Error:', responseData);
      return NextResponse.json(responseData, { status: apiResponse.status });
    }

    // Successful login - return the full student data with token
    console.log('Login successful, returning data');
    return NextResponse.json({
      success: true,
      data: responseData.data,
    });
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
