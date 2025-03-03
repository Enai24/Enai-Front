import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NoteSection = ({ notes, onAddNote, onEditNote, onDeleteNote }) => {
  const [noteText, setNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setIsSubmitting(true);
    await onAddNote(noteText);
    setNoteText('');
    setIsSubmitting(false);
  };

  return (
    <div className="mb-6 bg-gray-800 p-4 rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Notes</h2>
      </div>
      {notes && notes.length > 0 ? (
        notes.slice().reverse().map(note => (
          <div key={note.id} className="bg-gray-700 p-3 rounded mb-3">
            <div className="text-sm text-white" dangerouslySetInnerHTML={{ __html: note.content }} />
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
              <span>{note.author}</span>
              <span>•</span>
              <span>{new Date(note.timestamp).toLocaleString()}</span>
              <button onClick={() => onEditNote(note)} className="text-blue-400 hover:underline">Edit</button>
              <button onClick={() => onDeleteNote(note.id)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-400">No notes available.</p>
      )}
      <form onSubmit={handleNoteSubmit} className="mt-4">
        <ReactQuill
          value={noteText}
          onChange={setNoteText}
          className="bg-gray-700 text-white border border-gray-600 rounded"
          modules={{ toolbar: [['bold', 'italic', 'underline'], ['link']] }}
          placeholder="Add a note..."
        />
        <button type="submit" disabled={isSubmitting} className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400">
          {isSubmitting ? 'Saving...' : 'Save Note'}
        </button>
      </form>
    </div>
  );
};

export default React.memo(NoteSection);