import React, { useState } from 'react';

interface SpreadsheetProps {
  initialData?: string[][];
  rows?: number;
  cols?: number;
}

export function Spreadsheet({ initialData, rows = 10, cols = 5 }: SpreadsheetProps) {
  const [data, setData] = useState<string[][]>(() => {
    if (initialData) return initialData;
    return Array(rows).fill(null).map(() => Array(cols).fill(''));
  });

  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = data.map((row, rIndex) =>
      rIndex === rowIndex
        ? row.map((cell, cIndex) => (cIndex === colIndex ? value : cell))
        : row
    );
    setData(newData);
  };

  return (
    <table className="w-full border-collapse">
      <tbody>
        {data.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, colIndex) => (
              <td key={colIndex} className="border border-gray-300 p-1">
                <input
                  type="text"
                  value={cell}
                  onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                  className="w-full h-full outline-none"
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}