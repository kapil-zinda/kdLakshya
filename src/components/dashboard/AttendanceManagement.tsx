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
  dummyAttendanceData,
  dummyClassOptions,
} from '@/data/teacherDashboardDummyData';

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | '';
}

const AttendanceManagement: React.FC = () => {
  const [date, setDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    // In a real application, this would fetch students based on the selected class
    if (selectedClass) {
      setIsLoading(true);

      // Simulate API call with dummy data
      setTimeout(() => {
        setStudents(dummyAttendanceData);
        setIsLoading(false);
      }, 500);
    }
  }, [selectedClass]);

  const handleStatusChange = (
    studentId: string,
    status: 'present' | 'absent' | 'late',
  ) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, status } : student,
      ),
    );
  };

  const handleMarkAll = (status: 'present' | 'absent' | 'late') => {
    setStudents(students.map((student) => ({ ...student, status })));
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !date) {
      alert('Please select a class and date');
      return;
    }

    setIsSaving(true);

    try {
      // This would be replaced with actual API call
      // await makeApiCall({
      //   path: 'teacher/attendance',
      //   method: 'POST',
      //   payload: {
      //     data: {
      //       type: 'attendance',
      //       attributes: {
      //         class_id: selectedClass,
      //         date,
      //         attendance: students.map(s => ({
      //           student_id: s.id,
      //           status: s.status || 'absent' // Default to absent if not marked
      //         }))
      //       }
      //     }
      //   }
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.includes(searchTerm),
  );

  return (
    <div className="bg-gray-700 p-6 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-6">
        Attendance Management
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
          <Label htmlFor="date-input" className="text-white mb-2 block">
            Date
          </Label>
          <Input
            id="date-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full"
          />
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

      {selectedClass ? (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              onClick={() => handleMarkAll('present')}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark All Present
            </Button>
            <Button
              onClick={() => handleMarkAll('absent')}
              className="bg-red-600 hover:bg-red-700"
            >
              Mark All Absent
            </Button>
            <Button
              onClick={() => handleMarkAll('late')}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Mark All Late
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-white">
              Loading students...
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-white">Roll No.</TableHead>
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Status</TableHead>
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
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            onClick={() =>
                              handleStatusChange(student.id, 'present')
                            }
                            className={`${
                              student.status === 'present'
                                ? 'bg-green-600'
                                : 'bg-gray-600 hover:bg-green-600'
                            } px-3 py-1`}
                            size="sm"
                          >
                            Present
                          </Button>
                          <Button
                            onClick={() =>
                              handleStatusChange(student.id, 'absent')
                            }
                            className={`${
                              student.status === 'absent'
                                ? 'bg-red-600'
                                : 'bg-gray-600 hover:bg-red-600'
                            } px-3 py-1`}
                            size="sm"
                          >
                            Absent
                          </Button>
                          <Button
                            onClick={() =>
                              handleStatusChange(student.id, 'late')
                            }
                            className={`${
                              student.status === 'late'
                                ? 'bg-yellow-600'
                                : 'bg-gray-600 hover:bg-yellow-600'
                            } px-3 py-1`}
                            size="sm"
                          >
                            Late
                          </Button>
                        </div>
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
              onClick={handleSaveAttendance}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-white">
          Please select a class to view students
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
