'use client';

import { useEffect, useState } from 'react';

import { Footer } from '@/components/template/Footer';
import { Header } from '@/components/template/Header';
import { useOrganizationData } from '@/hooks/useOrganizationData';
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { ApiService } from '@/services/api';
import { Award, BookOpen, GraduationCap, Mail, Phone } from 'lucide-react';

interface Faculty {
  id: string;
  name: string;
  position: string;
  department: string;
  image: string;
  email: string;
  phone: string;
  qualifications: string[];
  experience: string;
  specialties: string[];
  bio: string;
}

export default function FacultiesPage() {
  const { organizationData, loading: orgLoading } = useOrganizationData();
  const { userData } = useUserDataRedux();
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [facultyMembers, setFacultyMembers] = useState<Faculty[]>([]);
  const [subjects, setSubjects] = useState<string[]>(['All']);

  useEffect(() => {
    const loadFacultyData = async () => {
      if (!organizationData || !userData?.orgId) return;

      try {
        setLoading(true);
        const orgId = userData.orgId;
        console.log('🏫 Using Organization ID:', orgId);

        // Fetch faculty data
        console.log('🎓 Fetching faculty data...');

        let facultyResponse;
        try {
          console.log(`📞 Calling API: /${orgId}/faculty`);
          facultyResponse = await ApiService.getFaculty(orgId);
          console.log('✅ Faculty API Response:', facultyResponse);
          console.log(
            '👥 Number of faculty members:',
            facultyResponse.data?.length || 0,
          );
        } catch (facultyError) {
          console.error('❌ Failed to fetch faculty:', facultyError);
          // Don't throw, just set empty array and continue
          setFacultyMembers([]);
          setSubjects(['All']);
          return; // Exit early if faculty fetch fails
        }

        // Check if we have faculty data
        if (!facultyResponse.data || facultyResponse.data.length === 0) {
          console.warn('⚠️ No faculty members found');
          setFacultyMembers([]);
          setSubjects(['All']);
          return;
        }

        // Transform API data to Faculty interface
        const transformedFaculty: Faculty[] = facultyResponse.data.map(
          (member) => {
            console.log(
              '📋 Transforming faculty member:',
              member.attributes.name,
            );
            return {
              id: member.id,
              name: member.attributes.name,
              position: member.attributes.designation,
              department: member.attributes.role || 'General',
              image:
                member.attributes.photo ||
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
              email: member.attributes.email,
              phone: member.attributes.phone,
              qualifications: [], // API doesn't provide qualifications yet
              experience: `${member.attributes.experience} years`,
              specialties: member.attributes.subjects || [],
              bio: member.attributes.bio,
            };
          },
        );

        console.log('🎯 Transformed faculty data:', transformedFaculty);
        setFacultyMembers(transformedFaculty);

        // Extract unique subjects from all faculty members
        const allSubjects = transformedFaculty.flatMap((f) => f.specialties);
        const uniqueSubjects = [
          'All',
          ...Array.from(new Set(allSubjects)).sort(),
        ];
        console.log('📚 Subjects:', uniqueSubjects);
        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error('❌ Failed to load faculty data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFacultyData();
  }, [organizationData, userData]);

  // Show loading spinner for content, but still render Header for navigation
  const isLoading = orgLoading || loading;
  const hasNoData = !orgLoading && !organizationData;

  const filteredFaculty =
    selectedSubject === 'All'
      ? facultyMembers
      : facultyMembers.filter((member) =>
          member.specialties.includes(selectedSubject),
        );

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {organizationData && (
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
      )}

      <div className="template-container">
        {organizationData && <Header organization={organizationData} />}

        {isLoading && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600">Loading faculty information...</p>
            </div>
          </div>
        )}

        {hasNoData && (
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
        )}

        {!isLoading && organizationData && (
          <>
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

                  {/* Subject Filter */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => setSelectedSubject(subject)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                          selectedSubject === subject
                            ? 'text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={{
                          backgroundColor:
                            selectedSubject === subject
                              ? organizationData.branding.primaryColor
                              : undefined,
                        }}
                      >
                        {subject}
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
                            <p className="text-sm opacity-90">
                              {faculty.position}
                            </p>
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
                        No faculty members found teaching this subject.
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
          </>
        )}
      </div>
    </div>
  );
}
