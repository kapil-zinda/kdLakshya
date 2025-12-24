'use client';

import { useState } from 'react';

import { Footer } from '@/components/template/Footer';
import { Header } from '@/components/template/Header';
import { useOrganizationData } from '@/hooks/useOrganizationData';

const galleryImages = [
  {
    id: 1,
    src: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Campus View',
    category: 'Campus',
    title: 'Beautiful Campus Grounds',
  },
  {
    id: 2,
    src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Students in Classroom',
    category: 'Academic',
    title: 'Interactive Learning Environment',
  },
  {
    id: 3,
    src: 'https://images.unsplash.com/photo-1581092795442-bcd3bfa0f8a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Laboratory',
    category: 'Facilities',
    title: 'State-of-the-art Science Lab',
  },
  {
    id: 4,
    src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Sports Activities',
    category: 'Sports',
    title: 'Athletic Excellence',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Library',
    category: 'Facilities',
    title: 'Modern Library',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Cultural Event',
    category: 'Events',
    title: 'Cultural Celebrations',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Graduation Ceremony',
    category: 'Events',
    title: 'Graduation Day',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    alt: 'Art Class',
    category: 'Academic',
    title: 'Creative Arts Program',
  },
];

const categories = [
  'All',
  'Campus',
  'Academic',
  'Facilities',
  'Sports',
  'Events',
];

export default function GalleryPage() {
  const { organizationData, loading } = useOrganizationData();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (!organizationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            No Data Available
          </h1>
          <p className="text-muted-foreground">
            Unable to load organization data from API
          </p>
        </div>
      </div>
    );
  }

  const filteredImages =
    selectedCategory === 'All'
      ? galleryImages
      : galleryImages.filter((img) => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                  Gallery
                </h1>
                <div
                  className="w-20 h-1 mx-auto mb-8 rounded-full"
                  style={{
                    backgroundColor: organizationData.branding.accentColor,
                  }}
                ></div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Explore our vibrant campus life, academic excellence, and
                  memorable moments captured throughout our journey.
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      selectedCategory === category
                        ? 'text-white shadow-lg'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={{
                      backgroundColor:
                        selectedCategory === category
                          ? organizationData.branding.primaryColor
                          : undefined,
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="text-white font-medium text-sm">
                          {image.title}
                        </h3>
                        <p className="text-white/80 text-xs">
                          {image.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredImages.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No images found in this category.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer organization={organizationData} />

        {/* Image Modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="max-w-4xl max-h-full relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-12 right-0 text-white text-2xl hover:text-gray-300 transition-colors"
              >
                ×
              </button>
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent rounded-b-lg">
                <h3 className="text-white font-medium text-lg">
                  {selectedImage.title}
                </h3>
                <p className="text-white/80">{selectedImage.category}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
