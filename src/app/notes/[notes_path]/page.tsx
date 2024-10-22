"use client"

import NotesTable from "@/components/notes/NotesTable";
import { useParams } from 'next/navigation';

export default function SubjectPage() {
    const params = useParams();
    const parentPath = String(params?.notes_path);

    return (
        <div>
            <NotesTable parentPath = {parentPath}/>
        </div>
    )
};