"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { createNote, getNotes as fetchNotes } from "./services/dbService";
import { Note, TodoWindowProps } from "./types";
import { timestampIsYesterday } from "./utils/isYesterday";

const TodoWindow = ({ header, notes, onSelect }: TodoWindowProps) => {
  return (
    <div className="bg-blue-400 overflow-scroll w-1/2 rounded-lg m-3 p-5">
      <h1 className="text-2xl mb-2">{header}</h1>
      <div className="mb-4">
        {notes.map((note: Note) => {
          return (
            <div key={note.id} className="flex items-center my-2 first-letter">
              <input
                checked={note.selected}
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

  useEffect(() => {
    const loadNotes = async () => {
      const response = await fetchNotes();
      setNotes(response);
    };
    loadNotes();
  }, []);

  const processInput = () => {
    const code = input.slice(0, 2);
    const body = input.slice(2, input.length);

    const newNote = {
      body: body,
      id: uuidv4(),
      timestamp: Date.now(),
      category: code,
      selected: false,
    };

    createNote(newNote);

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

  const getNotes = useCallback(
    (category: string) => {
      return notes.filter(
        (note) =>
          note.category == category && !timestampIsYesterday(note.timestamp)
      );
    },
    [notes]
  );

  const useNotes = (fn: () => Note[]) => {
    const notes = useMemo(() => fn(), [fn]);
    return notes;
  };

  const todoWindows: TodoWindowProps[] = [
    {
      onSelect: toggleNote,
      notes: useNotes(() => getNotes("/t")),
      header: "Todo:",
    },
    {
      onSelect: toggleNote,
      notes: useNotes(() => getNotes("/d")),
      header: "Daily:",
    },
    {
      onSelect: toggleNote,
      notes: useNotes(() => getNotes("/g")),
      header: "General:",
    },
    {
      onSelect: toggleNote,
      notes: useNotes(() => getNotes("/y")),
      header: "Yesterday:",
    },
  ];

  return (
    <main className="flex-col max-w-full min-h-full max-h-screen bg-blue-500">
      <div className="flex-col max-h-screen h-screen overflow-hidden">
        <div className="flex min-w-scree h-1/2">
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
          />
        </div>
      </div>
    </main>
  );
}
