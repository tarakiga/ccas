import { cn } from '@/lib/utils'

export interface AvatarProps {
  src?: string
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  status?: 'online' | 'offline' | 'away' | 'busy'
  className?: string
}

export function Avatar({ src, alt, name, size = 'md', status, className }: AvatarProps) {
  const sizeStyles = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
    xl: 'h-16 w-16 text-lg',
  }

  const statusStyles = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
  }

  const statusSizeStyles = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-700 font-medium',
          sizeStyles[size]
        )}
      >
        {src ? (
          <img src={src} alt={alt || name} className="h-full w-full object-cover" />
        ) : name ? (
          <span>{getInitials(name)}</span>
        ) : (
          <svg className="h-full w-full text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full border-2 border-white',
            statusStyles[status],
            statusSizeStyles[size]
          )}
        />
      )}
    </div>
  )
}
