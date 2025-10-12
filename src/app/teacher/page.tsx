'use client';

import React, { useEffect, useState } from 'react';

import { UserData, userData } from '@/app/interfaces/userInterface';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';

const TemplateTeacherDashboardPage = () => {
  const [userDatas] = useState<UserData>(userData);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate loading and then show dashboard
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Template color scheme override */}
      <style jsx global>{`
        /* Override existing dashboard colors with template colors */
        .bg-blue-500 {
          background-color: #059669 !important; /* Template primary color */
        }
        .bg-blue-600 {
          background-color: #047857 !important; /* Darker template primary */
        }
        .hover\\:bg-blue-700:hover {
          background-color: #065f46 !important; /* Even darker on hover */
        }
        .bg-green-500 {
          background-color: #f59e0b !important; /* Template accent color */
        }
        .bg-green-600 {
          background-color: #d97706 !important; /* Darker accent */
        }
        .hover\\:bg-green-700:hover {
          background-color: #b45309 !important; /* Even darker accent on hover */
        }
        .bg-yellow-600 {
          background-color: #10b981 !important; /* Template secondary color */
        }
        .hover\\:bg-yellow-700:hover {
          background-color: #059669 !important; /* Darker secondary on hover */
        }
        .bg-purple-600 {
          background-color: #6b7280 !important; /* Neutral gray */
        }
        .hover\\:bg-purple-700:hover {
          background-color: #4b5563 !important; /* Darker gray on hover */
        }

        /* Override background to white instead of dark */
        .bg-gray-800 {
          background-color: white !important;
          color: #111827 !important;
          border: 1px solid #e5e7eb !important;
        }
        .bg-gray-700 {
          background-color: #f9fafb !important;
          color: #111827 !important;
          border: 1px solid #e5e7eb !important;
        }
        /* Override all white text to dark gray for better contrast */
        .text-white {
          color: #111827 !important;
        }

        /* Exception: Keep white text on colored button backgrounds */
        button.bg-blue-500,
        button.bg-green-500,
        button.bg-yellow-600,
        button.bg-purple-600,
        button.bg-blue-600,
        button.bg-green-600,
        button.bg-yellow-700,
        button.bg-purple-700,
        .bg-blue-500 button,
        .bg-green-500 button,
        .bg-yellow-600 button,
        .bg-purple-600 button {
          color: white !important;
        }

        .text-gray-200 {
          color: #374151 !important;
        }
        .text-gray-300 {
          color: #6b7280 !important;
        }
        .text-gray-400 {
          color: #6b7280 !important;
        }
        .hover\\:text-gray-300:hover {
          color: #4b5563 !important;
        }

        /* Fix table and content text specifically */
        table .text-white,
        td .text-white,
        th .text-white,
        p .text-white,
        span .text-white,
        div .text-white {
          color: #111827 !important;
        }
        .hover\\:bg-gray-700:hover {
          background-color: #e5e7eb !important;
        }
        .border-gray-700 {
          border-color: #e5e7eb !important;
        }

        /* Fix chart backgrounds */
        .recharts-surface {
          background-color: transparent !important;
        }

        /* Tab styling overrides */
        .text-blue-500 {
          color: #059669 !important; /* Template primary color for active tabs */
        }

        /* Ensure main container styling */
        .font-sans {
          background-color: white !important;
        }

        /* Hide print-only content from web view - More specific selectors */
        .print-only,
        div.print-only,
        .print\\:block,
        .print\\:inline,
        .print\\:inline-block,
        .print\\:table,
        .print\\:table-row,
        .print\\:table-cell {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
          position: absolute !important;
          left: -9999px !important;
        }

        /* Show print-only content only when printing */
        @media print {
          .print-only,
          div.print-only,
          .print\\:block {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            width: auto !important;
            overflow: visible !important;
            position: static !important;
            left: auto !important;
          }
          .print\\:inline {
            display: inline !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .print\\:inline-block {
            display: inline-block !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .print\\:table {
            display: table !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .print\\:table-row {
            display: table-row !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
          .print\\:table-cell {
            display: table-cell !important;
            visibility: visible !important;
            opacity: 1 !important;
          }
        }

        /* FINAL OVERRIDE - Hide print-only content with maximum specificity */
        @media screen {
          * .print-only,
          *[class*='print-only'],
          div[class='print-only'] {
            display: none !important;
          }
        }

        /* Fix calendar and other dark elements */
        .bg-gray-900 {
          background-color: #f3f4f6 !important;
          color: #111827 !important;
        }
        .text-gray-100 {
          color: #374151 !important;
        }
        .text-gray-50 {
          color: #111827 !important;
        }

        /* Print media - ensure print content shows and has proper colors */
        @media print {
          * .print-only,
          *[class*='print-only'],
          div[class='print-only'] {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            width: auto !important;
            overflow: visible !important;
            position: static !important;
            left: auto !important;
          }

          /* Ensure all print text is black */
          .print-only * {
            color: black !important;
            background-color: white !important;
          }
        }
      `}</style>

      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">
          Teacher Dashboard
        </h1>
        <TeacherDashboard userData={userDatas} />
      </div>
    </div>
  );
};

export default TemplateTeacherDashboardPage;
