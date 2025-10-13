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
      className="text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${organization.branding.primaryColor}f0, #1f2937f0)`,
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-10 lg:mb-12">
          {/* Organization Info */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <div className="h-8 sm:h-10 lg:h-12 w-8 sm:w-10 lg:w-12 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg bg-white/20">
                {organization.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-medium leading-tight">
                  {organization.name}
                </h3>
                <p
                  className="text-xs sm:text-sm lg:text-base font-light leading-tight"
                  style={{ color: '#d1d5db' }}
                >
                  {organization.tagline}
                </p>
              </div>
            </div>
            <p
              className="mb-6 sm:mb-8 leading-relaxed font-light max-w-xs sm:max-w-sm lg:max-w-md text-sm sm:text-base"
              style={{ color: '#d1d5db' }}
            >
              {organization.description}
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
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
                    className="p-2 sm:p-2.5 lg:p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-110"
                    aria-label={`Follow us on ${platform}`}
                  >
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-6">
              Quick Links
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="/about"
                  className="hover:text-white transition-colors duration-200 font-light"
                  style={{ color: '#d1d5db' }}
                >
                  About Us
                </a>
              </li>
              {/* <li>
                <a
                  href="/programs"
                  className="hover:text-white transition-colors duration-200 font-light"
                  style={{ color: '#d1d5db' }}
                >
                  Programs
                </a>
              </li> */}
              <li>
                <a
                  href="/contact"
                  className="hover:text-white transition-colors duration-200 font-light"
                  style={{ color: '#d1d5db' }}
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-base sm:text-lg lg:text-xl font-medium mb-4 sm:mb-6">
              Contact Info
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin
                  className="h-5 w-5 mt-1 flex-shrink-0"
                  style={{ color: organization.branding.accentColor }}
                />
                <div
                  className="text-xs sm:text-sm font-light"
                  style={{ color: '#d1d5db' }}
                >
                  <p>{organization.contact.address.street}</p>
                  <p>
                    {organization.contact.address.city},{' '}
                    {organization.contact.address.state}
                  </p>
                  {/* <p>
                    {organization.contact.address.country} -{' '}
                    {organization.contact.address.zipCode}
                  </p> */}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone
                  className="h-5 w-5 flex-shrink-0"
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

              <div className="flex items-center space-x-3">
                <Mail
                  className="h-5 w-5 flex-shrink-0"
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
        <div className="border-t border-white/10 pt-6 sm:pt-8 text-center">
          <p
            className="text-xs sm:text-sm font-light leading-relaxed"
            style={{ color: '#9ca3af' }}
          >
            © {currentYear} {organization.name}. All rights reserved.
            <br className="sm:hidden" />
            <span className="sm:ml-2">
              {' '}
              | Established {organization.founded}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
