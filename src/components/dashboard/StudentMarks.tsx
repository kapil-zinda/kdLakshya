'use client';

import React, { useEffect, useState } from 'react';

import Api from '@/services/api';
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

interface ExamData {
  examId: string;
  examName: string;
  examDate: string;
  subjects: {
    id: string;
    name: string;
    maxMarks: number;
    obtainedMarks: number;
  }[];
  totalMarks: number;
  totalObtained: number;
  percentage: number;
  grade: string;
  rank?: number;
}

// Add global styles for print media
const printStyles = `
  @media print {
    /* Hide everything by default */
    body * {
      visibility: hidden;
    }

    /* Show only print content */
    .print-only,
    .print-only * {
      visibility: visible !important;
    }

    /* Position print content at top */
    .print-only {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      padding: 20px !important;
      margin: 0 !important;
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

    /* Reset page margins */
    @page {
      margin: 2cm;
    }
  }
`;

const StudentMarks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exams, setExams] = useState<ExamData[]>([]);
  const [studentData, setStudentData] = useState<{
    firstName?: string;
    lastName?: string;
    rollNumber?: string;
    gradeLevel?: string;
    dateOfBirth?: string;
    email?: string;
    guardianInfo?: {
      father_name?: string;
      mother_name?: string;
      address?: string;
    };
  } | null>(null);
  const [selectedExam, setSelectedExam] = useState<string>('');

  // Fetch exams and results
  useEffect(() => {
    const fetchExamsAndResults = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get student data from localStorage
        const storedStudentData = localStorage.getItem('studentAuth');
        if (!storedStudentData) {
          throw new Error('No student data found');
        }

        const parsed = JSON.parse(storedStudentData);
        setStudentData(parsed);

        if (!parsed.orgId || !parsed.id) {
          throw new Error('Missing student or organization ID');
        }

        // Use classId from student data, or fallback to test classId
        const classId = parsed.classId || '68e7e5ce000c9a6998c6aed0';

        // Fetch exams for the student's class
        const examsResponse = await Api.getExamsForStudentClass(
          parsed.orgId,
          classId,
        );

        if (examsResponse?.data && Array.isArray(examsResponse.data)) {
          const examsList: ExamData[] = [];

          // For each exam, fetch the student's results
          for (const exam of examsResponse.data) {
            try {
              const resultResponse = await Api.getStudentResultForExam(
                parsed.orgId,
                parsed.id,
                exam.id,
              );

              if (resultResponse?.data) {
                const result = resultResponse.data;
                const attrs = result.attributes || result;

                // Build subject name mapping
                const subjectMap: { [key: string]: string } = {};
                if (exam.attributes?.subjects) {
                  exam.attributes.subjects.forEach(
                    (subj: { subject_id: string; subject_name?: string }) => {
                      subjectMap[subj.subject_id] =
                        subj.subject_name || subj.subject_id;
                    },
                  );
                }

                // Transform marks data
                const subjects = (attrs.marks || []).map(
                  (mark: {
                    subject_id: string;
                    max_marks?: number;
                    marks_obtained?: number;
                  }) => ({
                    id: mark.subject_id,
                    name: subjectMap[mark.subject_id] || mark.subject_id,
                    maxMarks: mark.max_marks || 100,
                    obtainedMarks: mark.marks_obtained || 0,
                  }),
                );

                const totalMarks = subjects.reduce(
                  (sum: number, s: { maxMarks: number }) => sum + s.maxMarks,
                  0,
                );
                const totalObtained = subjects.reduce(
                  (sum: number, s: { obtainedMarks: number }) =>
                    sum + s.obtainedMarks,
                  0,
                );
                const percentage =
                  totalMarks > 0 ? (totalObtained / totalMarks) * 100 : 0;

                // Calculate grade
                let grade = 'F';
                if (percentage >= 90) grade = 'A+';
                else if (percentage >= 80) grade = 'A';
                else if (percentage >= 70) grade = 'B';
                else if (percentage >= 60) grade = 'C';
                else if (percentage >= 50) grade = 'D';

                examsList.push({
                  examId: exam.id,
                  examName: exam.attributes?.exam_name || 'Exam',
                  examDate: exam.attributes?.exam_date || '',
                  subjects,
                  totalMarks,
                  totalObtained,
                  percentage,
                  grade,
                });
              }
            } catch (err) {
              console.warn(`Could not fetch result for exam ${exam.id}:`, err);
              // Continue with other exams even if one fails
            }
          }

          setExams(examsList);
          if (examsList.length > 0) {
            setSelectedExam(examsList[0].examId);
          }
        } else {
          setExams([]);
        }
      } catch (err) {
        console.error('Error fetching exams and results:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load exam results',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExamsAndResults();
  }, []);

  // Get the selected exam data
  const examData = exams.find((exam) => exam.examId === selectedExam);

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
    <div className="w-full">
      {/* Add print styles */}
      <style>{printStyles}</style>

      {/* UI Controls - Hidden during print */}
      <div className="no-print mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">Mark Sheet</h2>
          <div className="flex items-center gap-4">
            <Select value={selectedExam} onValueChange={setSelectedExam}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent>
                {exams.map((exam) => (
                  <SelectItem key={exam.examId} value={exam.examId}>
                    {exam.examName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePrint} disabled={loading || !examData}>
              Print
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg mt-6">
            <p className="font-semibold">Error loading exam results</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* No Data State */}
        {!loading && !error && exams.length === 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg mt-6">
            <p>No exam results available.</p>
          </div>
        )}

        {/* Regular view content - Hidden during print */}
        {examData && (
          <div className="mt-6">
            <div className="bg-card border border-border p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                {examData.examName}
              </h3>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-foreground">Subject</TableHead>
                      <TableHead className="text-foreground text-right">
                        Max Marks
                      </TableHead>
                      <TableHead className="text-foreground text-right">
                        Obtained Marks
                      </TableHead>
                      <TableHead className="text-foreground text-right">
                        Percentage
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {examData.subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium text-foreground">
                          {subject.name}
                        </TableCell>
                        <TableCell className="text-right text-foreground">
                          {subject.maxMarks}
                        </TableCell>
                        <TableCell className="text-right text-foreground">
                          {subject.obtainedMarks}
                        </TableCell>
                        <TableCell className="text-right text-foreground">
                          {(
                            (subject.obtainedMarks / subject.maxMarks) *
                            100
                          ).toFixed(2)}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted">
                      <TableCell className="font-bold text-foreground">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {examData.totalMarks}
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {examData.totalObtained}
                      </TableCell>
                      <TableCell className="text-right font-bold text-foreground">
                        {examData.percentage.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-muted-foreground mb-2">
                    Grade
                  </h4>
                  <p className="text-3xl font-bold text-foreground">
                    {examData.grade}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-muted-foreground mb-2">
                    Percentage
                  </h4>
                  <p className="text-3xl font-bold text-foreground">
                    {examData.percentage.toFixed(2)}%
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-muted-foreground mb-2">
                    Rank
                  </h4>
                  <p className="text-3xl font-bold text-foreground">
                    {examData.rank}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-lg mt-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Performance Chart
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    stroke="hsl(var(--border))"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Bar
                    dataKey="obtained"
                    name="Obtained Marks"
                    fill="#8884d8"
                  />
                  <Bar dataKey="max" name="Maximum Marks" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Print-only content */}
      {examData && (
        <div className="print-only">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-black">
              SHREE LAHARI SINGH MEMO. INTER COLLEGE GHANGHAULI, ALIGARH
            </h1>
            <p className="text-black">Phone No. 9897470696</p>
            <h2 className="text-xl font-bold mt-4 text-black">
              Progress Report - 2022-2023
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-black">
                <strong>Name:</strong> {studentData?.firstName}{' '}
                {studentData?.lastName}
              </p>
              <p className="text-black">
                <strong>Father&apos;s Name:</strong>{' '}
                {studentData?.guardianInfo?.father_name || 'N/A'}
              </p>
              <p className="text-black">
                <strong>Mother&apos;s Name:</strong>{' '}
                {studentData?.guardianInfo?.mother_name || 'N/A'}
              </p>
              <p className="text-black">
                <strong>Address:</strong>{' '}
                {studentData?.guardianInfo?.address || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-black">
                <strong>Roll No:</strong> {studentData?.rollNumber || 'N/A'}
              </p>
              <p className="text-black">
                <strong>Class:</strong> {studentData?.gradeLevel || 'N/A'}
              </p>
              <p className="text-black">
                <strong>Email:</strong> {studentData?.email || 'N/A'}
              </p>
              <p className="text-black">
                <strong>D.O.B.:</strong> {studentData?.dateOfBirth || 'N/A'}
              </p>
            </div>
          </div>

          <table className="w-full border-collapse border border-black mb-6">
            <thead>
              <tr>
                <th className="border border-black p-2 text-black">S.N.</th>
                <th className="border border-black p-2 text-black">Subject</th>
                <th className="border border-black p-2 text-black">
                  Max Marks
                </th>
                <th className="border border-black p-2 text-black">
                  Obtain Marks
                </th>
              </tr>
            </thead>
            <tbody>
              {examData.subjects.map((subject, index) => (
                <tr key={subject.id}>
                  <td className="border border-black p-2 text-center text-black">
                    {index + 1}
                  </td>
                  <td className="border border-black p-2 text-black">
                    {subject.name}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {subject.maxMarks}
                  </td>
                  <td className="border border-black p-2 text-center text-black">
                    {subject.obtainedMarks}
                  </td>
                </tr>
              ))}
              <tr>
                <td
                  colSpan={2}
                  className="border border-black p-2 text-center font-bold text-black"
                >
                  Total
                </td>
                <td className="border border-black p-2 text-center font-bold text-black">
                  {examData.totalMarks}
                </td>
                <td className="border border-black p-2 text-center font-bold text-black">
                  {examData.totalObtained}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-black">
                <strong>Result:</strong> Passed
              </p>
            </div>
            <div>
              <p className="text-black">
                <strong>Division:</strong> First
              </p>
            </div>
            <div>
              <p className="text-black">
                <strong>Percentage of Marks:</strong>{' '}
                {examData.percentage.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-12">
            <div className="text-center">
              <p className="text-black">Sig. of Class Teacher</p>
            </div>
            <div className="text-center">
              <p className="text-black">Sig. of Principal</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMarks;
