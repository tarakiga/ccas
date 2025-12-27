'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export interface DropdownItem {
  id: string
  label: string
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  divider?: boolean
  className?: string
}

export interface DropdownProps {
  trigger: ReactNode
  items: DropdownItem[]
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, items, align = 'left', className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled) {
      item.onClick?.()
      setIsOpen(false)
    }
  }

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[12rem] rounded-lg border border-gray-200 bg-white py-1 shadow-lg',
            'animate-slideInDown',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item) => (
            <div key={item.id}>
              {item.divider ? (
                <div className="my-1 border-t border-gray-200" />
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
                    item.disabled
                      ? 'cursor-not-allowed text-gray-400'
                      : 'text-gray-700 hover:bg-gray-100',
                    item.className
                  )}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
