import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  className = '',
  onRowClick,
}: DataTableProps<T>) {
  const getCellValue = (row: T, column: Column<T>) => {
    if (column.render) {
      return column.render(row[column.key as keyof T], row);
    }
    return row[column.key as keyof T] || '';
  };

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full" style={{ borderSpacing: '0 0', borderCollapse: 'separate' }}>
        <thead>
          <tr className="border-b-2 border-[#965cdf]">
            {columns.map((column, index) => (
              <th
                key={String(column.key)}
                className={`text-left py-4 font-medium text-[16px] text-[#8f8f8f] leading-[24px] ${
                  index === 0 ? 'pl-6' : 'px-6'
                } ${index === columns.length - 1 ? 'pr-6' : ''}`}
                style={{ fontFamily: 'Roboto, sans-serif', paddingLeft: index === 0 ? '24px' : undefined, paddingRight: '24px' }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className={`h-[80px] border-b border-[rgba(255,255,255,0.1)] ${
                rowIndex % 2 === 0 ? 'bg-[rgba(255,255,255,0.05)]' : ''
              } hover:bg-[rgba(255,255,255,0.08)] transition ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={String(column.key)}
                  className={`text-white text-[14px] leading-[24px] ${
                    colIndex === 0 ? 'pl-6' : 'px-6'
                  } ${colIndex === columns.length - 1 ? 'pr-6' : ''}`}
                  style={{ fontFamily: 'Roboto, sans-serif', paddingLeft: colIndex === 0 ? '24px' : undefined, paddingRight: '24px' }}
                >
                  {getCellValue(row, column) as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

