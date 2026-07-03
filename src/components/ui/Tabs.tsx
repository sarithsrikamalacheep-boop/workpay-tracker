import { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function Tabs({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-4', className)}>{children}</div>
}

export function TabsList({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('inline-flex rounded-xl bg-muted p-1', className)}>{children}</div>
}

export function TabsTrigger({ active, children, onClick }: { active?: boolean; children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn('rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition', active && 'bg-white text-primary shadow-sm')}>
      {children}
    </button>
  )
}

export function TabsContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
