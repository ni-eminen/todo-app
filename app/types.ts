export interface Note {
    body: string;
    id: string;
    timestamp: number;
    category: string;
    selected: boolean;
    selectedTimestamp: number;
    archived: boolean;
  }
  
export interface TodoWindowProps {
header: string;
notes: Note[];
onSelect: (note: Note) => void;
onDelete: (note: Note) => void;
onArchive: (note: Note) => void;
shorthand: string;
}