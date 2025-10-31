import { useEffect, useState } from "react";
import "./App.css";

declare const chrome: any;

type Note = { 
  id: number; 
  text: string; 
  color: string; 
  rotate: string; 
  pinned: boolean;
};

const STICKY_COLORS = [
  "bg-yellow-200",
  "bg-pink-200",
  "bg-green-200",
  "bg-blue-200",
  "bg-purple-200",
];

function App() {
  const [text, setText] = useState<string>("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);

  useEffect(() => {
    chrome.storage.sync.get({ notes: [] }, (data: { notes: Note[] }) => {
      setNotes(data.notes);
    });
  }, []);

  useEffect(() => {
    chrome.storage.sync.set({ notes });
  }, [notes]);

  const addNote = () => {
    if (!text.trim()) return;

    const newNote: Note = {
      id: Date.now(),
      text: text.trim(),
      pinned: false,
      color: STICKY_COLORS[Math.floor(Math.random() * STICKY_COLORS.length)],
      rotate: `rotate-${Math.floor(Math.random() * 3) - 1}`,
    };

    setNotes([newNote, ...notes]);
    setText("");
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const togglePin = (id: number) => {
    setNotes(
      notes
        .map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned))
    );
  };

  const onDragStart = (id: number) => setDragId(id);
  const onDrop = (id: number) => {
    if (dragId === null) return;
    const updated = [...notes];
    const fromIndex = updated.findIndex((n) => n.id === dragId);
    const toIndex = updated.findIndex((n) => n.id === id);

    const movedItem = updated[fromIndex];
    updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);

    setNotes(updated.sort((a, b) => Number(b.pinned) - Number(a.pinned)));
  };

  return (
    <div className="w-80 p-4 bg-[#fff8e7] rounded-md shadow font-sans">

      <h2 className="text-xl font-bold text-gray-800 mb-3 text-center">
        Sticky Notes Board
      </h2>

      <div className="flex gap-2 mb-4">
        <input
          className="flex-1 border border-gray-400 rounded px-2 py-1 focus:outline-none"
          type="text"
          placeholder="Write something..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
          onClick={addNote}
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pb-2">
        {notes.length === 0 && (
          <p className="text-gray-600 text-sm col-span-2 text-center">
            No sticky notes yet
          </p>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            draggable
            onDragStart={() => onDragStart(note.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(note.id)}
            className={`${note.color} ${note.rotate} p-2 shadow-md rounded h-24 relative cursor-move hover:shadow-lg transition`}
          >
            <button
              className="absolute top-1 left-2 text-gray-700 hover:text-black text-xs"
              onClick={() => togglePin(note.id)}
            >
              {note.pinned ? "📌" : "📍"}
            </button>

            <p className="text-gray-800 text-sm break-words h-16 overflow-y-auto mt-4">
              {note.text}
            </p>

            <button
              className="absolute top-1 right-2 text-red-600 hover:text-red-800 text-xs"
              onClick={() => deleteNote(note.id)}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
