import { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[32px] border border-white/80 bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:rounded-[28px] sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight text-slate-950">{title}</h2>
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Close"><X size={20} /></Button>
        </div>
        {children}
      </div>
    </div>
  )
}
