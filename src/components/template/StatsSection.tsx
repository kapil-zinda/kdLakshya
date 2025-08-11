'use client';

import { useEffect, useState } from 'react';

import { OrganizationConfig } from '@/types/organization';

interface StatsSectionProps {
  data: OrganizationConfig['stats'];
  branding: OrganizationConfig['branding'];
}

export function StatsSection({ data, branding }: StatsSectionProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    const section = document.getElementById('stats-section');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="stats-section"
      className="py-12 sm:py-16 lg:py-20 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor}f8, ${branding.secondaryColor}f8)`,
      }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-12 -right-12 sm:-top-24 sm:-right-24 w-48 h-48 sm:w-96 sm:h-96 rounded-full"
          style={{ backgroundColor: `${branding.accentColor}10` }}
        ></div>
        <div
          className="absolute -bottom-12 -left-12 sm:-bottom-24 sm:-left-24 w-48 h-48 sm:w-96 sm:h-96 rounded-full"
          style={{ backgroundColor: `${branding.primaryColor}10` }}
        ></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light mb-4 sm:mb-6 tracking-tight text-white">
            {data.title}
          </h2>
          <div
            className="w-16 sm:w-20 h-1 mx-auto rounded-full"
            style={{ backgroundColor: branding.accentColor }}
          ></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
          {data.items.map((stat, index) => (
            <div
              key={index}
              className={`text-center p-4 sm:p-5 lg:p-6 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 ${
                isVisible ? 'animate-fade-in-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {stat.icon && (
                <div className="text-xl sm:text-2xl lg:text-3xl mb-2 sm:mb-3 opacity-80">
                  {stat.icon}
                </div>
              )}
              <div className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light mb-1 sm:mb-2 text-white">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm lg:text-base font-light text-white/80 leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
