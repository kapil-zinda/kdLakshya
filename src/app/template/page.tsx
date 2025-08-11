'use client';

import { OrganizationTemplate } from '@/components/template/OrganizationTemplate';
import { demoOrganizationData } from '@/data/organizationTemplate';

export default function TemplatePage() {
  return <OrganizationTemplate data={demoOrganizationData} />;
}
