"use client"
import SubjectCard from '@/components/cards/subjectCard';

import AllQuestionSpace from '../../components/roundPageView/roundPageView';
import SubjectTablePage from './table';
import { useState } from 'react';

// export const metadata: Metadata = {
//   title: "10k Hours - Task and Issue Tracker",
//   description:
//     "Efficiently manage tasks and track issues with iTasks, your dedicated task and issue tracker.",
// };

export default function SubjectPage() {
  const subjectdata = {
    id: 'subject3',
    name: 'physics',
    parent: 'subject1',
    completed_page: 5,
    total_page: 60,
    inner_subject: [{ name: 'kinetics', id: '12345' }],
    page_array: [
      3, 2, 1, 0, 1, 2, 3, 1, 2, 2, 0, 1, 2, 2, 3, 3, 2, 1, 0, 1, 2, 3, 1, 2, 2,
      0, 1, 2, 2, 3, 3, 2, 1, 0, 1, 2, 3, 1, 2, 2, 0, 1, 2, 2, 3, 3, 2, 1, 0, 1,
      2, 3, 1, 2, 2, 0, 1, 2, 2, 3,
    ],
    page_dates: [
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
      ['12', '15'],
      ['4'],
      ['7', '9', '28'],
      [],
    ],
  };

  const [gridView, setGridView] = useState<number>(0);
  return (
    <>
      <main className="mb-8">
        <div className="max-w-screen-xl mx-auto py-3">
          <h2 className="text-2xl font-bold tracking-tight">
            {subjectdata.name}
          </h2>
          <p className="text-muted-foreground">
            Simplify your task management with ease and efficiency.
          </p>
        </div>
        <div className="max-w-screen-xl mx-auto">
          <div className="p-4 border-2 rounded-lg ">
            {subjectdata.inner_subject.map((subject_dd: any, index: number) => {
              return (
                <div key={index}>
                  <SubjectCard
                    name={subject_dd.name}
                    id={String(subject_dd.id)}
                  />
                </div>
              );
            })}
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
              <button
                type="button"
                className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Add Subsubject
              </button>
            </div>
          </div>
        </div>
        <div className="border-b border-gray-200 dark:border-gray-700">
          <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
            <li className="me-2">
              <a
                href="#"
                onClick={()=>setGridView(0)}
                className={`inline-flex items-center justify-center p-4 border-b-2 ${
                  gridView ? 'border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group' : 'text-blue-600 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group'
                }`}
                aria-current="page"
              >
                <svg
                  className={`w-4 h-4 me-2 ${gridView ? 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300': 'text-blue-600 dark:text-blue-500'} `}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 18"
                >
                  <path d="M6.143 0H1.857A1.857 1.857 0 0 0 0 1.857v4.286C0 7.169.831 8 1.857 8h4.286A1.857 1.857 0 0 0 8 6.143V1.857A1.857 1.857 0 0 0 6.143 0Zm10 0h-4.286A1.857 1.857 0 0 0 10 1.857v4.286C10 7.169 10.831 8 11.857 8h4.286A1.857 1.857 0 0 0 18 6.143V1.857A1.857 1.857 0 0 0 16.143 0Zm-10 10H1.857A1.857 1.857 0 0 0 0 11.857v4.286C0 17.169.831 18 1.857 18h4.286A1.857 1.857 0 0 0 8 16.143v-4.286A1.857 1.857 0 0 0 6.143 10Zm10 0h-4.286A1.857 1.857 0 0 0 10 11.857v4.286c0 1.026.831 1.857 1.857 1.857h4.286A1.857 1.857 0 0 0 18 16.143v-4.286A1.857 1.857 0 0 0 16.143 10Z" />
                </svg>
                Grid View
              </a>
            </li>
            <li className="me-2">
              <a
                href="#"
                onClick={()=>setGridView(1)}
                className={`inline-flex items-center justify-center p-4 border-b-2 ${
                  gridView ? 'text-blue-600 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group' : 'border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group'
                }`}
              >
                <svg
                  className={`w-4 h-4 me-2 ${gridView ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'} `}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 18 20"
                >
                  <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
                </svg>
                Table View
              </a>
            </li>
          </ul>
        </div>
        {
          gridView ? (
            <SubjectTablePage
            question={subjectdata.page_dates}
            total={subjectdata.total_page}
          />
          ):
          (
            <AllQuestionSpace
            question={subjectdata.page_array}
            total={subjectdata.total_page}
          />
          )
        }
      </main>
    </>
  );
}
