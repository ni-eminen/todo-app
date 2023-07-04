"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  createNote,
  getNotes as fetchNotes,
  patchNote,
} from "./services/dbService";
import { Note, TodoWindowProps } from "./types";
import { timestampIsYesterday } from "./utils/isYesterday";

const NoteComponent = ({
  note,
  onSelect,
}: {
  note: Note;
  onSelect: () => void;
}) => {
  const [bounceEffect, setBounceEffect] = useState(false);

  return (
    <div
      className={`flex items-center my-2 first-letter bg-blue-500 rounded p-2 ${
        bounceEffect && "animate-bounce"
      } ${note.selected ? "bg-gradient-to-r from-blue-600 to-blue-500" : ""}`}
      onAnimationEnd={() => setBounceEffect(false)}
      onClick={() => {
        setBounceEffect(true);
        onSelect();
      }}
    >
      <input
        checked={note.selected}
        onChange={onSelect}
        id={note.id}
        type="checkbox"
        value={note.id}
        className="w-8 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
      />
      <label
        onClick={onSelect}
        htmlFor="default-checkbox"
        className={`ml-2 text-sm font-medium text-white select-none ${
          note.selected ? "line-through text-blue-300" : ""
        }`}
      >
        {note.body}
      </label>
    </div>
  );
};

const TodoWindow = ({
  header,
  notes,
  onSelect,
  shorthand,
}: TodoWindowProps) => {
  return (
    <div className="bg-blue-400 overflow-scroll w-1/2 rounded-lg m-3 p-5">
      <div className="flex justify-between">
        <h1 className="text-2xl mb-2 select-none inline">{header}</h1>
        <h1 className="bg-blue-500 rounded px-2 py-1 text-2xl mb-2 select-none inline justify-end align-bottom">
          {shorthand}
        </h1>{" "}
      </div>
      <div className="mb-4">
        {notes.map((note: Note) => (
          <NoteComponent
            key={note.id}
            onSelect={() => onSelect(note)}
            note={note}
          />
        ))}
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
      console.log(notes);
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
    patchNote({ ...selectedNote, selected: !selectedNote.selected });
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
      shorthand: "/t",
    },
    {
      onSelect: toggleNote,
      notes: useNotes(() => getNotes("/d")),
      header: "Daily:",
      shorthand: "/d",
    },
    {
      onSelect: toggleNote,
      notes: useNotes(() => getNotes("/g")),
      header: "General:",
      shorthand: "/g",
    },
    {
      onSelect: toggleNote,
      notes: useNotes(() =>
        notes.filter((note) => timestampIsYesterday(note.timestamp))
      ),
      header: "Yesterday:",
      shorthand: "/y",
    },
  ];

  return (
    <main className="flex-col max-w-full min-h-full max-h-screen bg-gradient-to-r from-blue-600 to-blue-500">
      <div className="flex-col max-h-screen h-screen overflow-hidden">
        <div className="flex min-w-scree h-1/2">
          {todoWindows.map((todoWindowProps) => (
            <TodoWindow key={todoWindowProps.header} {...todoWindowProps} />
          ))}
        </div>
        <div className="flex justify-center">
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
