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
  dummyMarkSheetData,
  dummySubjects,
} from '@/data/teacherDashboardDummyData';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  marks: {
    [subjectId: string]: number | null;
  };
}

interface Subject {
  id: string;
  name: string;
  maxMarks: number;
}

const MarkSheet: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    // In a real application, this would fetch subjects for the selected class
    if (selectedClass) {
      setSubjects(dummySubjects);
    }
  }, [selectedClass]);

  useEffect(() => {
    // In a real application, this would fetch students and their marks based on the selected class and exam
    if (selectedClass && selectedExam) {
      setIsLoading(true);

      // Simulate API call with dummy data
      setTimeout(() => {
        setStudents(dummyMarkSheetData);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedClass, selectedExam]);

  const handleMarkChange = (
    studentId: string,
    subjectId: string,
    value: string,
  ) => {
    const numValue =
      value === ''
        ? null
        : Math.min(
            Number(value),
            subjects.find((s) => s.id === subjectId)?.maxMarks || 100,
          );

    setStudents(
      students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              marks: {
                ...student.marks,
                [subjectId]: numValue,
              },
            }
          : student,
      ),
    );
  };

  const handleSaveMarks = async () => {
    if (!selectedClass || !selectedExam) {
      alert('Please select a class and exam');
      return;
    }

    setIsSaving(true);

    try {
      // This would be replaced with actual API call
      // await makeApiCall({
      //   path: 'teacher/marks',
      //   method: 'POST',
      //   payload: {
      //     data: {
      //       type: 'marks',
      //       attributes: {
      //         class_id: selectedClass,
      //         exam_id: selectedExam,
      //         marks: students.map(s => ({
      //           student_id: s.id,
      //           subject_marks: Object.entries(s.marks).map(([subjectId, mark]) => ({
      //             subject_id: subjectId,
      //             marks: mark
      //           }))
      //         }))
      //       }
      //     }
      //   }
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert('Marks saved successfully!');
    } catch (error) {
      console.error('Error saving marks:', error);
      alert('Failed to save marks. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.includes(searchTerm),
  );

  const calculateTotal = (studentMarks: {
    [subjectId: string]: number | null;
  }): number => {
    return Object.values(studentMarks).reduce(
      (sum: number, mark) => sum + (mark || 0),
      0,
    );
  };

  const calculatePercentage = (studentMarks: {
    [subjectId: string]: number | null;
  }) => {
    const total = calculateTotal(studentMarks);
    const maxPossible = subjects.reduce(
      (sum, subject) => sum + subject.maxMarks,
      0,
    );
    return maxPossible > 0 ? ((total / maxPossible) * 100).toFixed(2) : '0.00';
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">
        Mark Sheet Management
      </h2>

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
              Loading student marks...
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Roll No.</TableHead>
                    <TableHead className="text-white">Name</TableHead>
                    {subjects.map((subject) => (
                      <TableHead key={subject.id} className="text-white">
                        {subject.name} (Max: {subject.maxMarks})
                      </TableHead>
                    ))}
                    <TableHead className="text-white">Total</TableHead>
                    <TableHead className="text-white">Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="text-white">
                        {student.rollNumber}
                      </TableCell>
                      <TableCell className="text-white">
                        {student.name}
                      </TableCell>
                      {subjects.map((subject) => (
                        <TableCell key={subject.id}>
                          <Input
                            type="number"
                            min="0"
                            max={subject.maxMarks}
                            value={
                              student.marks[subject.id] === null
                                ? ''
                                : student.marks[subject.id]!
                            }
                            onChange={(e) =>
                              handleMarkChange(
                                student.id,
                                subject.id,
                                e.target.value,
                              )
                            }
                            className="w-20"
                          />
                        </TableCell>
                      ))}
                      <TableCell className="text-white font-medium">
                        {calculateTotal(student.marks)}
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {calculatePercentage(student.marks)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-white">No students found</div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSaveMarks}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Marks'}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-white">
          Please select a class and examination to view mark sheet
        </div>
      )}
    </div>
  );
};

export default MarkSheet;
