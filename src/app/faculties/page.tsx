'use client';

import { useEffect, useState } from 'react';

import { Footer } from '@/components/template/Footer';
import { Header } from '@/components/template/Header';
import {
  ApiService,
  transformApiDataToOrganizationConfig,
} from '@/services/api';
import { OrganizationConfig } from '@/types/organization';
import { getSubdomain } from '@/utils/subdomainUtils';
import { Award, BookOpen, GraduationCap, Mail, Phone } from 'lucide-react';

const facultyMembers = [
  {
    id: 1,
    name: 'Dr. Sarah Johnson',
    position: 'Principal',
    department: 'Administration',
    image:
      'https://images.unsplash.com/photo-1594824388853-c02456ff1b0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'sarah.johnson@school.edu',
    phone: '+1-555-0101',
    qualifications: [
      'Ph.D. in Educational Leadership',
      'M.Ed. in Curriculum Development',
      'B.A. in English Literature',
    ],
    experience: '15+ years in education administration',
    specialties: [
      'Educational Leadership',
      'Curriculum Development',
      'Strategic Planning',
    ],
    bio: 'Dr. Johnson brings over 15 years of educational leadership experience to our institution. She is passionate about creating innovative learning environments that foster both academic excellence and character development.',
  },
  {
    id: 2,
    name: 'Prof. Michael Chen',
    position: 'Head of Sciences',
    department: 'Science',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'michael.chen@school.edu',
    phone: '+1-555-0102',
    qualifications: [
      'Ph.D. in Physics',
      'M.S. in Applied Mathematics',
      'B.S. in Physics',
    ],
    experience: '12 years in STEM education',
    specialties: ['Physics', 'Mathematics', 'Research Methodology'],
    bio: 'Professor Chen is dedicated to making science accessible and exciting for students. His innovative teaching methods have earned recognition both locally and nationally.',
  },
  {
    id: 3,
    name: 'Ms. Emily Rodriguez',
    position: 'English Department Head',
    department: 'English',
    image:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'emily.rodriguez@school.edu',
    phone: '+1-555-0103',
    qualifications: [
      'M.A. in English Literature',
      'B.A. in Creative Writing',
      'Teaching Certification',
    ],
    experience: '10 years in language arts education',
    specialties: ['Literature', 'Creative Writing', 'Public Speaking'],
    bio: 'Ms. Rodriguez believes in the power of literature to transform lives. She encourages students to find their voice through reading and writing.',
  },
  {
    id: 4,
    name: 'Dr. James Wilson',
    position: 'Mathematics Coordinator',
    department: 'Mathematics',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'james.wilson@school.edu',
    phone: '+1-555-0104',
    qualifications: [
      'Ph.D. in Mathematics',
      'M.S. in Statistics',
      'B.S. in Mathematics',
    ],
    experience: '14 years in mathematics education',
    specialties: ['Advanced Mathematics', 'Statistics', 'Problem Solving'],
    bio: 'Dr. Wilson makes mathematics engaging through real-world applications and interactive problem-solving sessions.',
  },
  {
    id: 5,
    name: 'Ms. Lisa Thompson',
    position: 'Art & Design Teacher',
    department: 'Arts',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b050?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'lisa.thompson@school.edu',
    phone: '+1-555-0105',
    qualifications: [
      'M.F.A. in Fine Arts',
      'B.A. in Art History',
      'Digital Design Certificate',
    ],
    experience: '8 years in arts education',
    specialties: ['Visual Arts', 'Digital Design', 'Art History'],
    bio: 'Ms. Thompson inspires creativity in students by exploring various art forms and encouraging personal expression through visual media.',
  },
  {
    id: 6,
    name: 'Coach Robert Davis',
    position: 'Physical Education Director',
    department: 'Physical Education',
    image:
      'https://images.unsplash.com/photo-1566492031773-4f4e44671d66?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    email: 'robert.davis@school.edu',
    phone: '+1-555-0106',
    qualifications: [
      'M.S. in Kinesiology',
      'B.S. in Physical Education',
      'Coaching Certification',
    ],
    experience: '11 years in physical education',
    specialties: ['Sports Training', 'Fitness', 'Team Building'],
    bio: 'Coach Davis promotes physical wellness and teamwork through comprehensive sports programs and fitness initiatives.',
  },
];

const departments = [
  'All',
  'Administration',
  'Science',
  'English',
  'Mathematics',
  'Arts',
  'Physical Education',
];

export default function FacultiesPage() {
  const [organizationData, setOrganizationData] =
    useState<OrganizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedFaculty, setSelectedFaculty] = useState<any>(null);

  useEffect(() => {
    const loadDataFromAPI = async () => {
      try {
        setLoading(true);
        const subdomain = getSubdomain();
        const apiData = await ApiService.fetchAllData(subdomain || 'sls');
        const transformedData = transformApiDataToOrganizationConfig(apiData);
        setOrganizationData(transformedData);
      } catch (error) {
        console.error('Failed to load API data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDataFromAPI();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading faculty information...</p>
        </div>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            No Data Available
          </h1>
          <p className="text-gray-600">
            Unable to load organization data from API
          </p>
        </div>
      </div>
    );
  }

  const filteredFaculty =
    selectedDepartment === 'All'
      ? facultyMembers
      : facultyMembers.filter(
          (member) => member.department === selectedDepartment,
        );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style jsx global>{`
        :root {
          --primary-color: ${organizationData.branding.primaryColor};
          --secondary-color: ${organizationData.branding.secondaryColor};
          --accent-color: ${organizationData.branding.accentColor};
        }

        .template-container * {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .template-container header,
        .template-container header * {
          transition: none !important;
        }

        .template-container header button {
          transition:
            color 0.2s ease,
            background-color 0.2s ease,
            transform 0.2s ease !important;
        }

        .template-container header {
          backface-visibility: hidden;
          transform: translateZ(0);
          will-change: auto;
        }

        .template-container header h1,
        .template-container header p,
        .template-container header span {
          backface-visibility: hidden !important;
          transform: translateZ(0) !important;
          transition: none !important;
          will-change: auto !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
      `}</style>

      <div className="template-container">
        <Header organization={organizationData} />

        <main className="pt-8">
          {/* Page Header */}
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <div className="text-center mb-12">
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-light mb-6"
                  style={{ color: organizationData.branding.primaryColor }}
                >
                  Our Faculties
                </h1>
                <div
                  className="w-20 h-1 mx-auto mb-8 rounded-full"
                  style={{
                    backgroundColor: organizationData.branding.accentColor,
                  }}
                ></div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Meet our dedicated team of educators who are committed to
                  nurturing young minds and fostering academic excellence.
                </p>
              </div>

              {/* Department Filter */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
                {departments.map((department) => (
                  <button
                    key={department}
                    onClick={() => setSelectedDepartment(department)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      selectedDepartment === department
                        ? 'text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor:
                        selectedDepartment === department
                          ? organizationData.branding.primaryColor
                          : undefined,
                    }}
                  >
                    {department}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Faculty Grid */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFaculty.map((faculty) => (
                  <div
                    key={faculty.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedFaculty(faculty)}
                  >
                    {/* Faculty Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={faculty.image}
                        alt={faculty.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <h3 className="font-semibold text-lg">
                          {faculty.name}
                        </h3>
                        <p className="text-sm opacity-90">{faculty.position}</p>
                      </div>
                    </div>

                    {/* Faculty Info */}
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                          style={{
                            backgroundColor: `${organizationData.branding.primaryColor}10`,
                          }}
                        >
                          <GraduationCap
                            className="h-5 w-5"
                            style={{
                              color: organizationData.branding.primaryColor,
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {faculty.department}
                          </p>
                          <p className="text-sm text-gray-600">
                            {faculty.experience}
                          </p>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                        {faculty.bio}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {faculty.email && (
                            <a
                              href={`mailto:${faculty.email}`}
                              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Mail className="h-4 w-4 text-gray-600" />
                            </a>
                          )}
                          {faculty.phone && (
                            <a
                              href={`tel:${faculty.phone}`}
                              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Phone className="h-4 w-4 text-gray-600" />
                            </a>
                          )}
                        </div>
                        <button
                          className="text-sm font-medium px-4 py-1 rounded-full transition-colors"
                          style={{
                            color: organizationData.branding.primaryColor,
                            backgroundColor: `${organizationData.branding.primaryColor}10`,
                          }}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredFaculty.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No faculty members found in this department.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer organization={organizationData} />

        {/* Faculty Detail Modal */}
        {selectedFaculty && (
          <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedFaculty(null)}
          >
            <div
              className="bg-white rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="absolute top-4 right-4 z-10 bg-black/20 text-white rounded-full p-2 hover:bg-black/40 transition-colors"
                >
                  ×
                </button>

                <div className="h-64 relative overflow-hidden rounded-t-2xl">
                  <img
                    src={selectedFaculty.image}
                    alt={selectedFaculty.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h2 className="text-2xl font-bold">
                      {selectedFaculty.name}
                    </h2>
                    <p className="text-lg opacity-90">
                      {selectedFaculty.position}
                    </p>
                    <p className="text-sm opacity-80">
                      {selectedFaculty.department} Department
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h3
                      className="text-lg font-semibold mb-3 flex items-center"
                      style={{
                        color: organizationData.branding.primaryColor,
                      }}
                    >
                      <BookOpen className="h-5 w-5 mr-2" />
                      About
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {selectedFaculty.bio}
                    </p>
                  </div>

                  <div className="mb-6">
                    <h3
                      className="text-lg font-semibold mb-3 flex items-center"
                      style={{
                        color: organizationData.branding.primaryColor,
                      }}
                    >
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Qualifications
                    </h3>
                    <ul className="space-y-2">
                      {selectedFaculty.qualifications.map(
                        (qual: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span
                              className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                              style={{
                                backgroundColor:
                                  organizationData.branding.accentColor,
                              }}
                            ></span>
                            <span className="text-gray-600">{qual}</span>
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3
                      className="text-lg font-semibold mb-3 flex items-center"
                      style={{
                        color: organizationData.branding.primaryColor,
                      }}
                    >
                      <Award className="h-5 w-5 mr-2" />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFaculty.specialties.map(
                        (specialty: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: `${organizationData.branding.primaryColor}10`,
                              color: organizationData.branding.primaryColor,
                            }}
                          >
                            {specialty}
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <a
                      href={`mailto:${selectedFaculty.email}`}
                      className="flex items-center px-4 py-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: `${organizationData.branding.primaryColor}10`,
                        color: organizationData.branding.primaryColor,
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </a>
                    <a
                      href={`tel:${selectedFaculty.phone}`}
                      className="flex items-center px-4 py-2 rounded-full transition-colors"
                      style={{
                        backgroundColor: `${organizationData.branding.secondaryColor}10`,
                        color: organizationData.branding.secondaryColor,
                      }}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
