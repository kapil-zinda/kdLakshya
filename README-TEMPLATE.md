# Organization Website Template System

A flexible, production-ready website template system that allows you to quickly spin up professional organization websites within 15-30 minutes. Based on modern educational institution designs, this system can be easily customized for schools, colleges, institutes, and other organizations.

## Quick Start

### 1. Using the Quick Setup Function

```typescript
import { quickSetup } from '@/utils/organizationGenerator';
import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';

// Generate a complete website configuration in seconds
const organizationData = quickSetup(
  'Your Organization Name',
  'school', // or 'college', 'institute', 'university', 'organization'
  'contact@yourorg.edu',
  '+1-555-0123',
  'Your City',
  'yourorg.edu'
);

// Use the template
export default function YourSite() {
  return <OrganizationTemplate data={organizationData} />;
}
```

### 2. Custom Configuration

```typescript
import { generateOrganizationConfig } from '@/utils/organizationGenerator';

const customConfig = generateOrganizationConfig({
  name: 'SHREE LAHARI SINGH MEMO INTER COLLEGE',
  type: 'school',
  tagline: 'Excellence in Education',
  domain: 'excellence.edu',
  contact: {
    email: 'info@excellence.edu',
    phone: '+1-555-0123',
    address: {
      street: '123 Education Street',
      city: 'Learning City',
      state: 'Knowledge State',
      country: 'Education Country',
      zipCode: '12345',
    },
  },
  branding: {
    primaryColor: '#059669',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
  },
});
```

## Template Features

### Core Components

- **Header**: Responsive navigation with logo, menu, and CTA
- **Hero Section**: Eye-catching banner with customizable call-to-action buttons
- **About Section**: Mission, vision, values, and image gallery
- **Programs Section**: Showcase courses, programs, or services
- **Stats Section**: Highlight achievements and key numbers
- **News Section**: Latest updates and announcements
- **Footer**: Complete contact info, links, and social media

### Built-in Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Touch-friendly navigation
- Accessible design patterns

### Customizable Branding

- Custom color schemes
- Logo integration
- Typography consistency
- Brand-aligned styling

## File Structure

```
src/
├── types/
│   └── organization.ts          # TypeScript interfaces
├── data/
│   └── organizationTemplate.ts  # Demo data and examples
├── utils/
│   └── organizationGenerator.ts # Quick setup utilities
├── components/
│   └── template/
│       ├── OrganizationTemplate.tsx  # Main template component
│       ├── Header.tsx               # Navigation header
│       ├── Footer.tsx               # Site footer
│       ├── HeroSection.tsx          # Hero banner
│       ├── AboutSection.tsx         # About us section
│       ├── ProgramsSection.tsx      # Programs/services
│       ├── StatsSection.tsx         # Statistics display
│       └── NewsSection.tsx          # News and events
└── app/
    └── template/
        ├── page.tsx      # Default template demo
        └── demo/
            └── page.tsx  # Customized demo
```

## Available Routes

- `/template` - Default Amity Global School template
- `/template/demo` - Customized SHREE LAHARI SINGH MEMO. INTER COLLEGE GHANGHAULI, ALIGARH demo

## Organization Types

The system supports different organization types with pre-configured content:

- **school**: K-12 educational institutions
- **college**: Higher education institutions
- **university**: Large academic institutions
- **institute**: Specialized training institutes
- **organization**: General organizations

Each type comes with appropriate:

- Default programs/services
- Relevant statistics
- Suitable content structure
- Type-specific features

## Customization Guide

### 1. Update Organization Data

Edit the configuration object to match your organization's details.

### 2. Replace Images

Add your images to the `public/images/` folder:

- `logo.png` - Organization logo
- `hero-bg.jpg` - Hero section background
- `about-1.jpg, about-2.jpg, about-3.jpg` - About section images
- Program and news images as needed

### 3. Modify Color Scheme

```typescript
branding: {
  primaryColor: '#Your-Primary-Color',
  secondaryColor: '#Your-Secondary-Color',
  accentColor: '#Your-Accent-Color'
}
```

### 4. Add Custom Sections

```typescript
const customSections = [
  <YourCustomSection key="custom1" />,
  <AnotherSection key="custom2" />
];

<OrganizationTemplate data={config} customSections={customSections} />
```

## Deployment Ready

The template is designed to be deployment-ready with:

- SEO-optimized meta tags
- Social media integration
- Performance optimizations
- Accessibility compliance
- Mobile responsiveness

## Technology Stack

- **Next.js 13+** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible components
- **Lucide React** - Modern icons

## Production Checklist

Before deploying:

1. ✅ Update organization data in configuration
2. ✅ Replace placeholder images with actual content
3. ✅ Customize color scheme to match branding
4. ✅ Update contact information
5. ✅ Configure social media links
6. ✅ Set up proper domain and meta tags
7. ✅ Test responsive design on all devices
8. ✅ Verify all links and navigation
9. ✅ Optimize images for web
10. ✅ Run accessibility checks

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

## Support

For issues or questions:

1. Check the component documentation
2. Review the type definitions in `organization.ts`
3. Examine the demo implementations
4. Test with the provided examples

This system enables rapid deployment of professional organization websites while maintaining flexibility for customization and growth.
