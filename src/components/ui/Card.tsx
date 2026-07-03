import { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={cn('rounded-[24px] border border-white/80 bg-card/95 p-5 text-card-foreground shadow-soft ring-1 ring-slate-200/50 backdrop-blur sm:p-6', className)}>{children}</section>
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-5 flex flex-col gap-1.5', className)}>{children}</div>
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-xl font-black tracking-tight text-slate-950', className)}>{children}</h3>
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
