'use client';

import React from 'react';

import { dummyStudentMarks } from '@/data/studentDashboardDummyData';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

// Add global styles for print media
const printStyles = `
  @media print {
    /* Hide UI elements */
    .no-print {
      display: none !important;
    }

    /* Show only print content */
    .print-only {
      display: block !important;
      padding: 20px !important;
      margin: 0 !important;
      width: 100% !important;
      background: white !important;
    }

    /* Reset colors for printing */
    .print-only * {
      color: black !important;
      background: white !important;
      border-color: black !important;
    }

    /* Ensure tables print properly */
    table {
      width: 100% !important;
      border-collapse: collapse !important;
    }

    th, td {
      border: 1px solid black !important;
      padding: 8px !important;
      text-align: left !important;
    }

    /* Hide specific UI elements */
    nav, 
    header,
    footer,
    .sidebar,
    .navigation,
    button,
    select {
      display: none !important;
    }

    /* Reset page margins */
    @page {
      margin: 2cm;
    }

    /* Ensure text is readable */
    body {
      background: white !important;
      color: black !important;
    }
  }
`;

const StudentResults: React.FC = () => {
  // Get all exam results
  const results = dummyStudentMarks;

  // Prepare trend data
  const trendData = results.map((result) => ({
    name: result.examName,
    percentage: result.percentage,
  }));

  // Prepare subject-wise comparison data
  const subjectNames = results[0].subjects.map((subject) => subject.name);
  const subjectComparisonData = subjectNames.map((subjectName) => {
    const data: { name: string; [key: string]: any } = { name: subjectName };

    results.forEach((result) => {
      const subject = result.subjects.find((s) => s.name === subjectName);
      if (subject) {
        // Use a shortened exam name as the key
        const shortExamName = result.examName.split(' ')[0];
        data[shortExamName] = subject.obtainedMarks;
      }
    });

    return data;
  });

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Add print styles */}
      <style>{printStyles}</style>

      {/* UI Controls - Hidden during print */}
      <div className="no-print">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Academic Results</h2>
          <Button onClick={handlePrint}>Print</Button>
        </div>

        {/* Results Summary */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Results Summary</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-white">Examination</TableHead>
                  <TableHead className="text-white text-right">
                    Total Marks
                  </TableHead>
                  <TableHead className="text-white text-right">
                    Obtained Marks
                  </TableHead>
                  <TableHead className="text-white text-right">
                    Percentage
                  </TableHead>
                  <TableHead className="text-white text-right">Grade</TableHead>
                  <TableHead className="text-white text-right">Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.examId}>
                    <TableCell className="font-medium text-white">
                      {result.examName}
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {result.totalMarks}
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {result.totalObtained}
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {result.percentage.toFixed(2)}%
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {result.grade}
                    </TableCell>
                    <TableCell className="text-right text-white">
                      {result.rank}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={trendData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'white' }} />
              <YAxis
                tick={{ fill: 'white' }}
                domain={[0, 100]}
                label={{
                  value: 'Percentage',
                  angle: -90,
                  position: 'insideLeft',
                  fill: 'white',
                }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject-wise Comparison */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">
            Subject-wise Comparison
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={subjectComparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fill: 'white' }} />
              <YAxis tick={{ fill: 'white' }} />
              <Tooltip />
              <Legend />
              {results.map((result, index) => (
                <Bar
                  key={result.examId}
                  dataKey={result.examName.split(' ')[0]}
                  fill={`hsl(${index * 60}, 70%, 50%)`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Results */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Detailed Results</h3>
          {results.map((result) => (
            <div key={result.examId} className="mb-8 last:mb-0">
              <h4 className="text-lg font-medium mb-3">{result.examName}</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-white">Subject</TableHead>
                      <TableHead className="text-white text-right">
                        Total Marks
                      </TableHead>
                      <TableHead className="text-white text-right">
                        Obtained Marks
                      </TableHead>
                      <TableHead className="text-white text-right">
                        Percentage
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium text-white">
                          {subject.name}
                        </TableCell>
                        <TableCell className="text-right text-white">
                          {subject.maxMarks}
                        </TableCell>
                        <TableCell className="text-right text-white">
                          {subject.obtainedMarks}
                        </TableCell>
                        <TableCell className="text-right text-white">
                          {(
                            (subject.obtainedMarks / subject.maxMarks) *
                            100
                          ).toFixed(2)}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-gray-700">
                      <TableCell className="font-bold text-white">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold text-white">
                        {result.totalMarks}
                      </TableCell>
                      <TableCell className="text-right font-bold text-white">
                        {result.totalObtained}
                      </TableCell>
                      <TableCell className="text-right font-bold text-white">
                        {result.percentage.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h5 className="text-sm font-medium mb-1">Grade</h5>
                  <p className="text-xl font-bold">{result.grade}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h5 className="text-sm font-medium mb-1">Percentage</h5>
                  <p className="text-xl font-bold">
                    {result.percentage.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                  <h5 className="text-sm font-medium mb-1">Rank</h5>
                  <p className="text-xl font-bold">{result.rank}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print-only content */}
      <div className="print-only">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-black">
            SHREE LAHARI SINGH MEMO. INTER COLLEGE GHANGHAULI, ALIGARH
          </h1>
          <p className="text-black">Phone No. 9897470696</p>
          <h2 className="text-xl font-bold mt-4 text-black">
            Academic Results - 2022-2023
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-black">
              <strong>Name:</strong> Rahul Kumar
            </p>
            <p className="text-black">
              <strong>{"Father's Name:"}</strong> Nanak Chand
            </p>
            <p className="text-black">
              <strong>{"Mother's Name:"}</strong> Savitri Devi
            </p>
            <p className="text-black">
              <strong>Address:</strong> Chandpur Khurd, Mant, Mathura
            </p>
          </div>
          <div>
            <p className="text-black">
              <strong>Roll No:</strong> 2211136
            </p>
            <p className="text-black">
              <strong>Class:</strong> 11
            </p>
            <p className="text-black">
              <strong>S.R.No.:</strong> 2316
            </p>
            <p className="text-black">
              <strong>D.O.B.:</strong> 01/01/2008
            </p>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 text-black">Results Summary</h3>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr>
                <th className="border border-black p-2 text-black">
                  Examination
                </th>
                <th className="border border-black p-2 text-black">
                  Total Marks
                </th>
                <th className="border border-black p-2 text-black">
                  Obtained Marks
                </th>
                <th className="border border-black p-2 text-black">
                  Percentage
                </th>
                <th className="border border-black p-2 text-black">Grade</th>
                <th className="border border-black p-2 text-black">Rank</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.examId}>
                  <td className="border border-black p-2 text-black">
                    {result.examName}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {result.totalMarks}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {result.totalObtained}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {result.percentage.toFixed(2)}%
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {result.grade}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {result.rank}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detailed Results */}
        {results.map((result) => (
          <div key={result.examId} className="mb-8 last:mb-0">
            <h3 className="text-lg font-bold mb-2 text-black">
              {result.examName} - Detailed Results
            </h3>
            <table className="w-full border-collapse border border-black">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-black">
                    Subject
                  </th>
                  <th className="border border-black p-2 text-black">
                    Total Marks
                  </th>
                  <th className="border border-black p-2 text-black">
                    Obtained Marks
                  </th>
                  <th className="border border-black p-2 text-black">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.subjects.map((subject) => (
                  <tr key={subject.id}>
                    <td className="border border-black p-2 text-black">
                      {subject.name}
                    </td>
                    <td className="border border-black p-2 text-center text-black">
                      {subject.maxMarks}
                    </td>
                    <td className="border border-black p-2 text-center text-black">
                      {subject.obtainedMarks}
                    </td>
                    <td className="border border-black p-2 text-center text-black">
                      {(
                        (subject.obtainedMarks / subject.maxMarks) *
                        100
                      ).toFixed(2)}
                      %
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="border border-black p-2 font-bold text-black">
                    Total
                  </td>
                  <td className="border border-black p-2 text-center font-bold text-black">
                    {result.totalMarks}
                  </td>
                  <td className="border border-black p-2 text-center font-bold text-black">
                    {result.totalObtained}
                  </td>
                  <td className="border border-black p-2 text-center font-bold text-black">
                    {result.percentage.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4 mt-12">
          <div className="text-center">
            <p className="text-black">Sig. of Class Teacher</p>
          </div>
          <div className="text-center">
            <p className="text-black">Sig. of Principal</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;
