'use client';

import { OrganizationConfig } from '@/types/organization';

interface AboutSectionProps {
  data: OrganizationConfig['about'];
  branding: OrganizationConfig['branding'];
  organizationName: string;
}

export function AboutSection({ data, branding }: AboutSectionProps) {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 sm:mb-6 tracking-tight"
            style={{ color: branding.primaryColor }}
          >
            {data.title}
          </h2>
          <div
            className="w-16 sm:w-20 h-1 mx-auto mb-6 sm:mb-8 rounded-full"
            style={{ backgroundColor: branding.accentColor }}
          ></div>
          <p
            className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-sm sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed font-light px-4 sm:px-0"
            style={{ color: '#6b7280' }}
          >
            {data.content}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mb-12 sm:mb-16 lg:mb-20">
          <div className="text-center group px-4 sm:px-6">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: `${branding.primaryColor}10` }}
            >
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full"
                style={{ backgroundColor: branding.primaryColor }}
              ></div>
            </div>
            <h3
              className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4"
              style={{ color: branding.primaryColor }}
            >
              Our Mission
            </h3>
            <p
              className="text-sm sm:text-base leading-relaxed font-light"
              style={{ color: '#6b7280' }}
            >
              {data.mission}
            </p>
          </div>

          <div className="text-center group px-4 sm:px-6">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: `${branding.secondaryColor}10` }}
            >
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full"
                style={{ backgroundColor: branding.secondaryColor }}
              ></div>
            </div>
            <h3
              className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4"
              style={{ color: branding.primaryColor }}
            >
              Our Vision
            </h3>
            <p
              className="text-sm sm:text-base leading-relaxed font-light"
              style={{ color: '#6b7280' }}
            >
              {data.vision}
            </p>
          </div>

          <div className="text-center group px-4 sm:px-6 md:col-span-1">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-4 sm:mb-6 rounded-full flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300"
              style={{ backgroundColor: `${branding.accentColor}10` }}
            >
              <div
                className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full"
                style={{ backgroundColor: branding.accentColor }}
              ></div>
            </div>
            <h3
              className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4"
              style={{ color: branding.primaryColor }}
            >
              Our Values
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {data.values.slice(0, 3).map((value, index) => (
                <p
                  key={index}
                  className="text-xs sm:text-sm lg:text-base leading-relaxed font-light"
                  style={{ color: '#6b7280' }}
                >
                  {value}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
