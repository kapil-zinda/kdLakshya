'use client';

import { OrganizationConfig } from '@/types/organization';
import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from 'lucide-react';

interface FooterProps {
  organization: OrganizationConfig;
}

export function Footer({ organization }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialIcons = {
    facebook: Facebook,
    twitter: Twitter,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  return (
    <footer
      className="text-white dark:text-gray-100 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${organization.branding.primaryColor}f0, ${organization.branding.secondaryColor}f0)`,
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-10 mb-6">
          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 mb-5">
              <li>
                <a
                  href="/about"
                  className="hover:text-white transition-colors duration-200 font-light text-sm sm:text-base"
                  style={{ color: '#d1d5db' }}
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-white transition-colors duration-200 font-light text-sm sm:text-base"
                  style={{ color: '#d1d5db' }}
                >
                  Contact Us
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div>
              <h4 className="text-base sm:text-lg font-medium mb-2 sm:mb-3">
                Follow Us
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(organization.social).map(([platform, url]) => {
                  if (!url) return null;
                  const IconComponent =
                    socialIcons[platform as keyof typeof socialIcons];
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110"
                      aria-label={`Follow us on ${platform}`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
              Contact Info
            </h4>
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-start space-x-2.5">
                <MapPin
                  className="h-4 w-4 mt-0.5 flex-shrink-0"
                  style={{ color: organization.branding.accentColor }}
                />
                <div
                  className="text-xs sm:text-sm font-light"
                  style={{ color: '#d1d5db' }}
                >
                  <p>{organization.contact.address.street}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: organization.branding.accentColor }}
                />
                <a
                  href={`tel:${organization.contact.phone}`}
                  className="text-xs sm:text-sm hover:text-white transition-colors duration-200 font-light"
                  style={{ color: '#d1d5db' }}
                >
                  {organization.contact.phone}
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Mail
                  className="h-4 w-4 flex-shrink-0"
                  style={{ color: organization.branding.accentColor }}
                />
                <a
                  href={`mailto:${organization.contact.email}`}
                  className="text-xs sm:text-sm hover:text-white transition-colors duration-200 font-light"
                  style={{ color: '#d1d5db' }}
                >
                  {organization.contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-4 text-center">
          <p className="text-xs font-light" style={{ color: '#9ca3af' }}>
            © {currentYear} {organization.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
