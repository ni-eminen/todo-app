"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  createNote,
  deleteNote,
  getNotes as fetchNotes,
  patchNote,
} from "./services/dbService";
import { Note, TodoWindowProps } from "./types";
import { timestampIsOlderThan } from "./utils/timestampIsOlderThan";

const NoteComponent = ({
  note,
  onSelect,
  onDelete,
  onArchive,
}: {
  note: Note;
  onSelect: () => void;
  onDelete: () => void;
  onArchive: () => void;
}) => {
  const [bounceEffect, setBounceEffect] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const onSelectWithDeleting = () => {
    !deleting && onSelect();
  };

  return (
    <div
      className={`flex justify-between items-center my-2 first-letter bg-blue-500 rounded p-2 ${
        bounceEffect && "animate-bounce"
      } ${note.selected ? "bg-gradient-to-r from-blue-600 to-blue-500" : ""}`}
      onAnimationEnd={() => setBounceEffect(false)}
      onClick={() => {
        setBounceEffect(true);
        onSelectWithDeleting();
      }}
      onMouseEnter={() => setDeleteVisible(true)}
      onMouseLeave={() => setDeleteVisible(false)}
      key={note.id}
    >
      <div className="flex justify-between items-center my-2 first-letter">
        <input
          checked={note.selected}
          onChange={() => {
            onSelectWithDeleting();
          }}
          id={note.id}
          type="checkbox"
          value={note.id}
          className="h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        />
        <label
          onClick={() => {
            onSelectWithDeleting();
          }}
          htmlFor="default-checkbox"
          className={`ml-2 text-sm font-medium text-white select-none ${
            note.selected ? "line-through text-blue-300" : ""
          }`}
        >
          {note.body}
        </label>
      </div>
      <div
        className={`${
          deleteVisible ? "" : "hidden"
        } flex justify-between items-center`}
      >
        <div
          onMouseEnter={() => setDeleting(true)}
          onMouseLeave={() => setDeleting(false)}
          onClick={() => {
            onArchive();
          }}
          className={`justify-items-center content-center align-middle select-none rounded-md hover:bg-blue-400 overflow-hidden p-2 mx-1`}
        >
          <p className="text-center justify-center">a</p>
        </div>
        <div
          onMouseEnter={() => setDeleting(true)}
          onMouseLeave={() => setDeleting(false)}
          onClick={() => {
            onDelete();
          }}
          className={`justify-items-center content-center align-middle select-none rounded-md hover:bg-blue-400 overflow-hidde p-2`}
        >
          <p className="text-center">✕</p>
        </div>
      </div>
    </div>
  );
};

const TodoWindow = ({
  header,
  notes,
  onSelect,
  onDelete,
  onArchive,
  shorthand,
}: TodoWindowProps) => {
  return (
    <div className="flex flex-col no-scrollbar bg-blue-400 overflow-hidden w-1/2 rounded-lg m-3 p-5">
      <div className="flex flex-none basis-1 justify-between">
        <h1 className="text-2xl mb-2 select-none inline">{header}</h1>
        <h1 className="bg-blue-500 rounded px-2 py-1 text-2xl mb-2 select-none inline justify-end align-bottom">
          {shorthand}
        </h1>{" "}
      </div>
      <div className="flex- bg-blue-400 overflow-scroll rounded-lg no-scrollbar">
        <div className="mb-4">
          {notes.map((note: Note) => (
            <NoteComponent
              key={note.id}
              onSelect={() => onSelect(note)}
              onDelete={() => onDelete(note)}
              onArchive={() => onArchive(note)}
              note={note}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const ArchiveButton = ({
  onClick,
  toggled,
}: {
  onClick: () => void;
  toggled: boolean;
}) => {
  const [bounceEffect, setBounceEffect] = useState(false);

  return (
    <div
      onClick={() => {
        setBounceEffect(true);
        onClick();
      }}
      onAnimationEnd={() => setBounceEffect(false)}
      className={`outline-none select-none my-2 rounded-lg px-2 py-1.5 max-h-10 ml-1 items-center content-center ${
        toggled ? "bg-blue-500" : "bg-blue-400"
      } ${bounceEffect && "animate-bounce"}`}
    >
      <p>a</p>
    </div>
  );
};

export default function Home() {
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [showArchived, setShowArchived] = useState(false);

  const updateNotes = useCallback(() => {
    setNotes(
      notes.map((note) => {
        return {
          ...note,
          isYesterday:
            timestampIsOlderThan(note.selectedTimestamp) && !note.selected,
        };
      })
    );
  }, [notes]);

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
      selectedTimestamp: 1,
      archived: false,
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

  const removeNote = useCallback(
    (note: Note) => {
      deleteNote(note);
      const newNotes = notes.filter((x) => {
        return x.id !== note.id;
      });
      setNotes(newNotes);
    },
    [notes]
  );

  const toggleArchiveNote = useCallback(
    (noteToToggle: Note) => {
      const toggledNote = {
        ...noteToToggle,
        archived: !noteToToggle.archived,
      };

      patchNote(toggledNote);

      setNotes(
        notes.map((note) => (note.id === noteToToggle.id ? toggledNote : note))
      );
    },
    [notes]
  );

  const toggleFinishedNote = useCallback(
    (selectedNote: Note) => {
      const newSelectedTimestamp = Date.now();
      const updatedNote = {
        ...selectedNote,
        selectedTimestamp: newSelectedTimestamp,
        selected: !selectedNote.selected,
      };

      setNotes(
        notes.map((note) => (note.id === selectedNote.id ? updatedNote : note))
      );

      patchNote(updatedNote);
    },
    [notes]
  );

  const getNotes = useCallback(
    (category: string) => {
      const notesByCategory = notes.filter(
        (note) =>
          note.category == category &&
          (!timestampIsOlderThan(note.selectedTimestamp) || !note.selected) &&
          note.archived === showArchived
      );
      return notesByCategory.sort((a, b) => {
        return a.timestamp < b.timestamp ? -1 : 1;
      });
    },
    [notes, showArchived]
  );

  const todoWindows: TodoWindowProps[] = useMemo(
    () => [
      {
        onSelect: toggleFinishedNote,
        onDelete: removeNote,
        notes: getNotes("/t"),
        header: "Todo:",
        shorthand: "/t",
        onArchive: toggleArchiveNote,
      },
      {
        onSelect: toggleFinishedNote,
        onDelete: removeNote,
        notes: getNotes("/d"),
        header: "Daily:",
        shorthand: "/d",
        onArchive: toggleArchiveNote,
      },
      {
        onSelect: toggleFinishedNote,
        onDelete: removeNote,
        notes: getNotes("/g"),
        header: "General:",
        shorthand: "/g",
        onArchive: toggleArchiveNote,
      },
      {
        onSelect: toggleFinishedNote,
        onDelete: removeNote,
        notes: notes.filter(
          (note) =>
            timestampIsOlderThan(note.selectedTimestamp) &&
            note.selected &&
            note.archived === showArchived
        ),
        header: "Past:",
        shorthand: "/y",
        onArchive: toggleArchiveNote,
      },
    ],
    [
      getNotes,
      notes,
      removeNote,
      showArchived,
      toggleArchiveNote,
      toggleFinishedNote,
    ]
  );

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
          <ArchiveButton
            onClick={() => setShowArchived(!showArchived)}
            toggled={showArchived}
          />
        </div>
      </div>
    </main>
  );
}
