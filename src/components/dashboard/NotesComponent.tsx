import React, { useEffect, useState } from 'react';

import { makeApiCall } from '@/utils/ApiRequest';
import { Edit2 } from 'lucide-react';

interface NotesComponentProps {
  notes: string[];
}

const NotesComponent: React.FC<NotesComponentProps> = ({ notes }) => {
  const [newNote, setNewNote] = useState<string>('');
  const [currNotes, setCurrNotes] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    setCurrNotes(notes);
  }, [notes]);
  console.log(notes);
  console.log(currNotes);

  const handleAddNote = async () => {
    if (newNote.trim()) {
      try {
        const updatedNotes = [...currNotes, newNote];

        await makeApiCall({
          path: 'subject/todo',
          method: 'PATCH',
          payload: {
            data: {
              type: 'todo',
              attributes: {
                note: updatedNotes,
              },
            },
          },
        });

        setCurrNotes(updatedNotes);

        setNewNote('');
      } catch (error) {
        console.log('Error adding notes:', error);
      }
    }
  };

  const handleEditNote = (index: number): void => {
    setEditingIndex(index);
    setNewNote(notes[index]);
  };

  const handleUpdateNote = async () => {
    if (editingIndex !== null) {
      if (newNote.trim()) {
        const updatedNotes = [...currNotes];
        updatedNotes[editingIndex] = newNote;

        await makeApiCall({
          path: 'subject/todo',
          method: 'PATCH',
          payload: {
            data: {
              type: 'todo',
              attributes: {
                note: updatedNotes,
              },
            },
          },
        });

        setCurrNotes(updatedNotes);
      } else {
        // Remove the note if it's empty
        const updatedNotes = currNotes.filter(
          (_, index) => index !== editingIndex,
        );

        await makeApiCall({
          path: 'subject/todo',
          method: 'PATCH',
          payload: {
            data: {
              type: 'todo',
              attributes: {
                note: updatedNotes,
              },
            },
          },
        });

        setCurrNotes(updatedNotes);
      }
      setNewNote('');
      setEditingIndex(null);
    }
  };

  return (
    <div className="col-span-1 md:col-span-2 bg-blue-400 p-4 rounded-lg">
      <h2 className="font-bold mb-2 text-[20px] md:text-[22px]">NOTES</h2>
      <ul className="text-sm md:text-base">
        {currNotes.map((note, index) => (
          <React.Fragment key={index}>
            <li className="flex items-center justify-between">
              <span>{note}</span>
              <div>
                <button
                  onClick={() => handleEditNote(index)}
                  className="text-white hover:text-gray-200 mr-2"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </li>
            <hr className="border-white my-2" />
          </React.Fragment>
        ))}
      </ul>
      <div className="mt-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={editingIndex !== null ? 'Edit note' : 'Add a new note'}
          className="p-2 rounded-md border border-gray-300 text-sm md:text-base w-full"
        />
        <button
          onClick={editingIndex !== null ? handleUpdateNote : handleAddNote}
          className="mt-2 bg-green-500 text-white p-2 rounded-lg text-sm md:text-base w-full"
        >
          {editingIndex !== null ? 'Update Note' : 'Create New'}
        </button>
      </div>
    </div>
  );
};

export default NotesComponent;
