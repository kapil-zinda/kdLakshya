'use client';

import React, { useState } from 'react';

import { dummyStudentMarks } from '@/data/studentDashboardDummyData';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const StudentMarks: React.FC = () => {
  const [selectedExam, setSelectedExam] = useState<string>(
    dummyStudentMarks[0].examId,
  );

  // Get the selected exam data
  const examData = dummyStudentMarks.find(
    (exam) => exam.examId === selectedExam,
  );

  // Prepare chart data
  const chartData = examData?.subjects.map((subject) => ({
    name: subject.name,
    obtained: subject.obtainedMarks,
    max: subject.maxMarks,
  }));

  // Function to handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mark Sheet</h2>
        <div className="flex items-center gap-4">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Exam" />
            </SelectTrigger>
            <SelectContent>
              {dummyStudentMarks.map((exam) => (
                <SelectItem key={exam.examId} value={exam.examId}>
                  {exam.examName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handlePrint}>Print</Button>
        </div>
      </div>

      {examData && (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">{examData.examName}</h3>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Subject</TableHead>
                    <TableHead className="text-white text-right">
                      Max Marks
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
                  {examData.subjects.map((subject) => (
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
                      {examData.totalMarks}
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {examData.totalObtained}
                    </TableCell>
                    <TableCell className="text-right font-bold text-white">
                      {examData.percentage.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2">Grade</h4>
                <p className="text-3xl font-bold">{examData.grade}</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2">Percentage</h4>
                <p className="text-3xl font-bold">
                  {examData.percentage.toFixed(2)}%
                </p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-2">Rank</h4>
                <p className="text-3xl font-bold">{examData.rank}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Performance Chart</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: 'white' }} />
                <YAxis tick={{ fill: 'white' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="obtained" name="Obtained Marks" fill="#8884d8" />
                <Bar dataKey="max" name="Maximum Marks" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="print-section bg-white text-black p-8 hidden print:block">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">
                SHREE LAHARI SINGH MEMO. INTER COLLEGE GHANGHAULI, ALIGARH
              </h1>
              <p>Phone No. 9897470696</p>
              <h2 className="text-xl font-bold mt-4">
                Progress Report - 2022-2023
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p>
                  <strong>Name:</strong> Rahul Kumar
                </p>
                <p>
                  <strong>{"Father's Name:"}</strong> Nanak Chand
                </p>
                <p>
                  <strong>{"Mother's Name:"}</strong> Savitri Devi
                </p>
                <p>
                  <strong>Address:</strong> Chandpur Khurd, Mant, Mathura
                </p>
              </div>
              <div>
                <p>
                  <strong>Roll No:</strong> 2211136
                </p>
                <p>
                  <strong>Class:</strong> 11
                </p>
                <p>
                  <strong>S.R.No.:</strong> 2316
                </p>
                <p>
                  <strong>D.O.B.:</strong> 01/01/2008
                </p>
              </div>
            </div>

            <table className="w-full border-collapse border border-gray-800 mb-6">
              <thead>
                <tr>
                  <th className="border border-gray-800 p-2">S.N.</th>
                  <th className="border border-gray-800 p-2">Subject</th>
                  <th className="border border-gray-800 p-2">Max Marks</th>
                  <th className="border border-gray-800 p-2">Obtain Marks</th>
                </tr>
              </thead>
              <tbody>
                {examData.subjects.map((subject, index) => (
                  <tr key={subject.id}>
                    <td className="border border-gray-800 p-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border border-gray-800 p-2">
                      {subject.name}
                    </td>
                    <td className="border border-gray-800 p-2 text-center">
                      {subject.maxMarks}
                    </td>
                    <td className="border border-gray-800 p-2 text-center">
                      {subject.obtainedMarks}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td
                    colSpan={2}
                    className="border border-gray-800 p-2 text-center font-bold"
                  >
                    Total
                  </td>
                  <td className="border border-gray-800 p-2 text-center font-bold">
                    {examData.totalMarks}
                  </td>
                  <td className="border border-gray-800 p-2 text-center font-bold">
                    {examData.totalObtained}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p>
                  <strong>Result:</strong> Passed
                </p>
              </div>
              <div>
                <p>
                  <strong>Division:</strong> First
                </p>
              </div>
              <div>
                <p>
                  <strong>Percentage of Marks:</strong>{' '}
                  {examData.percentage.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-12">
              <div className="text-center">
                <p>Sig. of Class Teacher</p>
              </div>
              <div className="text-center">
                <p>Sig. of Principal</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMarks;
