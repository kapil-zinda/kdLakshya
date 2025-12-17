# Day 4: Component Migration Guide - RTK Query

## Overview

This guide shows you how to migrate components from the old `ApiService` to the new RTK Query hooks created in Day 3. We'll use **real examples** from your codebase.

---

## Migration Strategy

### Phase 3: Component Migration (You are here)

Migrate components to use RTK Query hooks for:

- ✅ Automatic caching
- ✅ Request deduplication
- ✅ Built-in loading/error states
- ✅ Automatic cache invalidation

### Target Components (Priority Order)

1. **Admin Portal - Classes** (26 API calls) ← Start here
2. **Teacher Dashboard - Classes** (18 API calls)
3. **Admin Portal - Students** (9 API calls)
4. **Admin Portal - Teachers** (4 API calls)

---

## Example 1: Admin Portal Classes Page

### Current Code Structure

**File**: `src/app/admin-portal/classes/page.tsx`

**API Calls Made** (26 total):

- `getCurrentOrgId()` - 1x
- `getUserMe()` - 1x
- `getFaculty()` - 1x
- `getClasses()` - 1x
- `getStudents()` - 1x
- `getClassStudents()` - 2x
- `getSubjectsForClass()` - 1x
- `getExamsForClass()` - 1x
- `createClass()` - 1x
- `updateClass()` - 3x
- `deleteClass()` - 1x
- `enrollStudentInClass()` - 1x
- `unenrollStudentFromClass()` - 1x
- `createSubject()` - 1x
- `updateSubject()` - 1x
- `deleteSubject()` - 1x
- `createExam()` - 1x
- `updateExam()` - 1x
- `deleteExam()` - 1x

### Migration Steps

#### Step 1: Add RTK Query Imports

**Before:**

```typescript
import { ApiService } from '@/services/api';
```

**After:**

```typescript
import { useUserDataRedux } from '@/hooks/useUserDataRedux';
import { ApiService } from '@/services/api'; // Keep for now (gradual migration)
import {
  useCreateClassMutation,
  useCreateExamMutation,
  useCreateSubjectMutation,
  useDeleteClassMutation,
  useDeleteExamMutation,
  useDeleteSubjectMutation,
  useEnrollStudentInClassMutation,
  useGetClassesQuery,
  useGetClassStudentsQuery,
  useGetExamsForClassQuery,
  useGetSubjectsForClassQuery,
  useUnenrollStudentFromClassMutation,
  useUpdateClassMutation,
  useUpdateExamMutation,
  useUpdateSubjectMutation,
} from '@/store/api/classApi';
import { useGetFacultyQuery } from '@/store/api/facultyApi';
import { useGetStudentsQuery } from '@/store/api/studentApi';
```

#### Step 2: Replace State Management with RTK Query

**Before (Manual State + API Calls):**

```typescript
const [classes, setClasses] = useState<Class[]>([]);
const [teachers, setTeachers] = useState<Teacher[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const orgId = await ApiService.getCurrentOrgId();

      const [teachersResponse, classesResponse, studentsResponse] =
        await Promise.all([
          ApiService.getFaculty(orgId),
          ApiService.getClasses(orgId),
          ApiService.getStudents(orgId),
        ]);

      setTeachers(teachersResponse.data);
      setClasses(classesResponse.data.map(...));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

**After (RTK Query Hooks):**

```typescript
// Get orgId from Redux user data
const { userData } = useUserDataRedux();
const orgId = userData?.orgId;

// Fetch data with RTK Query (automatic caching, deduplication, loading states)
const { data: teachersResponse, isLoading: teachersLoading } =
  useGetFacultyQuery(orgId!, { skip: !orgId });

const { data: classesResponse, isLoading: classesLoading } = useGetClassesQuery(
  orgId!,
  { skip: !orgId },
);

const { data: studentsResponse, isLoading: studentsLoading } =
  useGetStudentsQuery(orgId!, { skip: !orgId });

// Extract data
const teachers = teachersResponse?.data || [];
const classes = classesResponse?.data || [];
const students = studentsResponse?.data || [];

// Combined loading state
const loading = teachersLoading || classesLoading || studentsLoading;
```

**Benefits:**

- ✅ **60 lines → 15 lines** (75% less code)
- ✅ **Automatic caching** (30-60s based on API type)
- ✅ **Request deduplication** (if multiple components need same data)
- ✅ **No manual state management**
- ✅ **Built-in error handling**

#### Step 3: Replace Create Operations

**Before:**

```typescript
const handleCreateClass = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const orgId = await ApiService.getCurrentOrgId();

    const response = await ApiService.createClass(orgId, {
      class: classFormData.name,
      section: classFormData.section,
      room: classFormData.room,
      academic_year: classFormData.academicYear,
    });

    // Manually refresh classes list
    const classesResponse = await ApiService.getClasses(orgId);
    setClasses(classesResponse.data.map(...));

    setShowCreateClassModal(false);
    setClassFormData({ name: '', section: '', academicYear: '2024-25', room: '' });
  } catch (error) {
    console.error('Error creating class:', error);
    alert('Failed to create class');
  }
};
```

**After:**

```typescript
const [createClass, { isLoading: isCreating }] = useCreateClassMutation();

const handleCreateClass = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await createClass({
      orgId: orgId!,
      classData: {
        class: classFormData.name,
        section: classFormData.section,
        room: classFormData.room,
        academic_year: classFormData.academicYear,
      },
    }).unwrap();

    // RTK Query automatically refetches classes list! No manual refresh needed

    setShowCreateClassModal(false);
    setClassFormData({
      name: '',
      section: '',
      academicYear: '2024-25',
      room: '',
    });
  } catch (error) {
    console.error('Error creating class:', error);
    alert('Failed to create class');
  }
};
```

**Benefits:**

- ✅ **Automatic cache invalidation** - classes list refetches automatically
- ✅ **No manual refresh** needed
- ✅ **Built-in loading state** (`isCreating`)
- ✅ **25% less code**

#### Step 4: Replace Update Operations

**Before:**

```typescript
const handleUpdateClass = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const orgId = await ApiService.getCurrentOrgId();

    await ApiService.updateClass(orgId, editingClass.id, {
      class: editClassFormData.name,
      section: editClassFormData.section,
      room: editClassFormData.room,
      academic_year: editClassFormData.academicYear,
    });

    // Manually refresh classes list
    const classesResponse = await ApiService.getClasses(orgId);
    setClasses(classesResponse.data.map(...));

    setShowEditClassModal(false);
  } catch (error) {
    console.error('Error updating class:', error);
    alert('Failed to update class');
  }
};
```

**After:**

```typescript
const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();

const handleUpdateClass = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    await updateClass({
      orgId: orgId!,
      classId: editingClass.id,
      classData: {
        class: editClassFormData.name,
        section: editClassFormData.section,
        room: editClassFormData.room,
        academic_year: editClassFormData.academicYear,
      },
    }).unwrap();

    // Automatic refetch - no manual refresh!

    setShowEditClassModal(false);
  } catch (error) {
    console.error('Error updating class:', error);
    alert('Failed to update class');
  }
};
```

#### Step 5: Replace Delete Operations

**Before:**

```typescript
const handleDeleteClass = async () => {
  try {
    const orgId = await ApiService.getCurrentOrgId();
    await ApiService.deleteClass(orgId, classToDelete.id);

    // Manually refresh
    const classesResponse = await ApiService.getClasses(orgId);
    setClasses(classesResponse.data.map(...));

    setShowDeleteClassModal(false);
  } catch (error) {
    console.error('Error deleting class:', error);
    alert('Failed to delete class');
  }
};
```

**After:**

```typescript
const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

const handleDeleteClass = async () => {
  try {
    await deleteClass({
      orgId: orgId!,
      classId: classToDelete.id,
    }).unwrap();

    // Automatic refetch!

    setShowDeleteClassModal(false);
  } catch (error) {
    console.error('Error deleting class:', error);
    alert('Failed to delete class');
  }
};
```

#### Step 6: Replace Nested Data Fetching

**Before:**

```typescript
const handleClassSelect = async (classItem: Class) => {
  try {
    setSelectedClass(classItem);
    setLoading(true);

    const orgId = await ApiService.getCurrentOrgId();

    // Load students
    const studentsResponse = await ApiService.getClassStudents(
      orgId,
      classItem.id,
    );

    // Load subjects
    const subjectsResponse = await ApiService.getSubjectsForClass(
      orgId,
      classItem.id,
    );

    // Load exams
    const examsResponse = await ApiService.getExamsForClass(
      orgId,
      classItem.id,
    );

    // Update state
    setSelectedClass({
      ...classItem,
      data: {
        students: studentsResponse.data,
        subjects: subjectsResponse.data,
        exams: examsResponse.data,
      },
    });
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
```

**After:**

```typescript
const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

// Fetch nested data automatically when class is selected
const { data: studentsResponse, isLoading: studentsLoading } =
  useGetClassStudentsQuery(
    { orgId: orgId!, classId: selectedClassId! },
    { skip: !orgId || !selectedClassId },
  );

const { data: subjectsResponse, isLoading: subjectsLoading } =
  useGetSubjectsForClassQuery(
    { orgId: orgId!, classId: selectedClassId! },
    { skip: !orgId || !selectedClassId },
  );

const { data: examsResponse, isLoading: examsLoading } =
  useGetExamsForClassQuery(
    { orgId: orgId!, classId: selectedClassId! },
    { skip: !orgId || !selectedClassId },
  );

const handleClassSelect = (classItem: Class) => {
  setSelectedClassId(classItem.id);
  // Data fetches automatically! No manual loading
};

// Extract data
const currentStudents = studentsResponse?.data || [];
const currentSubjects = subjectsResponse?.data || [];
const currentExams = examsResponse?.data || [];

const loading = studentsLoading || subjectsLoading || examsLoading;
```

**Benefits:**

- ✅ **Automatic fetching** when selectedClassId changes
- ✅ **Cached data** if user switches back to previous class
- ✅ **Parallel requests** (not sequential)
- ✅ **40% less code**

---

## Example 2: Handling Loading States

### Before (Manual Loading Management)

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    await ApiService.createClass(...);
  } catch (error) {
    console.error(error);
  } finally {
    setIsSubmitting(false);
  }
};

return (
  <button disabled={isSubmitting}>
    {isSubmitting ? 'Creating...' : 'Create Class'}
  </button>
);
```

### After (Built-in Loading State)

```typescript
const [createClass, { isLoading }] = useCreateClassMutation();

const handleSubmit = async () => {
  try {
    await createClass({...}).unwrap();
  } catch (error) {
    console.error(error);
  }
};

return (
  <button disabled={isLoading}>
    {isLoading ? 'Creating...' : 'Create Class'}
  </button>
);
```

---

## Example 3: Handling Errors

### Before (Manual Error Handling)

```typescript
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  try {
    setError(null);
    const data = await ApiService.getClasses(orgId);
    setClasses(data);
  } catch (error: any) {
    setError(error.message || 'Failed to load classes');
    console.error(error);
  }
};

return (
  <>
    {error && <div className="error">{error}</div>}
    {/* ... */}
  </>
);
```

### After (Built-in Error State)

```typescript
const { data, isLoading, error, isError } = useGetClassesQuery(orgId!);

return (
  <>
    {isError && <div className="error">{error?.message || 'Failed to load classes'}</div>}
    {/* ... */}
  </>
);
```

---

## Example 4: Optimistic Updates (Advanced)

For better UX, you can show changes immediately before API confirms:

```typescript
const [updateClass] = useUpdateClassMutation();

const handleUpdateClass = async (classData) => {
  // Update UI optimistically
  const updatedClasses = classes.map((c) =>
    c.id === selectedClass.id ? { ...c, ...classData } : c,
  );
  setClasses(updatedClasses);

  try {
    // Send to API
    await updateClass({ orgId, classId: selectedClass.id, classData }).unwrap();
    // If successful, RTK Query cache is updated automatically
  } catch (error) {
    // If failed, RTK Query will revert to cached data
    console.error('Update failed:', error);
  }
};
```

---

## Migration Checklist for Each Component

### Before You Start

- [ ] Read the component and identify all `ApiService` calls
- [ ] List out which RTK Query hooks you'll need
- [ ] Identify where `orgId` comes from (should use `useUserDataRedux`)

### During Migration

- [ ] Add RTK Query hook imports
- [ ] Replace manual state with hooks (queries for GET, mutations for POST/PUT/DELETE)
- [ ] Replace `useEffect` + `ApiService` calls with hooks
- [ ] Remove manual loading/error state management
- [ ] Remove manual cache refresh logic
- [ ] Test each operation (create, read, update, delete)

### After Migration

- [ ] Verify all API calls work correctly
- [ ] Check that cache invalidation works (lists refresh after create/update/delete)
- [ ] Test loading states show correctly
- [ ] Test error handling works
- [ ] Remove any unused `ApiService` imports
- [ ] Check Redux DevTools to see queries cached correctly

---

## Common Patterns

### Pattern 1: Get orgId from Redux

```typescript
// OLD
const orgId = await ApiService.getCurrentOrgId();

// NEW
const { userData } = useUserDataRedux();
const orgId = userData?.orgId;
```

### Pattern 2: Conditional Fetching

```typescript
// Only fetch if orgId exists
const { data } = useGetClassesQuery(orgId!, {
  skip: !orgId, // Don't run query if no orgId
});
```

### Pattern 3: Dependent Queries

```typescript
// Fetch students only after class is selected
const { data: studentsData } = useGetClassStudentsQuery(
  { orgId: orgId!, classId: selectedClassId! },
  {
    skip: !orgId || !selectedClassId, // Wait for both
  },
);
```

### Pattern 4: Polling (Auto-refresh)

```typescript
// Auto-refresh every 30 seconds
const { data } = useGetClassesQuery(orgId!, {
  pollingInterval: 30000, // 30s
});
```

### Pattern 5: Manual Refetch

```typescript
const { data, refetch } = useGetClassesQuery(orgId!);

// Manually trigger refetch
const handleRefresh = () => {
  refetch();
};
```

---

## Benefits Summary

### Code Reduction

| Operation        | Before (lines) | After (lines) | Reduction |
| ---------------- | -------------- | ------------- | --------- |
| Fetch data       | 25-30          | 5-8           | 70-75%    |
| Create operation | 20-25          | 12-15         | 30-40%    |
| Update operation | 20-25          | 12-15         | 30-40%    |
| Delete operation | 15-20          | 10-12         | 30-40%    |
| **Average**      | **20-25**      | **10-12**     | **50%**   |

### Performance Improvements

- 🚀 **Automatic caching** - 30-60s based on API type
- 🌐 **Request deduplication** - 1 API call even if 5 components need same data
- ⚡ **Parallel requests** - RTK Query handles multiple requests efficiently
- 📊 **Background refetching** - Stale data refreshes automatically
- 🐛 **Better debugging** - See all API calls in Redux DevTools

### Developer Experience

- ✅ No manual state management
- ✅ No manual loading states
- ✅ No manual error handling
- ✅ No manual cache management
- ✅ No manual cache invalidation
- ✅ TypeScript type safety
- ✅ Automatic retries on failure

---

## Testing Strategy

### Test Each Operation

1. **Create**: Create a new class → verify it appears in list
2. **Read**: Refresh page → verify cached data loads instantly
3. **Update**: Edit a class → verify changes appear immediately
4. **Delete**: Delete a class → verify it disappears from list

### Test Cache Behavior

1. Load classes page (API call made)
2. Navigate away and back (cached data, no API call)
3. Wait 30+ seconds and navigate back (cache expired, new API call)

### Test Error Handling

1. Disconnect internet
2. Try to create/update/delete
3. Verify error message shows
4. Reconnect internet
5. Verify retry works

---

## Troubleshooting

### Issue: Query not running

**Problem**: `useGetClassesQuery(orgId)` doesn't fetch

**Solution**: Add skip condition

```typescript
useGetClassesQuery(orgId!, { skip: !orgId });
```

### Issue: Cache not invalidating

**Problem**: Create class but list doesn't refresh

**Solution**: Check tag types match in baseApi.ts and your mutation

### Issue: Too many API calls

**Problem**: API called every render

**Solution**: Use `skip` to prevent unnecessary calls

```typescript
useGetClassesQuery(orgId!, {
  skip: !orgId || !isReady,
});
```

### Issue: Stale data

**Problem**: Data doesn't update

**Solution**: Lower cache time or use manual refetch

```typescript
useGetClassesQuery(orgId!, {
  pollingInterval: 10000, // Refresh every 10s
});
```

---

## Next Steps

### Option 1: Migrate Admin Portal Classes (Highest Impact)

- **File**: `src/app/admin-portal/classes/page.tsx`
- **Impact**: 26 API calls → RTK Query hooks
- **Effort**: 2-3 hours
- **Benefit**: Huge performance improvement, 50% less code

### Option 2: Migrate Teacher Dashboard Classes

- **File**: `src/app/teacher-dashboard/classes/page.tsx`
- **Impact**: 18 API calls → RTK Query hooks
- **Effort**: 1-2 hours
- **Benefit**: Consistent with admin portal

### Option 3: Migrate Smaller Components

- Admin Portal Students (9 calls)
- Admin Portal Teachers (4 calls)
- Easier to start with, less risk

---

## Example: Complete Before/After

### Before (103 lines)

```typescript
export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const orgId = await ApiService.getCurrentOrgId();

        const [teachersResponse, classesResponse] = await Promise.all([
          ApiService.getFaculty(orgId),
          ApiService.getClasses(orgId),
        ]);

        setTeachers(teachersResponse.data);
        setClasses(classesResponse.data.map(...));
      } catch (error: any) {
        setError(error.message || 'Failed to load data');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCreateClass = async (classData) => {
    try {
      setError(null);
      const orgId = await ApiService.getCurrentOrgId();
      await ApiService.createClass(orgId, classData);

      // Refresh list
      const classesResponse = await ApiService.getClasses(orgId);
      setClasses(classesResponse.data.map(...));
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleUpdateClass = async (classId, classData) => {
    try {
      setError(null);
      const orgId = await ApiService.getCurrentOrgId();
      await ApiService.updateClass(orgId, classId, classData);

      // Refresh list
      const classesResponse = await ApiService.getClasses(orgId);
      setClasses(classesResponse.data.map(...));
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      setError(null);
      const orgId = await ApiService.getCurrentOrgId();
      await ApiService.deleteClass(orgId, classId);

      // Refresh list
      const classesResponse = await ApiService.getClasses(orgId);
      setClasses(classesResponse.data.map(...));
    } catch (error: any) {
      setError(error.message);
      console.error(error);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

### After (45 lines)

```typescript
export default function ClassManagement() {
  const { userData } = useUserDataRedux();
  const orgId = userData?.orgId;

  // Queries (GET)
  const { data: teachersResponse, isLoading: teachersLoading } =
    useGetFacultyQuery(orgId!, { skip: !orgId });
  const { data: classesResponse, isLoading: classesLoading, isError, error } =
    useGetClassesQuery(orgId!, { skip: !orgId });

  // Mutations (POST/PUT/DELETE)
  const [createClass] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();

  // Extract data
  const teachers = teachersResponse?.data || [];
  const classes = classesResponse?.data || [];
  const loading = teachersLoading || classesLoading;

  const handleCreateClass = async (classData) => {
    try {
      await createClass({ orgId: orgId!, classData }).unwrap();
      // Auto-refreshes!
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateClass = async (classId, classData) => {
    try {
      await updateClass({ orgId: orgId!, classId, classData }).unwrap();
      // Auto-refreshes!
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      await deleteClass({ orgId: orgId!, classId }).unwrap();
      // Auto-refreshes!
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <Spinner />;
  if (isError) return <Error message={error?.message} />;

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

**Result: 103 lines → 45 lines (56% reduction!)**

---

## Summary

### What You Get

- ✅ **50% less code** on average
- ✅ **Automatic caching** (30-60s TTL)
- ✅ **Automatic refetching** after mutations
- ✅ **Request deduplication**
- ✅ **Built-in loading/error states**
- ✅ **TypeScript type safety**
- ✅ **Redux DevTools** integration

### Migration Effort

| Component            | API Calls | Estimated Time | Difficulty |
| -------------------- | --------- | -------------- | ---------- |
| Admin Portal Classes | 26        | 2-3 hours      | Medium     |
| Teacher Dashboard    | 18        | 1-2 hours      | Medium     |
| Admin Students       | 9         | 1 hour         | Easy       |
| Admin Teachers       | 4         | 30 min         | Easy       |

### Best Practices

1. **Start small** - Migrate a single page first
2. **Test thoroughly** - Verify all CRUD operations work
3. **Keep old code** - Comment out rather than delete (easy rollback)
4. **Use DevTools** - Monitor Redux state and API calls
5. **Check caching** - Verify data loads from cache when appropriate

---

**Ready to migrate?** Follow this guide step-by-step for each component!

---

## Day 4 Status

- ✅ Day 1: Redux infrastructure
- ✅ Day 2: Auth migration
- ✅ Day 3: API endpoints (60+)
- 🔄 **Day 4: Component migration** ← You are here

Next: Apply this guide to migrate your components!
