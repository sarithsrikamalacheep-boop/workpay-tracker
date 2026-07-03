import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children: ReactNode
}

export function Button({ variant = 'default', size = 'default', className = '', children, ...props }: Props) {
  const styles = {
    default: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
    primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    danger: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
    destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
  }
  const sizes = {
    default: 'min-h-12 px-5 py-3 text-base',
    sm: 'min-h-10 px-3 py-2 text-sm',
    lg: 'min-h-14 px-6 py-4 text-lg',
    icon: 'h-12 w-12 p-0',
  }
  return (
    <button
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', styles[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
