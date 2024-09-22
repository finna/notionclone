"use client"

import React, { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ChevronRight, ChevronDown, File, Folder, Plus, FileText, Grid, Trello } from 'lucide-react'
import { Spreadsheet } from './Spreadsheet'
import { KanbanBoard } from './KanbanBoard'

// Update the NoteItem type to include noteType
type NoteItem = {
  id: string
  name: string
  type: 'file' | 'folder'
  noteType?: 'regular' | 'table' | 'kanban'
  children?: NoteItem[]
  content?: string | string[][] | KanbanColumn[]
}

// Sample data structure
const initialNotes: NoteItem[] = [
  {
    id: '1',
    name: 'Work',
    type: 'folder',
    children: [
      { id: '2', name: 'Project A', type: 'file', noteType: 'regular' },
      { id: '3', name: 'Project B', type: 'file', noteType: 'table' },
    ],
  },
  {
    id: '4',
    name: 'Personal',
    type: 'folder',
    children: [
      { id: '5', name: 'Journal', type: 'file', noteType: 'regular' },
      { id: '6', name: 'Travel Plans', type: 'file', noteType: 'kanban' },
    ],
  },
  { id: '7', name: 'Shopping List', type: 'file', noteType: 'regular' },
]

export function NotionCloneComponent() {
  const [notes, setNotes] = useState<NoteItem[]>(initialNotes)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [selectedNote, setSelectedNote] = useState<string | null>(null)
  const [newItemName, setNewItemName] = useState<string>('')
  const [activeNote, setActiveNote] = useState<NoteItem | null>(null)
  const [activeNoteType, setActiveNoteType] = useState<'regular' | 'table' | 'kanban' | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    onUpdate: ({ editor }) => {
      if (activeNote) {
        updateNoteContent(activeNote.id, editor.getHTML())
      }
    },
  })

  const toggleFolder = (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering selection
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const selectItem = (id: string) => {
    setSelectedNote(id)
    const note = findNoteById(notes, id)
    if (note && note.type === 'file') {
      setActiveNote(note)
      setActiveNoteType(note.noteType || 'regular')
      editor?.commands.setContent(note.content || '')
    } else {
      setActiveNote(null)
      setActiveNoteType(null)
      editor?.commands.setContent('')
    }
  }

  const findNoteById = (items: NoteItem[], id: string): NoteItem | null => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findNoteById(item.children, id)
        if (found) return found
      }
    }
    return null
  }

  const updateNoteContent = (id: string, content: string | string[][] | KanbanColumn[]) => {
    setNotes((prevNotes) => updateNoteContentHelper(prevNotes, id, content))
  }

  const updateNoteContentHelper = (items: NoteItem[], id: string, content: string | string[][] | KanbanColumn[]): NoteItem[] => {
    return items.map((item) => {
      if (item.id === id) {
        return { ...item, content }
      }
      if (item.children) {
        return { ...item, children: updateNoteContentHelper(item.children, id, content) }
      }
      return item
    })
  }

  const addNewItem = (type: 'folder' | 'file') => {
    if (!newItemName.trim()) return;

    const newItem: NoteItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: type,
      noteType: type === 'file' ? 'regular' : undefined,
      children: type === 'folder' ? [] : undefined,
      content: type === 'file' ? '' : undefined,
    };

    setNotes((prevNotes) => {
      if (selectedNote) {
        return addItemToSelected(prevNotes, selectedNote, newItem);
      } else {
        return [...prevNotes, newItem];
      }
    });

    setNewItemName('');
    if (type === 'folder') {
      setExpandedFolders((prev) => new Set([...prev, selectedNote as string]));
    } else {
      selectItem(newItem.id);
    }
  };

  const addItemToSelected = (notes: NoteItem[], selectedId: string, newItem: NoteItem): NoteItem[] => {
    return notes.map((note) => {
      if (note.id === selectedId && note.type === 'folder') {
        return { ...note, children: [...(note.children || []), newItem] };
      } else if (note.children) {
        return { ...note, children: addItemToSelected(note.children, selectedId, newItem) };
      }
      return note;
    });
  };

  const changeNoteType = (noteType: 'regular' | 'table' | 'kanban') => {
    if (activeNote) {
      setActiveNoteType(noteType)
      updateNoteType(activeNote.id, noteType)
    }
  }

  const updateNoteType = (id: string, noteType: 'regular' | 'table' | 'kanban') => {
    setNotes((prevNotes) => updateNoteTypeHelper(prevNotes, id, noteType))
  }

  const updateNoteTypeHelper = (items: NoteItem[], id: string, noteType: 'regular' | 'table' | 'kanban'): NoteItem[] => {
    return items.map((item) => {
      if (item.id === id) {
        return { ...item, noteType }
      }
      if (item.children) {
        return { ...item, children: updateNoteTypeHelper(item.children, id, noteType) }
      }
      return item
    })
  }

  const renderNoteItem = (item: NoteItem) => {
    const isExpanded = expandedFolders.has(item.id)
    const isSelected = selectedNote === item.id

    return (
      <div key={item.id} className="ml-4">
        <div
          className={`flex items-center cursor-pointer p-1 rounded text-black ${
            isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
          onClick={() => selectItem(item.id)}
        >
          {item.type === 'folder' && (
            <span className="mr-1" onClick={(e) => toggleFolder(item.id, e)}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          {item.type === 'folder' ? <Folder size={16} className="mr-2" /> : <File size={16} className="mr-2" />}
          <span className="text-black">{item.name}</span>
        </div>
        {item.type === 'folder' && isExpanded && item.children && (
          <div className="ml-4">
            {item.children.map(renderNoteItem)}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white text-black">
      {/* Sidebar */}
      <div className="w-64 border-r overflow-y-auto flex flex-col">
        <div className="p-4 flex-grow">
          <h2 className="text-lg font-semibold mb-4 text-black">Notes</h2>
          {notes.map(renderNoteItem)}
        </div>
        <div className="p-4 border-t">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="New item name"
            className="w-full p-2 border rounded mb-2"
          />
          <div className="flex space-x-2">
            <button
              onClick={() => addNewItem('folder')}
              className="flex-1 bg-blue-500 text-white p-2 rounded flex items-center justify-center"
            >
              <Folder size={16} className="mr-2" /> Add Folder
            </button>
            <button
              onClick={() => addNewItem('file')}
              className="flex-1 bg-green-500 text-white p-2 rounded flex items-center justify-center"
            >
              <File size={16} className="mr-2" /> Add Note
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeNote ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{activeNote.name}</h2>
              <div className="space-x-2">
                <button
                  onClick={() => changeNoteType('regular')}
                  className={`p-2 rounded ${activeNoteType === 'regular' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <FileText size={20} />
                </button>
                <button
                  onClick={() => changeNoteType('table')}
                  className={`p-2 rounded ${activeNoteType === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => changeNoteType('kanban')}
                  className={`p-2 rounded ${activeNoteType === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  <Trello size={20} />
                </button>
              </div>
            </div>
            {activeNoteType === 'regular' && (
              <EditorContent editor={editor} className="prose max-w-none text-black" />
            )}
            {activeNoteType === 'table' && (
              <Spreadsheet
                initialData={Array.isArray(activeNote.content) ? activeNote.content as string[][] : undefined}
                rows={10}
                cols={5}
              />
            )}
            {activeNoteType === 'kanban' && (
              <KanbanBoard
                initialData={Array.isArray(activeNote.content) ? activeNote.content as KanbanColumn[] : undefined}
              />
            )}
          </>
        ) : (
          <p className="text-gray-500">Select a note to edit</p>
        )}
      </div>
    </div>
  )
}