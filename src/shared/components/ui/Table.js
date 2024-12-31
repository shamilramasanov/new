import React from 'react';
import { colors } from '../../../core/theme/colors';
import { cn } from '../../../utils/cn';

export function Table({ columns, data, onRowClick, emptyMessage = 'Немає даних' }) {
  if (!data || data.length === 0) {
    return (
      <div className={cn(
        'text-center py-8',
        `text-[${colors.neutral[500]}]`
      )}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className={cn(
        'min-w-full divide-y',
        `divide-[${colors.neutral[200]}]`
      )}>
        <thead className={`bg-[${colors.neutral[50]}]`}>
          <tr>
            {columns.map((column, index) => (
              <th
                key={column.key || index}
                className={cn(
                  'px-6 py-3',
                  'text-left text-xs font-medium',
                  'uppercase tracking-wider',
                  `text-[${colors.neutral[500]}]`,
                  column.className
                )}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={cn(
          'bg-white divide-y',
          `divide-[${colors.neutral[200]}]`
        )}>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick?.(row)}
              className={cn(
                'transition-colors duration-150',
                onRowClick && [
                  'cursor-pointer',
                  `hover:bg-[${colors.neutral[50]}]`
                ]
              )}
            >
              {columns.map((column, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    'px-6 py-4 text-sm',
                    `text-[${colors.neutral[900]}]`,
                    column.className
                  )}
                >
                  {column.render
                    ? column.render(row[column.key], row)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
