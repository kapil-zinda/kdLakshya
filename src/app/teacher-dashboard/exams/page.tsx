'use client';

import React, { useEffect, useState } from 'react';

import Link from 'next/link';

import { UserData } from '@/app/interfaces/userInterface';
import { DashboardWrapper } from '@/components/auth/DashboardWrapper';
import { ApiService } from '@/services/api';
import { toast } from 'react-toastify';

interface ExamSubject {
  subject_id: string;
  subject_name?: string;
  max_marks: number;
  exam_date?: string;
  duration?: number;
  start_time?: string;
}

interface TeacherSubject {
  id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  class_id: string;
  class_name: string;
  academic_year: string;
}

interface Exam {
  id: string;
  exam_name: string;
  class_id: string;
  class_name?: string;
  academic_year?: string;
  exam_date: string;
  subjects: ExamSubject[];
  teacher_subjects: TeacherSubject[];
}

interface Student {
  id: string;
  name: string;
  roll_number: string;
}

interface StudentMark {
  student_id: string;
  student_name: string;
  roll_number: string;
  marks_obtained?: number;
  result_id?: string;
}

export default function TeacherExamsPage() {
  return (
    <DashboardWrapper allowedRoles={['teacher', 'faculty', 'admin']}>
      {(userData) => <ExamsContent userData={userData} />}
    </DashboardWrapper>
  );
}

function ExamsContent({ userData }: { userData: UserData }) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [teacherSubjects, setTeacherSubjects] = useState<ExamSubject[]>([]);
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<ExamSubject | null>(
    null,
  );
  const [students, setStudents] = useState<StudentMark[]>([]);
  const [showMarksModal, setShowMarksModal] = useState(false);
  const [editingMarks, setEditingMarks] = useState<{
    [studentId: string]: number;
  }>({});

  const orgId = userData.orgId;
  const teacherId = userData.userId;

  useEffect(() => {
    // Only load exams if we have both orgId and teacherId
    if (orgId && teacherId) {
      loadExams();
    } else {
      console.warn('Missing orgId or teacherId:', { orgId, teacherId });
      setIsLoading(false);
    }
  }, [orgId, teacherId]);

  const loadExams = async () => {
    // Double-check orgId and teacherId are defined
    if (!orgId || !teacherId) {
      console.error('Cannot load exams: missing orgId or teacherId');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await ApiService.getTeacherExams(orgId, teacherId);

      const examsList: Exam[] = response.data.map((e: any) => ({
        id: e.id,
        exam_name: e.attributes.exam_name,
        class_id: e.attributes.class_id,
        class_name: e.attributes.class_name || 'Unknown Class',
        academic_year: e.attributes.academic_year,
        exam_date: e.attributes.exam_date,
        subjects: e.attributes.subjects || [],
        teacher_subjects: e.attributes.teacher_subjects || [],
      }));

      setExams(examsList);
    } catch (error) {
      console.error('Error loading exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExamClick = async (exam: Exam) => {
    try {
      // Check if teacher has any assigned subjects in this exam
      if (!exam.teacher_subjects || exam.teacher_subjects.length === 0) {
        toast.warning('You are not assigned to any subjects in this exam');
        return;
      }

      // Map teacher's subjects with exam subject details
      const teacherSubjectsInExam: ExamSubject[] = exam.teacher_subjects
        .map((teacherSubject) => {
          const examSubject = exam.subjects.find(
            (es) => es.subject_id === teacherSubject.id,
          );
          if (examSubject) {
            return {
              ...examSubject,
              subject_name:
                examSubject.subject_name || teacherSubject.subject_name,
            };
          }
          return null;
        })
        .filter((s): s is NonNullable<typeof s> => s !== null);

      if (teacherSubjectsInExam.length === 0) {
        toast.warning('You are not assigned to any subjects in this exam');
        return;
      }

      setSelectedExam(exam);
      setTeacherSubjects(teacherSubjectsInExam);
      setShowExamModal(true);
    } catch (error) {
      console.error('Error loading exam details:', error);
      toast.error('Failed to load exam details');
    }
  };

  const handleEnterMarks = async (subject: ExamSubject) => {
    if (!selectedExam) return;

    setSelectedSubject(subject);

    try {
      // Get class students
      const classResponse = await ApiService.getClassStudents(
        orgId,
        selectedExam.class_id,
      );
      const classStudents: Student[] = classResponse.data.map((s: any) => ({
        id: s.attributes.student_id,
        name: `${s.attributes?.first_name || ''} ${s.attributes?.last_name || ''}`.trim(),
        roll_number: s.attributes?.roll_number || '',
      }));

      // Get existing results for this exam and subject
      try {
        const resultsResponse = await ApiService.getResultsForExamSubject(
          orgId,
          selectedExam.id,
          subject.subject_id,
        );

        const studentMarks: StudentMark[] = classStudents.map((student) => {
          const existingResult = resultsResponse.data.find(
            (r: any) => r.attributes.student_id === student.id,
          );

          if (existingResult) {
            const subjectMark = existingResult.attributes.marks.find(
              (m: any) => m.subject_id === subject.subject_id,
            );
            return {
              student_id: student.id,
              student_name: student.name,
              roll_number: student.roll_number,
              marks_obtained: subjectMark?.marks_obtained,
              result_id: existingResult.id,
            };
          }

          return {
            student_id: student.id,
            student_name: student.name,
            roll_number: student.roll_number,
          };
        });

        setStudents(studentMarks);
      } catch (error) {
        // No results yet, just show students
        setStudents(
          classStudents.map((s) => ({
            student_id: s.id,
            student_name: s.name,
            roll_number: s.roll_number,
          })),
        );
      }

      setShowMarksModal(true);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const handleMarkChange = (studentId: string, marks: number) => {
    setEditingMarks((prev) => ({
      ...prev,
      [studentId]: marks,
    }));
  };

  const handleSaveMarks = async (studentMark: StudentMark) => {
    if (!selectedExam || !selectedSubject) return;

    const marks = editingMarks[studentMark.student_id];
    if (marks === undefined || marks === null) {
      toast.error('Please enter marks');
      return;
    }

    if (marks < 0 || marks > (selectedSubject.max_marks || 100)) {
      toast.error(`Marks must be between 0 and ${selectedSubject.max_marks}`);
      return;
    }

    try {
      if (studentMark.result_id) {
        // Update existing marks
        await ApiService.updateResult(
          orgId,
          studentMark.result_id,
          selectedSubject.subject_id,
          marks,
          teacherId,
        );
        toast.success('Marks updated successfully!');
      } else {
        // Create new result
        await ApiService.createResult(orgId, {
          student_id: studentMark.student_id,
          exam_id: selectedExam.id,
          marks: [
            {
              subject_id: selectedSubject.subject_id,
              marks_obtained: marks,
              updated_by: teacherId,
            },
          ],
        });
        toast.success('Marks saved successfully!');
      }

      // Reload students to refresh marks
      if (selectedExam && selectedSubject) {
        handleEnterMarks(selectedSubject);
      }

      // Clear editing state for this student
      setEditingMarks((prev) => {
        const newState = { ...prev };
        delete newState[studentMark.student_id];
        return newState;
      });
    } catch (error) {
      console.error('Error saving marks:', error);
      toast.error('Failed to save marks');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link
                href="/teacher-dashboard"
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Exams & Results
              </h1>
            </div>
            <div className="text-sm text-gray-500">
              {userData.firstName} {userData.lastName}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Exams</h2>
          <p className="text-gray-600 mt-1">
            Click on an exam to view your assigned subjects and enter marks
          </p>
        </div>

        {exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No exams available
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You don&apos;t have any exams assigned yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
              <div
                key={exam.id}
                onClick={() => handleExamClick(exam)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {exam.exam_name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {exam.class_name}
                      </p>
                      {exam.academic_year && (
                        <p className="text-xs text-gray-500">
                          {exam.academic_year}
                        </p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {exam.subjects.length} Subjects
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {new Date(exam.exam_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      Subjects:
                    </p>
                    <div className="space-y-1">
                      {exam.subjects.slice(0, 3).map((subject, idx) => (
                        <div key={idx} className="flex items-center">
                          <span className="text-sm text-gray-600">
                            • {subject.subject_name || `Subject ${idx + 1}`}
                          </span>
                        </div>
                      ))}
                      {exam.subjects.length > 3 && (
                        <p className="text-xs text-gray-500 italic">
                          +{exam.subjects.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                    Click to view details
                    <svg
                      className="w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Exam Details Modal */}
      {showExamModal && selectedExam && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedExam.exam_name}
                  </h3>
                  <p className="text-blue-100 text-sm mt-1">
                    {selectedExam.class_name} • {selectedExam.academic_year}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowExamModal(false);
                    setSelectedExam(null);
                    setTeacherSubjects([]);
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Your Assigned Subjects
                </h4>
                <p className="text-sm text-gray-600">
                  Click on a subject to enter marks for students
                </p>
              </div>

              <div className="space-y-3">
                {teacherSubjects.map((subject, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="text-base font-bold text-gray-900">
                          {subject.subject_name}
                        </h5>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            Max Marks: {subject.max_marks}
                          </span>
                          {subject.exam_date && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {new Date(subject.exam_date).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )}
                            </span>
                          )}
                          {subject.duration && subject.duration > 0 && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {subject.duration} mins
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleEnterMarks(subject)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Enter Marks
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {teacherSubjects.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No subjects assigned
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You are not assigned to any subjects in this exam.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setShowExamModal(false);
                    setSelectedExam(null);
                    setTeacherSubjects([]);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marks Entry Modal */}
      {showMarksModal && selectedExam && selectedSubject && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-600 to-teal-600">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedExam.exam_name} - {selectedSubject.subject_name}
                  </h3>
                  <p className="text-green-100 text-sm mt-1">
                    Max Marks: {selectedSubject.max_marks}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowMarksModal(false);
                    setSelectedSubject(null);
                    setEditingMarks({});
                  }}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No.
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks Obtained
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.student_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {student.roll_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {student.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            min="0"
                            max={selectedSubject.max_marks}
                            defaultValue={student.marks_obtained}
                            onChange={(e) =>
                              handleMarkChange(
                                student.student_id,
                                parseFloat(e.target.value),
                              )
                            }
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="0"
                          />
                          <span className="ml-2 text-sm text-gray-500">
                            / {selectedSubject.max_marks}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleSaveMarks(student)}
                            disabled={
                              editingMarks[student.student_id] === undefined
                            }
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                          >
                            Save
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between">
                <button
                  onClick={() => {
                    setShowMarksModal(false);
                    setSelectedSubject(null);
                    setEditingMarks({});
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Back to Subjects
                </button>
                <button
                  onClick={() => {
                    setShowMarksModal(false);
                    setShowExamModal(false);
                    setSelectedExam(null);
                    setSelectedSubject(null);
                    setEditingMarks({});
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
