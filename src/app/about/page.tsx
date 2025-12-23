'use client';

import { AboutSection } from '@/components/template/AboutSection';
import { Footer } from '@/components/template/Footer';
import { Header } from '@/components/template/Header';
import { useOrganizationData } from '@/hooks/useOrganizationData';

export default function AboutPage() {
  const { organizationData, loading } = useOrganizationData();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading about information...</p>
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
          {/* <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-12">
              <h1
                className="text-3xl md:text-4xl lg:text-5xl font-light mb-6"
                style={{ color: organizationData.branding.primaryColor }}
              >
                About {organizationData.name}
              </h1>
              <div
                className="w-20 h-1 mx-auto mb-8 rounded-full"
                style={{
                  backgroundColor: organizationData.branding.accentColor,
                }}
              ></div>
            </div>
          </div> */}

          <AboutSection
            data={organizationData.about}
            branding={organizationData.branding}
            organizationName={organizationData.name}
            showNotifications={false}
          />

          {/* Additional About Content */}
          {/* <section className="py-16 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <div className="prose prose-lg mx-auto">
                <h2
                  className="text-2xl font-medium mb-6"
                  style={{ color: organizationData.branding.primaryColor }}
                >
                  Our Story
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Founded in {organizationData.founded}, {organizationData.name}{' '}
                  has been committed to providing exceptional education that
                  prepares students for success in an ever-changing world. Our
                  journey began with a simple vision: to create an educational
                  environment where every student can thrive and reach their
                  full potential.
                </p>

                <h2
                  className="text-2xl font-medium mb-6"
                  style={{ color: organizationData.branding.primaryColor }}
                >
                  Our Approach
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  We believe in a holistic approach to education that nurtures
                  not just academic excellence, but also character development,
                  creativity, and critical thinking. Our experienced faculty and
                  staff work together to create engaging learning experiences
                  that inspire students to become lifelong learners and
                  responsible global citizens.
                </p>

                <h2
                  className="text-2xl font-medium mb-6"
                  style={{ color: organizationData.branding.primaryColor }}
                >
                  Looking Forward
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  As we continue to evolve and grow, we remain committed to our
                  founding principles while embracing innovation and new
                  approaches to education. We are excited about the future and
                  the opportunities it holds for our students, faculty, and the
                  broader community.
                </p>
              </div>
            </div>
          </section> */}
        </main>

        <Footer organization={organizationData} />
      </div>
    </div>
  );
}
