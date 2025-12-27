import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, className, checked, ...props }, ref) => {
    return (
      <label className="inline-flex cursor-pointer items-center gap-2">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            checked={checked}
            {...props}
          />
          <div
            className={cn(
              'h-6 w-11 rounded-full bg-gray-300 transition-all duration-200',
              'peer-checked:bg-primary-500',
              'peer-focus:ring-2 peer-focus:ring-primary-500 peer-focus:ring-offset-2',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
              className
            )}
          />
          <div
            className={cn(
              'absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-all duration-200',
              'peer-checked:translate-x-5'
            )}
          />
        </div>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    )
  }
)

Switch.displayName = 'Switch'
