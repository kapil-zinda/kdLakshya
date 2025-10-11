'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StudentLoginData {
  username: string;
  dateOfBirth: string;
}

export default function LoginPage() {
  const [studentData, setStudentData] = useState<StudentLoginData>({
    username: '',
    dateOfBirth: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!studentData.username.trim() || !studentData.dateOfBirth) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      // Convert date from YYYY-MM-DD (HTML date input) to DD/MM/YYYY (API format)
      const convertToAPIFormat = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };

      const password = convertToAPIFormat(studentData.dateOfBirth);

      console.log('Attempting login with:', {
        username: studentData.username.trim(),
        password,
      });

      // Call external API directly
      const BaseURL =
        process.env.NEXT_PUBLIC_BaseURLAuth ||
        'https://apis.testkdlakshya.uchhal.in/auth';
      const apiUrl = `${BaseURL}/students/auth`;

      console.log('Calling external API at:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'student_auth',
            attributes: {
              username: studentData.username.trim(),
              password: password,
            },
          },
        }),
      });

      const data = await response.json();
      console.log('Login response status:', response.status);
      console.log('Login response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        const errorMessage =
          data.errors?.[0]?.detail ||
          data.errors?.[0]?.title ||
          data.message ||
          'Invalid credentials. Please try again.';
        console.error('Login failed:', errorMessage, data);
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      if (data.data) {
        // Store student authentication data
        const attrs = data.data.attributes;
        const basicAuthToken =
          attrs.credentials?.basic_auth_token ||
          attrs.basic_auth_token ||
          btoa(`${studentData.username}:${password}`);

        const studentAuthData = {
          id: data.data.id,
          studentId: attrs.student_id || data.data.id,
          orgId: attrs.org_id,
          firstName: attrs.first_name,
          lastName: attrs.last_name,
          email: attrs.email,
          gradeLevel: attrs.grade_level,
          rollNumber: attrs.roll_number,
          phone: attrs.phone,
          dateOfBirth: attrs.date_of_birth,
          admissionDate: attrs.admission_date,
          guardianInfo: attrs.guardian_info,
          role: 'student',
          basicAuthToken: basicAuthToken,
          permissions: attrs.permissions || { role: 'student' },
          authenticatedAt: attrs.authenticated_at || new Date().toISOString(),
        };

        console.log('Storing student data:', studentAuthData);

        // Store in localStorage
        localStorage.setItem('studentAuth', JSON.stringify(studentAuthData));

        // Also create a basic auth token entry for compatibility
        localStorage.setItem(
          'bearerToken',
          JSON.stringify({
            value: basicAuthToken,
            expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }),
        );

        // Redirect to student dashboard
        console.log('Student login successful, redirecting to dashboard');
        router.push('/student-dashboard');
      } else {
        setError(
          'Invalid credentials. Please check your username and date of birth.',
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Student login error:', error);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleAdminTeacherLogin = () => {
    // Clear any previous auth data
    localStorage.removeItem('bearerToken');
    localStorage.removeItem('studentAuth');
    sessionStorage.removeItem('authCodeProcessed');

    // Store the current subdomain for post-login redirect
    const currentHost = window.location.host;
    const currentSubdomain = currentHost.split('.')[0];
    if (currentSubdomain && currentSubdomain !== 'localhost') {
      sessionStorage.setItem('loginOriginSubdomain', currentSubdomain);
    }

    // Redirect to Auth0 login
    const AUTH0_Domain_Name =
      process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME ||
      'dev-p3hppyisuuaems5y.us.auth0.com';
    const AUTH0_Client_Id =
      process.env.NEXT_PUBLIC_AUTH0_Client_Id ||
      'Yue4u4piwndowcgl5Q4TNlA3fPlrdiwL';

    // Use dynamic redirect URL based on current host
    let login_redirect;
    const isLocalhost =
      currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

    if (isLocalhost) {
      login_redirect = 'http://localhost:3000/';
    } else {
      // For production, always redirect back to the current subdomain
      login_redirect = `https://${currentHost}/`;
    }

    window.location.href = `https://${AUTH0_Domain_Name}/authorize?response_type=code&client_id=${AUTH0_Client_Id}&redirect_uri=${encodeURIComponent(login_redirect)}&scope=${encodeURIComponent('openid profile email')}`;
  };

  const handleInputChange = (field: keyof StudentLoginData, value: string) => {
    setStudentData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Student Login Card (Default) */}
        <Card className="w-full shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Student Login
            </CardTitle>
            <p className="text-sm text-gray-600">
              Enter your username and date of birth to access your dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleStudentLogin} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700"
                >
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="68d6b128d88f00c8b1b4a89a-Rishabh"
                  value={studentData.username}
                  onChange={(e) =>
                    handleInputChange('username', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500">
                  Format: org_id-first_name
                </p>
              </div>

              {/* Date of Birth Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="dob"
                  className="text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </Label>
                <Input
                  id="dob"
                  type="date"
                  value={studentData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange('dateOfBirth', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {/* Student Login Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In as Student'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            {/* Admin/Teacher Login Button */}
            <Button
              onClick={handleAdminTeacherLogin}
              variant="outline"
              className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-medium py-2 px-4 rounded-md transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Admin / Teacher Login
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Having trouble logging in?{' '}
            <a
              href="#"
              className="text-indigo-600 hover:text-indigo-500 underline"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
