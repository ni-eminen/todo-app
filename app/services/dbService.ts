import { Note } from "../types"
import axios from 'axios'

export const getNotes = async (): Promise<Note[]> => {
    const response = await axios.get('http://localhost:8080/notes')
    console.log(response.data)
    return response.data.data
}

export const createNote = async (newNote: Note): Promise<Note> => {
    const response = await axios.post('http://localhost:8080/notes', newNote)
    return response.data
}

export const patchNote = async (patchedNote: Note): Promise<Note> => {
    const response = await axios.patch('http://localhost:8080/notes', patchedNote)
    return response.data
}