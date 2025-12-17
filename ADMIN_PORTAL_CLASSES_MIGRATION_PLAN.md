# Admin Portal Classes - Phased Migration Plan

## Overview

Instead of migrating all 26 API calls at once, we'll do it in **5 batches** of 4-5 APIs each. Test each batch before moving to the next.

**Total Time**: 3 hours (spread across 5 sessions)
**Approach**: Incremental, safe, testable

---

## Batch Strategy

| Batch       | APIs   | Focus                            | Time   | Risk   |
| ----------- | ------ | -------------------------------- | ------ | ------ |
| **Batch 1** | 4 APIs | Initial data loading (read-only) | 30 min | Low    |
| **Batch 2** | 4 APIs | Class CRUD operations            | 30 min | Medium |
| **Batch 3** | 4 APIs | Student operations               | 30 min | Medium |
| **Batch 4** | 3 APIs | Subject operations               | 30 min | Low    |
| **Batch 5** | 3 APIs | Exam operations                  | 30 min | Low    |

After each batch: **Test thoroughly before proceeding**

---

## BATCH 1: Initial Data Loading (30 min)

### Goal: Get classes list and basic data displaying

### APIs to Migrate (4)

1. `getCurrentOrgId()` → `useUserDataRedux()`
2. `getFaculty()` → `useGetFacultyQuery()`
3. `getClasses()` → `useGetClassesQuery()`
4. `getStudents()` → `useGetStudentsQuery()`

### Changes

#### 1.1 Add Imports

```typescript
import { useMemo } from 'react';

import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { useGetClassesQuery } from '@/store/api/classApi';
import { useGetFacultyQuery } from '@/store/api/facultyApi';
import { useGetStudentsQuery } from '@/store/api/studentApi';
```

#### 1.2 Replace State

```typescript
// REMOVE:
const [cachedOrgId, setCachedOrgId] = useState<string | null>(null);
const getOrgId = async () => { ... };

// ADD:
const { userData } = useUserDataRedux();
const orgId = userData?.orgId;
```

#### 1.3 Add RTK Query Hooks

```typescript
// Keep auth checking code as-is, just add after it:

const { data: facultyResponse, isLoading: facultyLoading } = useGetFacultyQuery(
  orgId!,
  {
    skip: !orgId,
  },
);

const { data: classesResponse, isLoading: classesLoading } = useGetClassesQuery(
  orgId!,
  {
    skip: !orgId || facultyLoading,
  },
);

const { data: allStudentsResponse, isLoading: studentsLoading } =
  useGetStudentsQuery(orgId!, {
    skip: !orgId || classesLoading,
  });
```

#### 1.4 Keep Old Data Loading BUT Use RTK Query Where Possible

```typescript
// Inside loadData function (lines 234-603)
// REPLACE:
const teachersResponse = await ApiService.getFaculty(orgId);
const classesResponse = await ApiService.getClasses(orgId);
const studentsResponse = await ApiService.getStudents(orgId);

// WITH: Just use the RTK Query responses
// Skip the ApiService calls for these 3
// BUT keep the rest of loadData for now (class students, subjects, exams)
```

**What to Test:**

- [ ] Page loads
- [ ] Classes list displays
- [ ] Teachers list displays
- [ ] orgId available from Redux

**Success Criteria:**

- No compilation errors
- Page functions exactly as before
- 3 API calls now using RTK Query
- Rest still using ApiService

---

## BATCH 2: Class CRUD Operations (30 min)

### Goal: Migrate class create/update/delete

### APIs to Migrate (4)

5. `getClassStudents()` → `useGetClassStudentsQuery()` (for selected class only)
6. `createClass()` → `useCreateClassMutation()`
7. `updateClass()` → `useUpdateClassMutation()`
8. `deleteClass()` → `useDeleteClassMutation()`

### Changes

#### 2.1 Add Imports

```typescript
import {
  useCreateClassMutation,
  useDeleteClassMutation,
  useGetClassStudentsQuery,
  useUpdateClassMutation,
} from '@/store/api/classApi';
```

#### 2.2 Change Selected Class State

```typescript
// CHANGE:
const [selectedClass, setSelectedClass] = useState<Class | null>(null);

// TO:
const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
```

#### 2.3 Add Class Students Query (On-Demand)

```typescript
const { data: classStudentsResponse } = useGetClassStudentsQuery(
  { orgId: orgId!, classId: selectedClassId! },
  { skip: !orgId || !selectedClassId },
);
```

#### 2.4 Add Mutations

```typescript
const [createClass] = useCreateClassMutation();
const [updateClass] = useUpdateClassMutation();
const [deleteClass] = useDeleteClassMutation();
```

#### 2.5 Update handleCreateClass

```typescript
// REPLACE entire function with:
const handleCreateClass = async () => {
  if (!classFormData.name || !classFormData.section || !orgId) {
    alert('Please fill in required fields');
    return;
  }

  try {
    const response = await createClass({
      orgId,
      classData: {
        class: classFormData.name,
        section: classFormData.section,
        room: classFormData.room,
        academic_year: classFormData.academicYear,
        description: `${classFormData.name} ${classFormData.section}`,
      },
    }).unwrap();

    setSelectedClassId(response.data.id);
    setShowCreateClassModal(false);
    setClassFormData({
      name: '',
      section: '',
      academicYear: '2024-25',
      room: '',
    });
    alert('Class created successfully!');
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create class');
  }
};
```

#### 2.6 Update handleUpdateClass

```typescript
// Find and replace entire function
const handleUpdateClass = async () => {
  if (!editingClass || !orgId) return;

  try {
    await updateClass({
      orgId,
      classId: editingClass.id,
      classData: {
        class: editClassFormData.name,
        section: editClassFormData.section,
        room: editClassFormData.room,
        academic_year: editClassFormData.academicYear,
      },
    }).unwrap();

    setShowEditClassModal(false);
    setEditingClass(null);
    alert('Class updated successfully!');
  } catch (error) {
    alert('Failed to update class');
  }
};
```

#### 2.7 Update handleDeleteClass

```typescript
const handleDeleteClass = async (classToDelete: Class) => {
  if (!confirm(`Delete ${classToDelete.name}?`) || !orgId) return;

  try {
    await deleteClass({ orgId, classId: classToDelete.id }).unwrap();

    if (selectedClassId === classToDelete.id) {
      setSelectedClassId(null);
    }

    alert('Class deleted successfully!');
  } catch (error) {
    alert('Failed to delete class');
  }
};
```

**What to Test:**

- [ ] Create class works
- [ ] Update class works
- [ ] Delete class works
- [ ] Class list refreshes after mutations
- [ ] Selected class updates correctly

---

## BATCH 3: Student Operations (30 min)

### Goal: Enroll/unenroll students

### APIs to Migrate (4)

9. `getSubjectsForClass()` → `useGetSubjectsForClassQuery()`
10. `getExamsForClass()` → `useGetExamsForClassQuery()`
11. `enrollStudentInClass()` → `useEnrollStudentInClassMutation()`
12. `unenrollStudentFromClass()` → `useUnenrollStudentFromClassMutation()`

### Changes

#### 3.1 Add Imports

```typescript
import {
  useEnrollStudentInClassMutation,
  useGetExamsForClassQuery,
  useGetSubjectsForClassQuery,
  useUnenrollStudentFromClassMutation,
} from '@/store/api/classApi';
```

#### 3.2 Add Queries

```typescript
const { data: subjectsResponse } = useGetSubjectsForClassQuery(
  { orgId: orgId!, classId: selectedClassId! },
  { skip: !orgId || !selectedClassId },
);

const { data: examsResponse } = useGetExamsForClassQuery(
  { orgId: orgId!, classId: selectedClassId! },
  { skip: !orgId || !selectedClassId },
);
```

#### 3.3 Add Mutations

```typescript
const [enrollStudent] = useEnrollStudentInClassMutation();
const [unenrollStudent] = useUnenrollStudentFromClassMutation();
```

#### 3.4 Update handleAssignStudentWithRollNumber

```typescript
const handleAssignStudentWithRollNumber = async () => {
  if (
    !rollNumberFormData.rollNumber ||
    !selectedStudentForAssignment ||
    !selectedClassId ||
    !orgId
  ) {
    alert('Please provide a roll number');
    return;
  }

  try {
    await enrollStudent({
      orgId,
      classId: selectedClassId,
      enrollment: {
        student_id: selectedStudentForAssignment.id,
        roll_number: rollNumberFormData.rollNumber,
      },
    }).unwrap();

    setShowRollNumberModal(false);
    setShowAddStudentModal(false);
    setSelectedStudentForAssignment(null);
    setRollNumberFormData({ rollNumber: '' });
    alert('Student enrolled successfully!');
  } catch (error) {
    alert('Failed to enroll student');
  }
};
```

#### 3.5 Update handleUnenrollStudent

```typescript
const handleUnenrollStudent = async (student: Student) => {
  if (!confirm(`Remove ${student.name}?`) || !selectedClassId || !orgId) return;

  try {
    await unenrollStudent({
      orgId,
      classId: selectedClassId,
      studentId: student.id,
    }).unwrap();
    alert('Student removed successfully!');
  } catch (error) {
    alert('Failed to remove student');
  }
};
```

**What to Test:**

- [ ] Enroll student works
- [ ] Unenroll student works
- [ ] Student list refreshes
- [ ] Subjects display for selected class
- [ ] Exams display for selected class

---

## BATCH 4: Subject Operations (30 min)

### Goal: Subject CRUD

### APIs to Migrate (3)

13. `createSubject()` → `useCreateSubjectMutation()`
14. `updateSubject()` → `useUpdateSubjectMutation()`
15. `deleteSubject()` → `useDeleteSubjectMutation()`

### Changes

#### 4.1 Add Imports

```typescript
import {
  useCreateSubjectMutation,
  useDeleteSubjectMutation,
  useUpdateSubjectMutation,
} from '@/store/api/classApi';
```

#### 4.2 Add Mutations

```typescript
const [createSubject] = useCreateSubjectMutation();
const [updateSubject] = useUpdateSubjectMutation();
const [deleteSubject] = useDeleteSubjectMutation();
```

#### 4.3 Update handleAddSubject

```typescript
const handleAddSubject = async () => {
  if (!subjectFormData.name || !selectedClassId || !orgId) {
    alert('Please fill in required fields');
    return;
  }

  try {
    await createSubject({
      orgId,
      classId: selectedClassId,
      subjectData: {
        name: subjectFormData.name,
        code: subjectFormData.code,
        teacher_id: subjectFormData.teacherId,
        credits: subjectFormData.credits,
      },
    }).unwrap();

    setShowAddSubjectModal(false);
    setSubjectFormData({
      name: '',
      code: '',
      teacherId: '',
      credits: 1,
      type: 'Core',
    });
    alert('Subject added successfully!');
  } catch (error) {
    alert('Failed to create subject');
  }
};
```

#### 4.4 Update handleEditSubject

```typescript
const handleEditSubject = async () => {
  if (
    !editSubjectFormData.teacherId ||
    !selectedClassId ||
    !selectedSubjectForEdit ||
    !orgId
  ) {
    alert('Please select a teacher');
    return;
  }

  try {
    await updateSubject({
      orgId,
      classId: selectedClassId,
      subjectId: selectedSubjectForEdit.id,
      subjectData: { teacher_id: editSubjectFormData.teacherId },
    }).unwrap();

    setShowEditSubjectModal(false);
    setSelectedSubjectForEdit(null);
    setEditSubjectFormData({ teacherId: '' });
    alert('Subject updated successfully!');
  } catch (error) {
    alert('Failed to update subject');
  }
};
```

#### 4.5 Update handleDeleteSubject

```typescript
const handleDeleteSubject = async () => {
  if (!selectedClassId || !selectedSubjectForDelete || !orgId) {
    alert('No subject selected');
    return;
  }

  try {
    await deleteSubject({
      orgId,
      classId: selectedClassId,
      subjectId: selectedSubjectForDelete.id,
    }).unwrap();

    setShowDeleteSubjectModal(false);
    setSelectedSubjectForDelete(null);
    alert('Subject deleted successfully!');
  } catch (error) {
    alert('Failed to delete subject');
  }
};
```

**What to Test:**

- [ ] Create subject works
- [ ] Update subject works
- [ ] Delete subject works
- [ ] Subject list refreshes after mutations

---

## BATCH 5: Exam Operations (30 min)

### Goal: Exam CRUD

### APIs to Migrate (3)

16. `createExam()` → `useCreateExamMutation()`
17. `updateExam()` → `useUpdateExamMutation()`
18. `deleteExam()` → `useDeleteExamMutation()`

### Changes

#### 5.1 Add Imports

```typescript
import {
  useCreateExamMutation,
  useDeleteExamMutation,
  useUpdateExamMutation,
} from '@/store/api/classApi';
```

#### 5.2 Add Mutations

```typescript
const [createExam] = useCreateExamMutation();
const [updateExam] = useUpdateExamMutation();
const [deleteExam] = useDeleteExamMutation();
```

#### 5.3 Update handleCreateExam

```typescript
const handleCreateExam = async () => {
  if (
    !examFormData.name ||
    !examFormData.date ||
    examFormData.subjects.length === 0 ||
    !selectedClassId ||
    !orgId
  ) {
    alert('Please fill in required fields');
    return;
  }

  try {
    await createExam({
      orgId,
      classId: selectedClassId,
      examData: {
        name: examFormData.name,
        exam_type: examFormData.type,
        exam_date: new Date(examFormData.date).getTime(),
        subjectId: examFormData.subjects[0].subjectId,
        max_marks: examFormData.subjects[0].marks,
      },
    }).unwrap();

    setShowCreateExamModal(false);
    setExamFormData({
      name: '',
      date: '',
      subjects: [],
      instructions: '',
      type: 'Unit Test',
      room: '',
    });
    alert('Exam created successfully!');
  } catch (error) {
    alert('Failed to create exam');
  }
};
```

#### 5.4 Update handleUpdateExam

```typescript
const handleUpdateExam = async () => {
  if (!selectedExamForEdit || !selectedClassId || !orgId) {
    alert('No exam selected');
    return;
  }

  try {
    await updateExam({
      orgId,
      classId: selectedClassId,
      examId: selectedExamForEdit.id,
      examData: {
        name: examFormData.name,
        exam_type: examFormData.type,
        exam_date: new Date(examFormData.date).getTime(),
        subjectId: examFormData.subjects[0]?.subjectId,
        max_marks: examFormData.subjects[0]?.marks,
      },
    }).unwrap();

    setShowEditExamModal(false);
    setSelectedExamForEdit(null);
    alert('Exam updated successfully!');
  } catch (error) {
    alert('Failed to update exam');
  }
};
```

#### 5.5 Update handleDeleteExam

```typescript
const handleDeleteExam = async () => {
  if (!selectedClassId || !selectedExamForDelete || !orgId) {
    alert('No exam selected');
    return;
  }

  try {
    await deleteExam({
      orgId,
      classId: selectedClassId,
      examId: selectedExamForDelete.id,
    }).unwrap();

    setShowDeleteExamModal(false);
    setSelectedExamForDelete(null);
    alert('Exam deleted successfully!');
  } catch (error) {
    alert('Failed to delete exam');
  }
};
```

**What to Test:**

- [ ] Create exam works
- [ ] Update exam works
- [ ] Delete exam works
- [ ] Exam list refreshes after mutations

---

## After All Batches: Final Cleanup

### Remove loadData Function

Once all batches are complete and tested, you can safely remove the old `loadData` function (lines 234-603).

### Add Data Transformations

Add `useMemo` blocks to transform RTK Query responses into the format the UI expects (classes, students, subjects, exams arrays).

### Add Auto-Select

```typescript
useEffect(() => {
  if (classes.length > 0 && !selectedClassId) {
    setSelectedClassId(classes[0].id);
  }
}, [classes, selectedClassId]);
```

---

## Safety Net

### Rollback Strategy

If any batch causes issues:

1. Comment out the new RTK Query code
2. Uncomment the old ApiService code
3. Test again
4. Fix the issue before proceeding

### Testing Between Batches

After each batch, test ALL operations (not just the new ones) to ensure nothing broke.

---

## Timeline

- **Session 1** (30 min): Batch 1 - Initial loading
- **Session 2** (30 min): Batch 2 - Class CRUD
- **Session 3** (30 min): Batch 3 - Student ops
- **Session 4** (30 min): Batch 4 - Subject ops
- **Session 5** (30 min): Batch 5 - Exam ops
- **Session 6** (30 min): Final cleanup

**Total**: 3 hours across 6 short sessions

---

## Critical Files

1. `/Users/rishabh/Documents/kspace/kdLakshya/src/app/admin-portal/classes/page.tsx` - Main file to modify
2. `/Users/rishabh/Documents/kspace/kdLakshya/src/store/api/classApi.ts` - Hook reference
3. `/Users/rishabh/Documents/kspace/kdLakshya/src/store/api/studentApi.ts` - Hook reference
4. `/Users/rishabh/Documents/kspace/kdLakshya/src/store/api/facultyApi.ts` - Hook reference

---

## Success Criteria Per Batch

✅ **After Batch 1**: Classes and teachers display
✅ **After Batch 2**: Can create/update/delete classes
✅ **After Batch 3**: Can enroll/unenroll students
✅ **After Batch 4**: Can manage subjects
✅ **After Batch 5**: Can manage exams

**Final**: All 18 APIs migrated, page fully functional, automatic caching working.
