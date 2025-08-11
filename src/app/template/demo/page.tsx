'use client';

import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';
import { quickSetup } from '@/utils/organizationGenerator';

export default function DemoPage() {
  // Quick demo setup - you can easily change these values
  const demoConfig = quickSetup(
    'SHREE LAHARI SINGH MEMO. INTER COLLEGE',
    'school',
    'info@excellenceacademy.edu',
    '+1-555-0123',
    'New York',
    'excellenceacademy.edu',
  );

  // Override some specific values for demo
  const customizedConfig = {
    ...demoConfig,
    branding: {
      ...demoConfig.branding,
      primaryColor: '#059669', // Emerald
      secondaryColor: '#10B981',
      accentColor: '#F59E0B', // Amber
    },
    hero: {
      ...demoConfig.hero,
      title:
        'SHREE LAHARI SINGH MEMO. INTER COLLEGE GHANGHAULI, ALIGARH - Where Dreams Take Flight',
      subtitle:
        "Nurturing tomorrow's leaders through innovative education and character building",
      backgroundImage:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    },
  };

  return <OrganizationTemplate data={customizedConfig} />;
}
