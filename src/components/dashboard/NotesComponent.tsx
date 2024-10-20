import React, { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const NotesComponent: React.FC = () => {
  const [notes, setNotes] = useState<string[]>([
    "October 7, 2023: Quarterly business review",
    "October 12, 2023: Dentist appointment"
  ]);
  const [newNote, setNewNote] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddNote = (): void => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote(''); // Clear the input after adding
    }
  };

  const handleEditNote = (index: number): void => {
    setEditingIndex(index);
    setNewNote(notes[index]);
  };

  const handleUpdateNote = (): void => {
    if (editingIndex !== null) {
      if (newNote.trim()) {
        const updatedNotes = [...notes];
        updatedNotes[editingIndex] = newNote;
        setNotes(updatedNotes);
      } else {
        // Remove the note if it's empty
        const updatedNotes = notes.filter((_, index) => index !== editingIndex);
        setNotes(updatedNotes);
      }
      setNewNote('');
      setEditingIndex(null);
    }
  };

  const handleDeleteNote = (index: number): void => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);
  };

  return (
    <div className="col-span-1 md:col-span-2 bg-blue-400 p-4 rounded-lg">
      <h2 className="font-bold mb-2 text-[20px] md:text-[22px]">NOTES</h2>
      <ul className="text-sm md:text-base">
        {notes.map((note, index) => (
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
          placeholder={editingIndex !== null ? "Edit note" : "Add a new note"}
          className="p-2 rounded-md border border-gray-300 text-sm md:text-base w-full"
        />
        <button
          onClick={editingIndex !== null ? handleUpdateNote : handleAddNote}
          className="mt-2 bg-green-500 text-white p-2 rounded-lg text-sm md:text-base w-full"
        >
          {editingIndex !== null ? "Update Note" : "Create New"}
        </button>
      </div>
    </div>
  );
};

export default NotesComponent;