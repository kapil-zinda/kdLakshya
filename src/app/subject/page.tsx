'use client';

import { useEffect, useState } from 'react';

import SubjectCard from '@/components/cards/subjectCard';
import { makeApiCall } from '@/utils/ApiRequest';

interface InnerSubject {
  name: string;
  id: string;
}

interface SubjectAttributes {
  name: string;
  parent: string;
  completed_page: number;
  total_page: number;
  inner_subject: InnerSubject[];
  page_array: number[];
  page_dates: string[][];
  root: string;
  id: string;
}

interface SubjectData {
  type: string;
  id: string;
  attributes: SubjectAttributes;
  links: {
    self?: string;
  };
}

export default function SubjectPage() {
  const [subject_data, setSubjectData] = useState<SubjectData[]>([]);
  const [popAddSubject, setPopAddSubject] = useState<boolean>(false);

  const [subjectName, setSubjectName] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await makeApiCall({
          path: `subject/subject?source={user_key_id}`,
          method: 'GET',
        });
        setSubjectData(result.data);
        console.log(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSubjectName(value);
  };

  const handleAddSubject = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const Payload = {
      data: {
        type: 'subject',
        attributes: {
          name: subjectName,
          parent: '{user_key_id}',
        },
      },
    };

    try {
      const result = await makeApiCall({
        path: `subject/subject`,
        method: 'POST',
        payload: Payload,
      });

      // Update subject data with the new subject
      setSubjectData((prevData) => [...prevData, result.data]);

      // Clear the input field after adding the subject
      setSubjectName('');
      setPopAddSubject(false);
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  return (
    <>
      <div className="mb-8">
        <div className="max-w-screen-xl mx-auto py-3">
          <h2 className="text-2xl font-bold tracking-tight">☺☺</h2>
          <p className="text-muted-foreground">
            Simplify your task management with ease and efficiency.
          </p>
        </div>
        <div className="max-w-screen-xl mx-auto">
          <div className="p-4 border-2 rounded-lg ">
            {subject_data.length ? (
              subject_data &&
              subject_data.map((subject_dd, index: number) => {
                return (
                  <div key={index}>
                    <SubjectCard
                      name={subject_dd.attributes.name}
                      id={String(subject_dd.id)}
                      source="subject"
                    />
                  </div>
                );
              })
            ) : (
              <span>
                You have not added any subject yet please add subjects.
              </span>
            )}

            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
              {popAddSubject ? (
                <div
                  // //aria-hidden="true"
                  className="overflow-y-auto overflow-x-hidden z-50 justify-center items-center md:inset-0 h-[calc(100%-1rem)] max-h-full"
                >
                  <div className="relative p-4 w-full max-w-md max-h-full">
                    {/* Modal content */}
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      {/* Modal header */}
                      <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          add subject
                        </h3>
                        <button
                          type="button"
                          onClick={() => setPopAddSubject(false)}
                          className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          <svg
                            className="w-3 h-3"
                            // //aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                          </svg>
                          <span className="sr-only">Close modal</span>
                        </button>
                      </div>
                      {/* Modal body */}
                      <div className="p-4 md:p-5">
                        <form className="space-y-4" onSubmit={handleAddSubject}>
                          <div>
                            <label
                              htmlFor="subb"
                              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                            >
                              Subject Name
                            </label>
                            <input
                              type="text"
                              name="subb"
                              id="subb"
                              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                              placeholder="Subject"
                              required={true}
                              value={subjectName}
                              onChange={handleChange}
                            />
                          </div>
                          <button
                            type="submit"
                            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          >
                            Add Subject
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setPopAddSubject(true)}
                  className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                >
                  Add subject
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
