"use client";
import { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Note {
  body: string;
  id: string;
  timestamp: number;
  category: string;
  selected: boolean;
  isYesterday: boolean;
}

interface TodoWindowProps {
  header: string;
  notes: Note[];
  onSelect: (str: Note) => void;
}

const TodoWindow = ({ header, notes, onSelect }: TodoWindowProps) => {
  return (
    <div className="bg-blue-400 overflow-scroll w-1/2 rounded-lg m-3 p-5">
      <h1 className="text-2xl mb-2">{header}</h1>
      <div className="mb-4">
        {notes.map((note: Note) => {
          return (
            <div key={note.id} className="flex items-center my-2 first-letter">
              <input
                onChange={() => onSelect(note)}
                id={note.id}
                type="checkbox"
                value={note.id}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                onSelect={() => onSelect(note)}
                htmlFor="default-checkbox"
                className={`ml-2 text-sm font-medium text-white ${
                  note.selected ? "line-through text-blue-100" : ""
                }`}
              >
                {note.body}
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function Home() {
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);

  const timestampIsYesterday = (timestamp: number) => {
    const today = new Date(Date.now());
    const timestampAsDate = new Date(timestamp);

    return today.getDate() - 1 == timestampAsDate.getDate();
  };

  const updateNotes = useCallback(() => {
    setNotes(
      notes.map((note) => {
        return { ...note, isYesterday: timestampIsYesterday(note.timestamp) };
      })
    );
  }, [notes]);

  useEffect(() => {
    const checkTimestamps = setInterval(() => {
      updateNotes();
    }, 1000);
    return () => clearInterval(checkTimestamps);
  }, [notes, updateNotes]);

  const processInput = () => {
    const code = input.slice(0, 2);
    const body = input.slice(2, input.length);

    const newNote = {
      body: body,
      id: uuidv4(),
      timestamp: Date.now(),
      category: code,
      selected: false,
      isYesterday: false,
    };

    setNotes([...notes, newNote]);
    setInput("");
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      processInput();
    }
  };

  const removeNote = (note: Note) => {
    setNotes(notes.filter((x) => x.id !== note.id));
  };

  const toggleNote = (selectedNote: Note) => {
    setNotes(
      notes.map((note) => {
        const updatedNote =
          note.id == selectedNote.id
            ? { ...note, selected: !note.selected }
            : note;
        return updatedNote;
      })
    );
  };

  const getNotes = (category: string) => {
    return notes.filter(
      (note) => note.category == category && !note.isYesterday && !note.selected
    );
  };

  const getYesterdaysNotes = () => {
    return notes.filter((note) => note.isYesterday);
  };

  const todoWindows: TodoWindowProps[] = [
    { onSelect: toggleNote, notes: getNotes("/t"), header: "Todo:" },
    { onSelect: toggleNote, notes: getNotes("/d"), header: "Daily:" },
    { onSelect: toggleNote, notes: getNotes("/g"), header: "General:" },
    { onSelect: toggleNote, notes: getYesterdaysNotes(), header: "Yesterday:" },
  ];

  return (
    <main className="flex-col max-w-full min-h-full max-h-screen">
      <div className="flex-col max-h-screen h-screen overflow-hidden">
        <div className="flex min-w-screen bg-blue-500 h-1/2">
          {todoWindows.map((todoWindowProps) => (
            <TodoWindow key={todoWindowProps.header} {...todoWindowProps} />
          ))}
        </div>
        <div className="flex justify-center bg-blue-500">
          <input
            onKeyDown={handleKeyDown}
            className="outline-none bg-blue-400 my-2 rounded-lg px-2 py-1.5 w-1/2 max-h-10 items-center content-center"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
          ></input>
        </div>
      </div>
    </main>
  );
}
