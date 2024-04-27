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

  const subjects = [{id: 'subject3',
  name: 'physics',
  parent: 'subject1',
  completed_page: 5,
  total_page: 60,
  inner_subject: [{ name: 'kinetics', id: '12345' }],
  page_array: [
    3
  ],
  page_dates: [
    ['12', '15'],]}
  ]
  return (
    <>
      <main className="mb-8">
        <div className="max-w-screen-xl mx-auto py-3">
          <h2 className="text-2xl font-bold tracking-tight">
            Subjects
          </h2>
          <p className="text-muted-foreground">
            Simplify your task management with ease and efficiency.
          </p>
        </div>
        <div className="max-w-screen-xl mx-auto">
          <div className="p-4 border-2 rounded-lg ">
            {subjects.length ? (
              subjects.map((subject_dd: any, index: number) => {
                return (
                  <div key={index}>
                    <SubjectCard
                      name={subject_dd.name}
                      id={String(subject_dd.id)}
                    />
                  </div>
                );
              })
            ) : (
              <span>You have not added any subject yet please add subjects.</span>
            )}
            
            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
              <button
                type="button"
                className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
              >
                Add subject
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
