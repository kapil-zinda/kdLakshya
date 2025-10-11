'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, User } from 'lucide-react';

export default function StudentLoginPage() {
  const [username, setUsername] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const convertDateFormat = (dateStr: string) => {
    // Convert various formats to dd/mm/yyyy for API

    // Check if it contains slashes (dd/mm/yyyy)
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const [part1, part2, part3] = parts;
        // Check if yyyy/mm/dd format
        if (part1.length === 4) {
          return `${part3}/${part2}/${part1}`;
        }
        // Already dd/mm/yyyy, ensure padding
        return `${part1.padStart(2, '0')}/${part2.padStart(2, '0')}/${part3}`;
      }
    }

    // Check if it contains dashes
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        // Check if it's yyyy-mm-dd format
        if (parts[0].length === 4) {
          const [year, month, day] = parts;
          return `${day}/${month}/${year}`;
        }
        // Convert dd-mm-yyyy to dd/mm/yyyy
        const [day, month, year] = parts;
        return `${day}/${month}/${year}`;
      }
    }

    return dateStr; // Return as-is
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert date from dd/mm/yyyy to yyyy-mm-dd for API
      const password = convertDateFormat(dateOfBirth);

      console.log('Attempting login with:', {
        username: username.trim(),
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
              username: username.trim(),
              password: password,
            },
          },
        }),
      });

      const data = await response.json();

      console.log('Login response:', data); // Debug log

      if (!response.ok) {
        // Handle error response
        const errorMessage =
          data.errors?.[0]?.detail || 'Invalid credentials. Please try again.';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // API returns data directly in the response
      if (data.data) {
        // Store student authentication data
        const attrs = data.data.attributes;
        const basicAuthToken =
          attrs.credentials?.basic_auth_token ||
          attrs.basic_auth_token ||
          btoa(`${username}:${password}`); // Fallback: create basic auth token

        const studentData = {
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

        console.log('Storing student data:', studentData); // Debug log

        // Store in localStorage
        localStorage.setItem('studentAuth', JSON.stringify(studentData));

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
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-gray-600 hover:text-gray-900"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Student Login
            </h1>
            <p className="text-gray-600">
              Enter your username and date of birth to access your dashboard
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="68d6b128d88f00c8b1b4a89a-Rishabh"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Format: org_id-first_name (e.g., 68d6b128...89a-Rishabh)
              </p>
            </div>

            {/* Date of Birth Field */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Date of Birth
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="dateOfBirth"
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="14/09/2001 or 2001-09-14"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Format: dd/mm/yyyy (e.g., 14/09/2001)
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <button
                onClick={() => router.push('/contact')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contact your school administrator
              </button>
            </p>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Login Instructions:
            </h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>
                • Username: Your organization ID followed by your first name
              </li>
              <li>
                • Date of Birth: Your date of birth in dd/mm/yyyy format (e.g.,
                14/09/2001)
              </li>
              <li>• Contact your school if you forgot your credentials</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          By logging in, you agree to follow your school&apos;s policies
        </p>
      </div>
    </div>
  );
}
