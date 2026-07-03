import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { Button } from './Button'

export function Dialog({ open, title, description, children, onClose }: { open: boolean; title: string; description?: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className={cn('max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[32px] border border-white/80 bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:rounded-[28px] sm:p-6')}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close dialog"><X size={20} /></Button>
        </div>
        {children}
      </div>
    </div>
  )
}
