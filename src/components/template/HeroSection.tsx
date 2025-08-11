'use client';

import { Button } from '@/components/ui/button';
import { OrganizationConfig } from '@/types/organization';

interface HeroSectionProps {
  data: OrganizationConfig['hero'];
  branding: OrganizationConfig['branding'];
}

export function HeroSection({ data, branding }: HeroSectionProps) {
  return (
    <section
      className="relative min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh] flex items-center justify-center text-white overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor}f0, ${branding.secondaryColor}f0), url(${data.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay',
      }}
    >
      {/* Floating elements for visual interest */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-white/5 rounded-full blur-2xl sm:blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 sm:-bottom-40 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-white/5 rounded-full blur-2xl sm:blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 max-w-5xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light mb-4 sm:mb-6 leading-tight tracking-tight">
          {data.title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 lg:mb-10 max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto font-light opacity-95 leading-relaxed px-4 sm:px-0">
          {data.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
          <Button
            size="lg"
            className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white hover:text-gray-900 font-medium rounded-full shadow-lg transition-all duration-300"
            onClick={() => window.open(data.ctaButtons.primary.link, '_self')}
          >
            {data.ctaButtons.primary.text}
          </Button>

          {data.ctaButtons.secondary && (
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 lg:px-10 py-3 sm:py-4 border-white/30 text-black hover:bg-white/10 backdrop-blur-sm font-medium rounded-full transition-all duration-300"
              onClick={() =>
                data.ctaButtons.secondary?.link &&
                window.open(data.ctaButtons.secondary.link, '_self')
              }
            >
              {data.ctaButtons.secondary?.text}
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
