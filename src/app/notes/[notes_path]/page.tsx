'use client';

import { useParams } from 'next/navigation';

import NotesTable from '@/components/notes/NotesTable';

export default function SubjectPage() {
  const params = useParams();
  const parentPath = String(params?.notes_path);

  return (
    <div>
      <NotesTable parentPath={parentPath} />
    </div>
  );
}
