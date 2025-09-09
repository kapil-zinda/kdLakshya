import { NextRequest, NextResponse } from 'next/server';

interface StudentLoginRequest {
  username: string;
  dateOfBirth: string;
}

// This would typically connect to your student database
// For now, we'll use a mock validation
const validateStudentCredentials = async (
  username: string,
  dateOfBirth: string,
) => {
  // TODO: Replace with actual database query
  // Example student data (in production, this would come from your database)
  const students = [
    {
      username: 'rishabh',
      dateOfBirth: '2001-09-14',
      name: 'Rishabh',
      class: '12th Grade',
      rollNumber: 'S001',
    },
    {
      username: 'student1',
      dateOfBirth: '2005-01-15',
      name: 'John Doe',
      class: '10th Grade',
      rollNumber: 'S002',
    },
    {
      username: 'student2',
      dateOfBirth: '2004-06-20',
      name: 'Jane Smith',
      class: '11th Grade',
      rollNumber: 'S003',
    },
    {
      username: 'student3',
      dateOfBirth: '2005-03-10',
      name: 'Mike Johnson',
      class: '10th Grade',
      rollNumber: 'S004',
    },
  ];

  // Find student by username and date of birth
  const student = students.find(
    (s) =>
      s.username.toLowerCase() === username.toLowerCase() &&
      s.dateOfBirth === dateOfBirth,
  );

  return student;
};

export async function POST(request: NextRequest) {
  try {
    const body: StudentLoginRequest = await request.json();
    const { username, dateOfBirth } = body;

    // Validate required fields
    if (!username || !dateOfBirth) {
      return NextResponse.json(
        { success: false, error: 'Username and date of birth are required' },
        { status: 400 },
      );
    }

    // Validate username format (basic validation)
    if (username.trim().length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username must be at least 3 characters long',
        },
        { status: 400 },
      );
    }

    // Validate date format and ensure it's not in the future
    const dobDate = new Date(dateOfBirth);
    const today = new Date();

    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 },
      );
    }

    if (dobDate > today) {
      return NextResponse.json(
        { success: false, error: 'Date of birth cannot be in the future' },
        { status: 400 },
      );
    }

    // Validate student credentials
    const student = await validateStudentCredentials(
      username.trim(),
      dateOfBirth,
    );

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid credentials. Please check your username and date of birth.',
        },
        { status: 401 },
      );
    }

    // Successful login
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      student: {
        username: student.username,
        name: student.name,
        class: student.class,
        rollNumber: student.rollNumber,
        userType: 'student',
      },
    });
  } catch (error) {
    console.error('Student login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
