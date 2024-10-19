import React, { useState } from 'react';

const NotesComponent: React.FC = () => {
  const [notes, setNotes] = useState<string[]>([
    "October 7, 2023: Quarterly business review",
    "October 12, 2023: Dentist appointment"
  ]);
  const [newNote, setNewNote] = useState<string>('');

  const handleAddNote = (): void => {
    if (newNote.trim()) {
      setNotes([...notes, newNote]);
      setNewNote(''); // Clear the input after adding
    }
  };

  return (
    <div className="col-span-1 md:col-span-2 bg-blue-400 p-4 rounded-lg">
      <h2 className="font-bold mb-2 text-sm md:text-base">NOTES</h2>
      <ul className="text-sm md:text-base">
        {notes.map((note, index) => (
            <>
                <li key={index}>{note}</li>
                <hr style={{color: "white", margin: "5px 0 10px 0", background: "white", borderColor: "white" }}/>
            </>
        ))}
      </ul>
      <div className="mt-4">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a new note"
          className="p-2 rounded-md border border-gray-300 text-sm md:text-base"
        />
        <button
          onClick={handleAddNote}
          className="ml-2 bg-green-500 text-white p-2 rounded-lg text-sm md:text-base w-[250px]"
        >
          Create New
        </button>
      </div>
    </div>
  );
};

export default NotesComponent;
