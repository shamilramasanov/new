import React from 'react';
import { colors } from '../../../core/theme/colors';
import { cn } from '../../../utils/cn';

export function Card({ 
  children, 
  title,
  action,
  padding = 'normal',
  className,
}) {
  const paddingStyles = {
    small: 'p-3',
    normal: 'p-4',
    large: 'p-6',
  };

  return (
    <div 
      className={cn(
        'bg-white rounded-xl shadow-sm border',
        `border-[${colors.neutral[200]}]`,
        paddingStyles[padding],
        className
      )}
    >
      {(title || action) && (
        <div className="flex justify-between items-center mb-4">
          {title && (
            <h3 className={cn(
              'text-lg font-semibold',
              `text-[${colors.neutral[900]}]`
            )}>
              {title}
            </h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
