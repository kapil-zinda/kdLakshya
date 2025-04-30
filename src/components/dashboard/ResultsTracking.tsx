'use client';

import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  dummyClassOptions,
  dummyExamOptions,
  dummyGradeDistribution,
  dummyPerformanceData,
  dummyResultsData,
  dummySubjects,
} from '@/data/teacherDashboardDummyData';
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

interface StudentResult {
  id: string;
  name: string;
  rollNumber: string;
  totalMarks: number;
  percentage: number;
  grade: string;
  rank: number;
  subjectWiseMarks: {
    [subjectId: string]: number;
  };
}

interface Subject {
  id: string;
  name: string;
}

interface ClassPerformance {
  subjectName: string;
  averageMarks: number;
  highestMarks: number;
  lowestMarks: number;
}

const ResultsTracking: React.FC = () => {
  const [results, setResults] = useState<StudentResult[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [performanceData, setPerformanceData] = useState<ClassPerformance[]>(
    [],
  );
  const [distributionData, setDistributionData] = useState<any[]>([]);

  useEffect(() => {
    // In a real application, this would fetch subjects for the selected class
    if (selectedClass) {
      setSubjects(dummySubjects);
    }
  }, [selectedClass]);

  useEffect(() => {
    // In a real application, this would fetch results based on the selected class and exam
    if (selectedClass && selectedExam) {
      setIsLoading(true);

      // Simulate API call with dummy data
      setTimeout(() => {
        setResults(dummyResultsData);
        setPerformanceData(dummyPerformanceData);
        setDistributionData(dummyGradeDistribution);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedClass, selectedExam]);

  const handleGenerateReports = async () => {
    if (!selectedClass || !selectedExam) {
      alert('Please select a class and exam');
      return;
    }

    try {
      // This would be replaced with actual API call
      // await makeApiCall({
      //   path: `teacher/class/${selectedClass}/exam/${selectedExam}/generate-reports`,
      //   method: 'POST',
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert('Reports generated and sent successfully!');
    } catch (error) {
      console.error('Error generating reports:', error);
      alert('Failed to generate reports. Please try again.');
    }
  };

  const filteredResults = results.filter(
    (result) =>
      result.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.rollNumber.includes(searchTerm),
  );

  return (
    <div className="bg-gray-700 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">Results Tracking</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="class-select" className="text-white mb-2 block">
            Select Class
          </Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a class" />
            </SelectTrigger>
            <SelectContent>
              {dummyClassOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="exam-select" className="text-white mb-2 block">
            Select Examination
          </Label>
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an exam" />
            </SelectTrigger>
            <SelectContent>
              {dummyExamOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="search-input" className="text-white mb-2 block">
            Search Student
          </Label>
          <Input
            id="search-input"
            type="text"
            placeholder="Search by name or roll number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {selectedClass && selectedExam ? (
        <>
          {isLoading ? (
            <div className="text-center py-8 text-white">
              Loading results...
            </div>
          ) : (
            <>
              {/* Results Table */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Student Results
                </h3>
                {filteredResults.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-white">Rank</TableHead>
                          <TableHead className="text-white">Roll No.</TableHead>
                          <TableHead className="text-white">Name</TableHead>
                          <TableHead className="text-white">
                            Total Marks
                          </TableHead>
                          <TableHead className="text-white">
                            Percentage
                          </TableHead>
                          <TableHead className="text-white">Grade</TableHead>
                          {subjects.map((subject) => (
                            <TableHead key={subject.id} className="text-white">
                              {subject.name}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="text-white font-medium">
                              {result.rank}
                            </TableCell>
                            <TableCell className="text-white">
                              {result.rollNumber}
                            </TableCell>
                            <TableCell className="text-white">
                              {result.name}
                            </TableCell>
                            <TableCell className="text-white">
                              {result.totalMarks}
                            </TableCell>
                            <TableCell className="text-white">
                              {result.percentage.toFixed(2)}%
                            </TableCell>
                            <TableCell className="text-white font-medium">
                              {result.grade}
                            </TableCell>
                            {subjects.map((subject) => (
                              <TableCell
                                key={subject.id}
                                className="text-white"
                              >
                                {result.subjectWiseMarks[subject.id]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-white">
                    No results found
                  </div>
                )}
              </div>

              {/* Performance Analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Subject Performance
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subjectName" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="averageMarks"
                          fill="#8884d8"
                          name="Average Marks"
                        />
                        <Bar
                          dataKey="highestMarks"
                          fill="#82ca9d"
                          name="Highest Marks"
                        />
                        <Bar
                          dataKey="lowestMarks"
                          fill="#ffc658"
                          name="Lowest Marks"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Grade Distribution
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distributionData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="grade" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="count"
                          fill="#8884d8"
                          name="Number of Students"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4">
                <Button
                  onClick={handleGenerateReports}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Generate & Send Reports
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => window.print()}
                >
                  Print Results
                </Button>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-white">
          Please select a class and examination to view results
        </div>
      )}
    </div>
  );
};

export default ResultsTracking;
