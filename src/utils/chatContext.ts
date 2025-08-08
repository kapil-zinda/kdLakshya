export interface ChatContext {
  platform?: string;
  organization?: string;
  location?: string;
  supportType?: string;
  features?: string[];
  currentPage?: string;
  userRole?: 'student' | 'teacher' | 'admin' | 'guest';
  userData?: {
    name?: string;
    id?: string;
    class?: string;
    subjects?: string[];
  };
  academicData?: {
    currentSemester?: string;
    currentSubjects?: string[];
    upcomingExams?: string[];
    assignments?: string[];
  };
}

export function generateChatContext(options: {
  currentPath?: string;
  userRole?: string;
  userData?: any;
  academicData?: any;
}): ChatContext {
  const { currentPath, userRole, userData, academicData } = options;

  const baseContext: ChatContext = {
    platform: 'Educational Management Platform',
    organization: 'SHREE LAHARI SINGH MEMO. INTER COLLEGE',
    location: 'GHANGHAULI, ALIGARH',
    supportType: 'Academic Support Assistant',
    features: [
      'Academic support and guidance',
      'Assignment help and deadlines',
      'Study tips and learning strategies',
      'Platform navigation assistance',
      'Exam preparation guidance',
      'General academic queries',
    ],
  };

  // Add page-specific context
  if (currentPath) {
    baseContext.currentPage = currentPath;

    if (currentPath.includes('/student')) {
      baseContext.supportType = 'Student Support Assistant';
    } else if (currentPath.includes('/teacher')) {
      baseContext.supportType = 'Teacher Support Assistant';
    } else if (currentPath.includes('/admin')) {
      baseContext.supportType = 'Admin Support Assistant';
    }
  }

  // Add user role
  if (userRole) {
    baseContext.userRole = userRole as any;
  }

  // Add user-specific data
  if (userData) {
    baseContext.userData = {
      name: userData.name,
      id: userData.id,
      class: userData.class,
      subjects: userData.subjects || [],
    };
  }

  // Add academic context
  if (academicData) {
    baseContext.academicData = {
      currentSemester: academicData.currentSemester,
      currentSubjects: academicData.currentSubjects || [],
      upcomingExams: academicData.upcomingExams || [],
      assignments: academicData.assignments || [],
    };
  }

  return baseContext;
}

export function getRelevantContext(
  fullContext: ChatContext,
  userMessage: string,
): any {
  const message = userMessage.toLowerCase();

  // Determine what context is relevant based on the user's question
  const relevantContext: any = {
    platform: fullContext.platform,
    supportType: fullContext.supportType,
  };

  // Academic-related queries
  if (
    message.includes('exam') ||
    message.includes('test') ||
    message.includes('grade')
  ) {
    if (fullContext.academicData?.upcomingExams) {
      relevantContext.upcomingExams = fullContext.academicData.upcomingExams;
    }
  }

  // Assignment-related queries
  if (
    message.includes('assignment') ||
    message.includes('homework') ||
    message.includes('deadline')
  ) {
    if (fullContext.academicData?.assignments) {
      relevantContext.assignments = fullContext.academicData.assignments;
    }
  }

  // Subject-related queries
  if (message.includes('subject') || message.includes('course')) {
    if (fullContext.academicData?.currentSubjects) {
      relevantContext.currentSubjects =
        fullContext.academicData.currentSubjects;
    }
  }

  // User-specific queries
  if (message.includes('my') || message.includes('me')) {
    if (fullContext.userData) {
      relevantContext.userData = fullContext.userData;
    }
  }

  // Organization queries
  if (
    message.includes('school') ||
    message.includes('college') ||
    message.includes('organization')
  ) {
    relevantContext.organization = fullContext.organization;
    relevantContext.location = fullContext.location;
  }

  return relevantContext;
}
