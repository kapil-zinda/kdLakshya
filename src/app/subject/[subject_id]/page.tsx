'use client';

import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';

import SubjectCard from '@/components/cards/subjectCard';
import AllQuestionSpace from '@/components/roundPageView/roundPageView';
import axios from 'axios';

import SubjectTablePage from '../table';

const BaseURL = process.env.BaseURL;
export default function SubjectPage() {
  const params = useParams();
  const subject_id = String(params?.subject_id);

  const [gridView, setGridView] = useState<number>(0);
  const [popAddSubject, setPopAddSubject] = useState<boolean>(false);
  const [addPageToSubject, setAddPageToSubject] = useState<boolean>(false);
  const [updateSubjectPage, setUpdateSubjectPage] = useState<boolean>(false);
  const [subject_data, setSubjectData] = useState<any>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(BaseURL + 'subject/' + subject_id);
        setSubjectData(res.data.data.attributes);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const [subjectPageToAdd, setSubjectPageToAdd] = useState<number>(0);
  const handleSubjectPageChange = (e: any) => {
    const { value } = e.target;
    setSubjectPageToAdd(value);
  };

  const handleAddPageToSubject = async (event: any) => {
    event.preventDefault();
    const Payload = {
      data: {
        type: 'time-table',
        attributes: {
          total: subjectPageToAdd,
        },
      },
    };
    const res = await axios.patch(
      BaseURL + 'subject/' + subject_id + '/add-page',
      Payload,
    );
    setSubjectData(res.data.data.attributes);
    // Clear the input field after adding the subject
    setSubjectPageToAdd(0);
    setAddPageToSubject(false);
  };

  const [subjectUpdatePageStart, setSubjectUpdatePageStart] =
    useState<number>(0);
  const handleSubjectUpdateStartChange = (e: any) => {
    const { value } = e.target;
    setSubjectUpdatePageStart(value);
  };

  const [subjectUpdatePageEnd, setSubjectUpdatePageEnd] = useState<number>(0);
  const handleSubjectUpdateEndChange = (e: any) => {
    const { value } = e.target;
    setSubjectUpdatePageEnd(value);
  };

  const handleUpdateSubjectPage = async (event: any) => {
    event.preventDefault();

    if (
      Number(subjectUpdatePageStart) &&
      Number(subjectUpdatePageEnd) &&
      Number(subjectUpdatePageStart) <= Number(subjectUpdatePageEnd)
    ) {
      const Payload = {
        data: {
          type: 'time-table',
          attributes: {
            start: Number(subjectUpdatePageStart),
            last: Number(subjectUpdatePageEnd),
          },
        },
      };
      const res = await axios.patch(BaseURL + 'subject/' + subject_id, Payload);
      setSubjectData(res.data.data.attributes);
      setSubjectUpdatePageEnd(0);
      setSubjectUpdatePageStart(0);
    }
    setUpdateSubjectPage(false);
  };

  const [subjectName, setSubjectName] = useState<string>('');
  const handleChange = (e: any) => {
    const { value } = e.target;
    setSubjectName(value);
  };
  const handleAddSubject = async (event: any) => {
    event.preventDefault();
    const Payload = {
      data: {
        type: 'time-table',
        attributes: {
          name: subjectName,
          parent: subject_id,
        },
      },
    };
    await axios.post(BaseURL + 'subject', Payload);
    const resp = await axios.get(BaseURL + 'subject/' + subject_id);
    setSubjectData(resp.data.data.attributes);
    // Clear the input field after adding the subject
    setSubjectName('');
    setPopAddSubject(false);
  };

  return (
    <>
      {subject_data.name && (
        <main className="mb-8">
          <div className="max-w-screen-xl mx-auto py-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {subject_data.name}
            </h2>
            <p className="text-muted-foreground">
              Simplify your task management with ease and efficiency.
            </p>
          </div>
          <div className="max-w-screen-xl mx-auto">
            <div className="p-4 border-2 rounded-lg ">
              {subject_data.inner_subject.map(
                (subject_dd: any, index: number) => {
                  return (
                    <div key={index}>
                      <SubjectCard
                        name={subject_dd.name}
                        id={String(subject_dd.id)}
                      />
                    </div>
                  );
                },
              )}
              <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
                {popAddSubject ? (
                  <div
                    //aria-hidden="true"
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
                              //aria-hidden="true"
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
                          <form
                            className="space-y-4"
                            onSubmit={handleAddSubject}
                          >
                            <div>
                              <label
                                htmlFor="subb"
                                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                              >
                                subject name
                              </label>
                              <input
                                type="text"
                                name="subb"
                                id="subb"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                placeholder="subject"
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
                    Add subSubject
                  </button>
                )}
              </div>
            </div>
          </div>

          {subject_data.total_page ? (
            <>
              <div className="border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500 dark:text-gray-400">
                  <li className="me-2">
                    <a
                      href="#"
                      onClick={() => setGridView(0)}
                      className={`inline-flex items-center justify-center p-4 border-b-2 ${
                        gridView
                          ? 'border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group'
                          : 'text-blue-600 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group'
                      }`}
                      aria-current="page"
                    >
                      <svg
                        className={`w-4 h-4 me-2 ${
                          gridView
                            ? 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                            : 'text-blue-600 dark:text-blue-500'
                        } `}
                        //aria-hidden="true"
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
                      onClick={() => setGridView(1)}
                      className={`inline-flex items-center justify-center p-4 border-b-2 ${
                        gridView
                          ? 'text-blue-600 border-blue-600 rounded-t-lg active dark:text-blue-500 dark:border-blue-500 group'
                          : 'border-transparent rounded-t-lg hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300 group'
                      }`}
                    >
                      <svg
                        className={`w-4 h-4 me-2 ${
                          gridView
                            ? 'text-blue-600 dark:text-blue-500'
                            : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-300'
                        } `}
                        //aria-hidden="true"
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
              <div className="flex flex-wrap">
                <div className="grow">
                  {addPageToSubject ? (
                    <div
                      //aria-hidden="true"
                      className="overflow-y-auto overflow-x-hidden z-50 justify-center items-center md:inset-0 h-[calc(100%-1rem)] max-h-full"
                    >
                      <div className="relative p-4 w-full max-w-md max-h-full">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                          <form className="" onSubmit={handleAddPageToSubject}>
                            <div className="flex items-center justify-between md:p-1 border-b rounded-t dark:border-gray-600">
                              <input
                                type="number"
                                name="pagg"
                                id="pagg"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                placeholder="pages"
                                required={true}
                                value={subjectPageToAdd}
                                onChange={handleSubjectPageChange}
                              />
                              <button
                                type="submit"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={() => setAddPageToSubject(false)}
                                className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                              >
                                <svg
                                  className="w-3 h-3"
                                  //aria-hidden="true"
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
                          </form>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddPageToSubject(true)}
                      className="text-white bg-gradient-to-r m-4 from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                      Add Pages
                    </button>
                  )}
                </div>
                <div>
                  {updateSubjectPage ? (
                    <div
                      //aria-hidden="true"
                      className="overflow-y-auto overflow-x-hidden z-50 justify-center items-center md:inset-0 h-[calc(100%-1rem)] max-h-full"
                    >
                      <div className="relative p-4 w-full max-w-md max-h-full">
                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                          <form className="" onSubmit={handleUpdateSubjectPage}>
                            <div className="flex items-center justify-between md:p-1 border-b rounded-t dark:border-gray-600">
                              <input
                                type="number"
                                name="paggs"
                                id="paggs"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                placeholder="pages"
                                required={true}
                                value={subjectUpdatePageStart}
                                onChange={handleSubjectUpdateStartChange}
                              />
                              <span>to</span>
                              <input
                                type="number"
                                name="pagge"
                                id="pagge"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                placeholder="pages"
                                required={true}
                                value={subjectUpdatePageEnd}
                                onChange={handleSubjectUpdateEndChange}
                              />
                              <button
                                type="submit"
                                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                              >
                                Update
                              </button>
                              <button
                                type="button"
                                onClick={() => setUpdateSubjectPage(false)}
                                className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                              >
                                <svg
                                  className="w-3 h-3"
                                  //aria-hidden="true"
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
                          </form>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setUpdateSubjectPage(true)}
                      className="text-white bg-gradient-to-r m-4 from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >
                      Update Page
                    </button>
                  )}
                </div>
              </div>
              {gridView ? (
                <SubjectTablePage
                  question={subject_data.page_dates}
                  total={subject_data.total_page}
                />
              ) : (
                <AllQuestionSpace
                  question={subject_data.page_array}
                  total={subject_data.total_page}
                />
              )}
            </>
          ) : (
            <>
              {addPageToSubject ? (
                <div
                  //aria-hidden="true"
                  className="overflow-y-auto overflow-x-hidden z-50 justify-center items-center md:inset-0 h-[calc(100%-1rem)] max-h-full"
                >
                  <div className="relative p-4 w-full max-w-md max-h-full">
                    <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                      <form className="" onSubmit={handleAddPageToSubject}>
                        <div className="flex items-center justify-between md:p-1 border-b rounded-t dark:border-gray-600">
                          <input
                            type="number"
                            name="pagg"
                            id="pagg"
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-auto p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                            placeholder="pages"
                            required={true}
                            value={subjectPageToAdd}
                            onChange={handleSubjectPageChange}
                          />
                          <button
                            type="submit"
                            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddPageToSubject(false)}
                            className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            <svg
                              className="w-3 h-3"
                              //aria-hidden="true"
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
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAddPageToSubject(true)}
                    className="text-white grow bg-gradient-to-r m-4 from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg shadow-purple-500/50 dark:shadow-lg dark:shadow-purple-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                  >
                    Add Pages
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      )}
    </>
  );
}
