"use client";
import { useState } from "react";

const TodoWindow = ({
  header,
  notes,
  onSelect,
}: {
  header: string;
  notes: string[];
  onSelect: (str: string) => void;
}) => {
  return (
    <div className="bg-blue-400 rounded-lg m-3 p-5">
      <h1 className="text-2xl mb-2">{header}</h1>
      <div className="mb-4">
        {notes.map((str: string) => {
          return (
            <div key={str} className="flex items-center my-2">
              <input
                onChange={() => onSelect(str)}
                id="default-checkbox"
                type="checkbox"
                value={str}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-checkbox"
                className="ml-2 text-sm font-medium text-white"
              >
                {str}
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
  const [todoNotes, setTodoNotes] = useState<string[]>([]);
  const [dailyNotes, setDailyNotes] = useState<string[]>([]);
  const [generalNotes, setGeneralNotes] = useState<string[]>([]);
  const [yesterdayNotes, setYesterdayNotes] = useState<string[]>([]);

  const processInput = () => {
    const code = input.slice(0, 2);
    const note = input.slice(2, input.length);
    switch (code) {
      case "/t":
        setTodoNotes([...todoNotes, note]);
        break;
      case "/d":
        setDailyNotes([...dailyNotes, note]);
        break;
      case "/g":
        setGeneralNotes([...generalNotes, note]);
        break;
      case "/y":
        setYesterdayNotes([...yesterdayNotes, note]);
        break;
    }
    setInput("");
  };

  const handleKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      processInput();
    }
  };

  const removeTodo = (note: string) => {
    console.log("remove todo");
    setTodoNotes(todoNotes.filter((x) => x !== note));
  };

  const removeDaily = (note: string) => {
    setDailyNotes(dailyNotes.filter((x) => x !== note));
  };

  const removeYesterday = (note: string) => {
    setYesterdayNotes(yesterdayNotes.filter((x) => x !== note));
  };

  const removeGeneral = (note: string) => {
    setGeneralNotes(generalNotes.filter((x) => x !== note));
  };

  return (
    <main className="flex-col max-w-full min-h-full max-h-screen bg-blue-500">
      <div className="flex-col grid grid-cols-1 h-screen">
        <div className="grid grid-cols-2 min-w-screen bg-blue-500 justify-between">
          <TodoWindow
            onSelect={removeTodo}
            notes={todoNotes}
            header={"Todo:"}
          ></TodoWindow>
          <TodoWindow
            onSelect={removeDaily}
            notes={dailyNotes}
            header={"Daily:"}
          ></TodoWindow>
          <TodoWindow
            onSelect={removeGeneral}
            notes={generalNotes}
            header={"General:"}
          ></TodoWindow>
          <TodoWindow
            onSelect={removeYesterday}
            notes={yesterdayNotes}
            header={"Yesterday:"}
          ></TodoWindow>
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
