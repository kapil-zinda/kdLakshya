'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiService } from '@/services/api';

interface StudentLoginData {
  firstName: string;
  dateOfBirth: string;
}

export default function LoginPage() {
  const [studentData, setStudentData] = useState<StudentLoginData>({
    firstName: '',
    dateOfBirth: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [orgId, setOrgId] = useState('');
  const router = useRouter();

  // Get org_id from cache, environment, or subdomain API
  useEffect(() => {
    const getOrgId = async () => {
      const currentHost = window.location.host;
      const subdomain = currentHost.split('.')[0];

      console.log(
        '🔍 Starting org_id fetch for host:',
        currentHost,
        'subdomain:',
        subdomain,
      );

      // If on 'auth' subdomain, use default org_id (auth subdomain doesn't have its own org)
      if (subdomain === 'auth') {
        console.log('🔐 On auth subdomain, using default org_id');
        const defaultOrgId = '68d6b128d88f00c8b1b4a89a';
        setOrgId(defaultOrgId);
        return;
      }

      // First check if org_id is cached in localStorage
      const cachedOrgId = localStorage.getItem('orgId');
      const cachedSubdomain = localStorage.getItem('cachedSubdomain');

      // Only use cached org_id if it's for the same subdomain
      if (cachedOrgId && cachedSubdomain === subdomain) {
        console.log(
          '✅ Using cached org_id for subdomain:',
          subdomain,
          'org_id:',
          cachedOrgId,
        );
        setOrgId(cachedOrgId);
        return;
      } else if (cachedOrgId) {
        console.log(
          '⚠️ Cached org_id exists but subdomain changed. Old:',
          cachedSubdomain,
          'New:',
          subdomain,
        );
        // Clear old cache
        localStorage.removeItem('orgId');
        localStorage.removeItem('cachedSubdomain');
      }

      // Second, try to get from environment variable
      const envOrgId = process.env.NEXT_PUBLIC_ORG_ID;
      if (envOrgId) {
        console.log('📦 Using org_id from environment:', envOrgId);
        setOrgId(envOrgId);
        localStorage.setItem('orgId', envOrgId);
        localStorage.setItem('cachedSubdomain', subdomain);
        return;
      }

      // Get additional host info
      const isLocalhost =
        currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

      // Check if we have a valid subdomain (not just 'localhost')
      const hasSubdomain =
        subdomain && subdomain !== 'localhost' && subdomain !== '127';

      // For localhost without subdomain, use default org_id
      if (isLocalhost && !hasSubdomain) {
        console.log('🏠 Using default org_id for localhost without subdomain');
        const defaultOrgId = '68d6b128d88f00c8b1b4a89a';
        setOrgId(defaultOrgId);
        localStorage.setItem('orgId', defaultOrgId);
        localStorage.setItem('cachedSubdomain', subdomain);
        return;
      }

      // For localhost with subdomain (e.g., spd.localhost) or production, fetch org_id from API
      const subdomainToFetch = hasSubdomain ? subdomain : 'default';

      try {
        const BaseURL =
          process.env.NEXT_PUBLIC_BaseURLAuth ||
          'https://apis.testkdlakshya.uchhal.in/auth';
        const apiUrl = `${BaseURL}/organizations/subdomain/${subdomainToFetch}`;

        console.log(
          '🌐 Fetching org_id from API for subdomain:',
          subdomainToFetch,
        );
        console.log('📡 API URL:', apiUrl);

        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/vnd.api+json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('📥 API Response:', data);
          const fetchedOrgId = data.data?.id || data.data?.attributes?.id;

          if (fetchedOrgId) {
            console.log(
              '✅ Fetched org_id from API:',
              fetchedOrgId,
              'for subdomain:',
              subdomainToFetch,
            );
            setOrgId(fetchedOrgId);
            // Cache the org_id with the subdomain for future use
            localStorage.setItem('orgId', fetchedOrgId);
            localStorage.setItem('cachedSubdomain', subdomain);
            return;
          }
        }

        console.error(
          '❌ Failed to fetch org_id from subdomain API, response status:',
          response.status,
        );
        // Fallback to default if API fails
        const fallbackOrgId = '68d6b128d88f00c8b1b4a89a';
        setOrgId(fallbackOrgId);
        localStorage.setItem('orgId', fallbackOrgId);
        localStorage.setItem('cachedSubdomain', subdomain);
      } catch (error) {
        console.error('❌ Error fetching org_id:', error);
        // Fallback to default if error occurs
        const fallbackOrgId = '68d6b128d88f00c8b1b4a89a';
        setOrgId(fallbackOrgId);
        localStorage.setItem('orgId', fallbackOrgId);
        localStorage.setItem('cachedSubdomain', subdomain);
      }
    };

    getOrgId();
  }, []);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate required fields
      if (!studentData.firstName.trim() || !studentData.dateOfBirth) {
        setError('Please fill in all fields');
        setIsLoading(false);
        return;
      }

      if (!orgId) {
        setError('Organization ID not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      // Create username by combining org_id and first name
      const username = `${orgId}-${studentData.firstName.trim()}`;

      // Convert date from YYYY-MM-DD (HTML date input) to DD/MM/YYYY (API format)
      const convertToAPIFormat = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
      };

      const password = convertToAPIFormat(studentData.dateOfBirth);

      console.log('🎓 Attempting student login with:', {
        username: username,
        orgId,
      });

      // Call external API directly
      const BaseURL =
        process.env.NEXT_PUBLIC_BaseURLAuth ||
        'https://apis.testkdlakshya.uchhal.in/auth';
      const apiUrl = `${BaseURL}/students/auth`;

      console.log('📡 Calling student auth API at:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
        },
        body: JSON.stringify({
          data: {
            type: 'student_auth',
            attributes: {
              username: username,
              password: password,
            },
          },
        }),
      });

      const data = await response.json();
      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response data:', JSON.stringify(data, null, 2));

      if (!response.ok) {
        const errorMessage =
          data.errors?.[0]?.detail ||
          data.errors?.[0]?.title ||
          data.message ||
          'Invalid credentials. Please try again.';
        console.error('❌ Login failed:', errorMessage, data);
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
          btoa(`${username}:${password}`);

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

        console.log('💾 Storing student data:', studentAuthData);

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

        // Check if we need to redirect back to original subdomain
        const currentHost = window.location.host;
        const currentSubdomain = currentHost.split('.')[0];
        const isLocalhost = currentHost.includes('localhost');

        // Get return subdomain from sessionStorage (stored when user clicked login from org subdomain)
        const returnToSubdomain = sessionStorage.getItem(
          'loginOriginSubdomain',
        );

        console.log('🔄 Post-student-login redirect check:', {
          currentHost,
          currentSubdomain,
          returnToSubdomain,
          isLocalhost,
        });

        // If we're on 'auth' subdomain, redirect to appropriate org subdomain
        if (currentSubdomain === 'auth') {
          // Try to get return subdomain from sessionStorage first
          let targetSubdomain = returnToSubdomain;

          // If no return subdomain, try to fetch student's org subdomain from API
          if (!targetSubdomain || targetSubdomain === 'auth') {
            console.log(
              '🔍 No return subdomain found, fetching org subdomain from API...',
            );
            try {
              // Use ApiService to fetch organization data with student x-api-key auth
              const orgData = await ApiService.getOrganizationById(
                studentAuthData.orgId,
                studentAuthData.basicAuthToken,
                true, // isStudentAuth = true to use x-api-key header
              );
              targetSubdomain = orgData.data?.attributes?.subdomain;
              console.log(
                '✅ Fetched org subdomain from API:',
                targetSubdomain,
              );
            } catch (error) {
              console.error('❌ Error fetching org subdomain:', error);
            }
          }

          // If we have a target subdomain, redirect there
          if (targetSubdomain && targetSubdomain !== 'auth') {
            console.log(
              '↩️ Student authenticated on auth subdomain, redirecting to org:',
              targetSubdomain,
            );

            // Encode student auth data to pass it to the org subdomain via URL hash
            const encodedAuthData = encodeURIComponent(
              JSON.stringify(studentAuthData),
            );

            if (isLocalhost) {
              const port = currentHost.split(':')[1] || '3000';
              // Redirect to homepage with hash, page.tsx will process and redirect to dashboard
              const redirectUrl = `http://${targetSubdomain}.localhost:${port}/#student_auth=${encodedAuthData}`;
              console.log('🔗 Student redirect URL (dev):', redirectUrl);
              console.log(
                '📦 Passing student auth data via URL hash for cross-subdomain auth',
              );
              window.location.href = redirectUrl;
            } else {
              const domain = currentHost.split('.').slice(1).join('.');
              // Redirect to homepage with hash, page.tsx will process and redirect to dashboard
              const redirectUrl = `https://${targetSubdomain}.${domain}/#student_auth=${encodedAuthData}`;
              console.log('🔗 Student redirect URL (prod):', redirectUrl);
              console.log(
                '📦 Passing student auth data via URL hash for cross-subdomain auth',
              );
              window.location.href = redirectUrl;
            }
            sessionStorage.removeItem('loginOriginSubdomain');
          } else {
            // No org subdomain found, stay on auth subdomain dashboard
            console.log(
              '⚠️ No org subdomain available, redirecting to dashboard on auth subdomain',
            );
            router.push('/dashboard');
          }
        } else {
          // Normal redirect to dashboard on same subdomain
          console.log(
            '✅ Student login successful, redirecting to dashboard on same subdomain',
          );
          router.push('/dashboard');
        }
      } else {
        setError(
          'Invalid credentials. Please check your username and date of birth.',
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Student login error:', error);
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

    // Store origin subdomain if not already on auth subdomain
    if (
      currentSubdomain &&
      currentSubdomain !== 'auth' &&
      currentSubdomain !== 'localhost'
    ) {
      sessionStorage.setItem('loginOriginSubdomain', currentSubdomain);
      console.log('💾 Stored origin subdomain for return:', currentSubdomain);
    }

    // Redirect to Auth0 login
    const AUTH0_Domain_Name =
      process.env.NEXT_PUBLIC_Auth0_DOMAIN_NAME ||
      'dev-p3hppyisuuaems5y.us.auth0.com';
    const AUTH0_Client_Id =
      process.env.NEXT_PUBLIC_AUTH0_Client_Id ||
      'Yue4u4piwndowcgl5Q4TNlA3fPlrdiwL';

    // Always redirect back to auth subdomain after Auth0 authentication
    let login_redirect;
    const isLocalhost =
      currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

    if (isLocalhost) {
      const port = currentHost.split(':')[1] || '3000';
      login_redirect = `http://auth.localhost:${port}/`;
    } else {
      // For production, always redirect to auth.uchhal.in
      const domain = currentHost.split('.').slice(1).join('.'); // Get base domain (uchhal.in)
      login_redirect = `https://auth.${domain}/`;
    }

    console.log('🔐 Redirecting to Auth0 with callback to:', login_redirect);

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
              Enter your first name and date of birth to access your dashboard
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleStudentLogin} className="space-y-4">
              {/* First Name Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Rishabh"
                  value={studentData.firstName}
                  onChange={(e) =>
                    handleInputChange('firstName', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
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
