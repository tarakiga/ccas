import { SelectHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helperText, options, fullWidth = false, className, ...props },
    ref
  ) => {
    const selectStyles = cn(
      'h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
      'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500',
      error
        ? 'border-error-500 focus:ring-error-500'
        : 'border-gray-300 hover:border-gray-400',
      className
    )

    return (
      <div className={cn('relative', fullWidth && 'w-full')}>
        {label && (
          <label className="mb-1 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <select ref={ref} className={selectStyles} {...props}>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="mt-1 text-xs text-error-500 animate-slideInDown">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
