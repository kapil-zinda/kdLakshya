'use client';

import { useEffect, useState } from 'react';

type SubjectTablePageProps = {
  question: any;
  total: number;
};

const subjectTablePage: React.FC<SubjectTablePageProps> = ({
  question,
  total,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [indexStartPage, setIndexStartPage] = useState<number>(0);
  const [indexEndPage, setIndexEndPage] = useState<number>(9);
  const total_pages = Math.ceil(total / 10);
  const pages_on_last = total % 10;

//   const updatedata: any = ({currentpp, modify_number}) => {
//     useEffect
//   }

  const updatedata = async (currentpp:any, modify_number:any) => {
    await setCurrentPage(currentpp + modify_number);
    await setIndexStartPage(indexStartPage + modify_number*10);
    await setIndexEndPage(total < indexEndPage + modify_number*10 ? total - 1 : indexEndPage == total -1 ? (total_pages-1)*10-1 : indexEndPage + modify_number*10)
  };

  return (
    <>
      <div className="flex flex-wrap m-12 w-auto">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Page No.
                </th>
                <th scope="col" className="px-6 py-3">
                  1st Study
                </th>
                <th scope="col" className="px-6 py-3">
                  2nd Study
                </th>
                <th scope="col" className="px-6 py-3">
                  3rd study
                </th>
              </tr>
            </thead>
            <tbody>
              {question.map((option: any, index: number) => {
                return (
                  index >= indexStartPage &&
                  index <= indexEndPage && (
                    <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white"
                      >
                        {index + 1}
                      </th>
                      <td className="px-6 py-4">
                        {option.length > 0 ? option[0] : ''}
                      </td>
                      <td className="px-6 py-4">
                        {option.length > 1 ? option[1] : ''}
                      </td>
                      <td className="px-6 py-4">
                        {option.length > 2 ? option[2] : ''}
                      </td>
                    </tr>
                  )
                );
              })}
            </tbody>
          </table>
          <nav
            className="flex items-center flex-column flex-wrap md:flex-row justify-between pt-4"
            aria-label="Table navigation"
          >
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mb-4 md:mb-0 block w-full md:inline md:w-auto">
              Showing{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {indexStartPage + 1}-{indexEndPage + 1}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {total}
              </span>
            </span>
            <ul className="inline-flex -space-x-px rtl:space-x-reverse text-sm h-8">
              {currentPage > 1 && (
                <li>
                  <a
                    href="#"
                    onClick={() => updatedata(currentPage, -1)}
                    className="flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Previous
                  </a>
                </li>
              )}
              {
                total_pages == currentPage && currentPage > 3 && (
                    <li>
                <a
                  href="#"
                  onClick={() => updatedata(currentPage, -3)}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {currentPage - 3}
                </a>
              </li>
                )
              }
              {
                currentPage > 2 && (
                    <li>
                <a
                  href="#"
                  onClick={() => updatedata(currentPage, -2)}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {currentPage - 2}
                </a>
              </li>
                )
              }

            {
                currentPage > 1 && (
                    <li>
                <a
                  href="#"
                  onClick={() => updatedata(currentPage, -1)}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {currentPage - 1}
                </a>
              </li>
                )
              }
              {
                currentPage > 0 && (
                    <li>
                <a
                  href="#"
                  className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
                >
                  {currentPage}
                </a>
              </li>
                )
              }
              
              {
                total_pages >= currentPage + 1 && (
                    <li>
                <a
                  href="#"
                  onClick={() => updatedata(currentPage, 1)}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {currentPage + 1}
                </a>
              </li>
                )
              }
              {
                total_pages >= currentPage + 2 && currentPage < 3 && (
                    <li>
                <a
                  href="#"
                  onClick={() => updatedata(currentPage, 2)}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {currentPage + 2}
                </a>
              </li>
                )
              }

            {
                total_pages >= currentPage + 3 && currentPage == 1 && (
                    <li>
                <a
                  href="#"
                  onClick={() => updatedata(currentPage, 3)}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  {currentPage + 3}
                </a>
              </li>
                )
              }
              {currentPage < total_pages && (
              <li>
                <a
                  href="#"
                  onClick={() => updatedata(currentPage, 1)}
                  className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Next
                </a>
              </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default subjectTablePage;
