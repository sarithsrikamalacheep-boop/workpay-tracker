import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

export function Dialog({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className={cn('max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[28px] border border-white/80 bg-white p-4 shadow-2xl ring-1 ring-slate-200 sm:rounded-[28px] sm:p-6')}>
        <div className="mb-4 flex items-start justify-between gap-4 sm:mb-5">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h2>
            {description ? <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog"><X size={20} /></Button>
        </div>
        {children}
      </div>
    </div>
  )
}
