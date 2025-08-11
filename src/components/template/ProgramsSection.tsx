'use client';

import { Button } from '@/components/ui/button';
import { OrganizationConfig } from '@/types/organization';
import { ArrowRight } from 'lucide-react';

interface ProgramsSectionProps {
  data: OrganizationConfig['programs'];
  branding: OrganizationConfig['branding'];
}

export function ProgramsSection({ data, branding }: ProgramsSectionProps) {
  return (
    <section
      className="py-12 sm:py-16 lg:py-20"
      style={{ backgroundColor: '#f8fafc' }}
    >
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {data.items.map((program, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2"
            >
              <div className="mb-4 sm:mb-6">
                <div
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: `${branding.primaryColor}10` }}
                >
                  <div
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg"
                    style={{ backgroundColor: branding.primaryColor }}
                  ></div>
                </div>
                <h3
                  className="text-lg sm:text-xl lg:text-2xl font-medium mb-2 sm:mb-3 group-hover:text-current transition-colors duration-300 line-clamp-2"
                  style={{ color: branding.primaryColor }}
                >
                  {program.name}
                </h3>
                <p
                  className="text-sm sm:text-base leading-relaxed font-light mb-4 sm:mb-6 line-clamp-3"
                  style={{ color: '#6b7280' }}
                >
                  {program.description}
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {program.features.slice(0, 3).map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start">
                    <div
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-2 sm:mr-3 flex-shrink-0 mt-2"
                      style={{ backgroundColor: branding.accentColor }}
                    ></div>
                    <span
                      className="text-xs sm:text-sm font-light leading-relaxed"
                      style={{ color: '#6b7280' }}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                className="w-full justify-between p-0 h-auto font-medium group-hover:translate-x-1 transition-transform duration-300 text-sm sm:text-base"
                style={{ color: branding.primaryColor }}
                onClick={() => window.open(program.link, '_self')}
              >
                Learn More
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
