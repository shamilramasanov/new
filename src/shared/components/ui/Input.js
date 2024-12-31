import React from 'react';
import { colors } from '../../../core/theme/colors';
import { cn } from '../../../utils/cn';

export function Input({
  label,
  error,
  className,
  type = 'text',
  leftIcon,
  ...props
}) {
  const containerClassName = cn(
    className,
    'relative'
  );

  const inputClassName = cn(
    'block w-full px-4 py-2.5',
    'bg-white',
    'rounded-lg',
    'transition duration-200',
    'focus:outline-none focus:ring-2 focus:border-transparent',
    `border-[${colors.neutral[300]}]`,
    `text-[${colors.neutral[900]}]`,
    `placeholder-[${colors.neutral[400]}]`,
    `focus:ring-[${colors.primary.default}]`,
    error && [
      `border-[${colors.danger.default}]`,
      `focus:ring-[${colors.danger.default}]`
    ]
  );

  return (
    <div className={containerClassName}>
      {label && (
        <label className={cn(
          'block text-sm font-medium mb-1',
          `text-[${colors.neutral[700]}]`
        )}>
          {label}
        </label>
      )}
      <input
        type={type}
        {...props}
        className={inputClassName}
      />
      {leftIcon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {leftIcon}
        </div>
      )}
      {error && (
        <p className={cn(
          'mt-1 text-sm',
          `text-[${colors.danger.default}]`
        )}>
          {error}
        </p>
      )}
    </div>
  );
}
