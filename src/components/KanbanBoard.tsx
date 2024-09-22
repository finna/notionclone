import React, { useState } from 'react';

interface KanbanCard {
  id: string;
  content: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
}

interface KanbanBoardProps {
  initialData?: KanbanColumn[];
}

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumn[]>(
    initialData || [
      { id: 'todo', title: 'To Do', cards: [] },
      { id: 'inprogress', title: 'In Progress', cards: [] },
      { id: 'done', title: 'Done', cards: [] },
    ]
  );

  const [newCardContent, setNewCardContent] = useState<string>('');

  const addCard = (columnId: string) => {
    if (!newCardContent.trim()) return;

    const newCard: KanbanCard = {
      id: Date.now().toString(),
      content: newCardContent,
    };

    setColumns(columns.map(col => 
      col.id === columnId 
        ? { ...col, cards: [...col.cards, newCard] }
        : col
    ));

    setNewCardContent('');
  };

  const moveCard = (cardId: string, fromColumn: string, toColumn: string) => {
    setColumns(columns.map(col => {
      if (col.id === fromColumn) {
        return { ...col, cards: col.cards.filter(card => card.id !== cardId) };
      }
      if (col.id === toColumn) {
        const [movedCard] = columns.find(c => c.id === fromColumn)!.cards.filter(card => card.id === cardId);
        return { ...col, cards: [...col.cards, movedCard] };
      }
      return col;
    }));
  };

  const updateCardContent = (columnId: string, cardId: string, newContent: string) => {
    setColumns(columns.map(col => 
      col.id === columnId
        ? {
            ...col,
            cards: col.cards.map(card => 
              card.id === cardId
                ? { ...card, content: newContent }
                : card
            )
          }
        : col
    ));
  };

  return (
    <div className="flex space-x-4">
      {columns.map(column => (
        <div key={column.id} className="bg-gray-100 p-4 rounded-lg w-64">
          <h3 className="font-bold mb-2">{column.title}</h3>
          {column.cards.map(card => (
            <div key={card.id} className="bg-white p-2 mb-2 rounded shadow">
              <textarea
                value={card.content}
                onChange={(e) => updateCardContent(column.id, card.id, e.target.value)}
                className="w-full p-1 border rounded"
              />
              <div className="flex justify-end mt-2">
                {column.id !== 'todo' && (
                  <button onClick={() => moveCard(card.id, column.id, columns[columns.findIndex(col => col.id === column.id) - 1].id)} className="text-sm text-blue-500">←</button>
                )}
                {column.id !== 'done' && (
                  <button onClick={() => moveCard(card.id, column.id, columns[columns.findIndex(col => col.id === column.id) + 1].id)} className="text-sm text-blue-500 ml-2">→</button>
                )}
              </div>
            </div>
          ))}
          <input
            type="text"
            value={newCardContent}
            onChange={(e) => setNewCardContent(e.target.value)}
            placeholder="New card"
            className="w-full p-2 border rounded"
          />
          <button onClick={() => addCard(column.id)} className="mt-2 bg-blue-500 text-white p-2 rounded w-full">
            Add Card
          </button>
        </div>
      ))}
    </div>
  );
}