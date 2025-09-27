'use client';

import { useEffect, useState } from 'react';

import { Footer } from '@/components/template/Footer';
import { Header } from '@/components/template/Header';
import { Button } from '@/components/ui/button';
import {
  ApiService,
  transformApiDataToOrganizationConfig,
} from '@/services/api';
import { OrganizationConfig } from '@/types/organization';
import { getSubdomain } from '@/utils/subdomainUtils';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const [organizationData, setOrganizationData] =
    useState<OrganizationConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  useEffect(() => {
    const loadDataFromAPI = async () => {
      try {
        setLoading(true);
        const subdomain = getSubdomain();
        const apiData = await ApiService.fetchAllData(subdomain || 'auth');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading contact information...</p>
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
          {/* Page Header */}
          <section className="py-12 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <div className="text-center mb-12">
                <h1
                  className="text-3xl md:text-4xl lg:text-5xl font-light mb-6"
                  style={{ color: organizationData.branding.primaryColor }}
                >
                  Contact Us
                </h1>
                <div
                  className="w-20 h-1 mx-auto mb-8 rounded-full"
                  style={{
                    backgroundColor: organizationData.branding.accentColor,
                  }}
                ></div>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  We are here to help and answer any questions you might have.
                  We look forward to hearing from you.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Information & Form */}
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Information */}
                <div>
                  <h2
                    className="text-2xl font-medium mb-8"
                    style={{
                      color: organizationData.branding.primaryColor,
                    }}
                  >
                    Get in Touch
                  </h2>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: `${organizationData.branding.primaryColor}10`,
                        }}
                      >
                        <MapPin
                          className="h-6 w-6"
                          style={{
                            color: organizationData.branding.primaryColor,
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Address
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {organizationData.contact.address.street}
                          <br />
                          {organizationData.contact.address.city},{' '}
                          {organizationData.contact.address.state}
                          <br />
                          {organizationData.contact.address.country} -{' '}
                          {organizationData.contact.address.zipCode}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: `${organizationData.branding.secondaryColor}10`,
                        }}
                      >
                        <Phone
                          className="h-6 w-6"
                          style={{
                            color: organizationData.branding.secondaryColor,
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Phone
                        </h3>
                        <p className="text-gray-600">
                          <a
                            href={`tel:${organizationData.contact.phone}`}
                            className="hover:underline"
                          >
                            {organizationData.contact.phone}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          backgroundColor: `${organizationData.branding.accentColor}10`,
                        }}
                      >
                        <Mail
                          className="h-6 w-6"
                          style={{
                            color: organizationData.branding.accentColor,
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-2">
                          Email
                        </h3>
                        <p className="text-gray-600">
                          <a
                            href={`mailto:${organizationData.contact.email}`}
                            className="hover:underline"
                          >
                            {organizationData.contact.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Office Hours */}
                  <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg">
                    <h3 className="font-medium text-gray-900 mb-4">
                      Office Hours
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span>8:00 AM - 5:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span>9:00 AM - 2:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span>Closed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div>
                  <h2
                    className="text-2xl font-medium mb-8"
                    style={{
                      color: organizationData.branding.primaryColor,
                    }}
                  >
                    Send us a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                          style={
                            {
                              '--tw-ring-color': `${organizationData.branding.primaryColor}30`,
                              backgroundColor: 'white',
                              color: '#111827',
                            } as React.CSSProperties
                          }
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                          style={{
                            backgroundColor: 'white',
                            color: '#111827',
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                          style={{
                            backgroundColor: 'white',
                            color: '#111827',
                          }}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="subject"
                          className="block text-sm font-medium text-gray-700 mb-2"
                        >
                          Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors"
                          style={{
                            backgroundColor: 'white',
                            color: '#111827',
                          }}
                        >
                          <option value="">Select a subject</option>
                          <option value="admission">Admission Inquiry</option>
                          <option value="general">General Information</option>
                          <option value="academic">Academic Programs</option>
                          <option value="facilities">Facilities</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-colors resize-none"
                        placeholder="Please tell us how we can help you..."
                        style={{
                          backgroundColor: 'white',
                          color: '#111827',
                        }}
                      ></textarea>
                    </div>

                    <Button
                      type="submit"
                      className="w-full py-4 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: organizationData.branding.primaryColor,
                        borderColor: organizationData.branding.primaryColor,
                      }}
                    >
                      Send Message
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer organization={organizationData} />
      </div>
    </div>
  );
}
