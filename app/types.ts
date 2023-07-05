export interface Note {
    body: string;
    id: string;
    timestamp: number;
    category: string;
    selected: boolean;
  }
  
export interface TodoWindowProps {
header: string;
notes: Note[];
onSelect: (str: Note) => void;
onDelete: (str: Note) => void;
shorthand: string;
}