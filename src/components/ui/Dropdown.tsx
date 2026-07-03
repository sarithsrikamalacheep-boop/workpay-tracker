import { ReactNode, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from './Button'

export function Dropdown({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setOpen((value) => !value)}>
        {label}<ChevronDown size={16} />
      </Button>
      {open ? <div className="absolute right-0 z-20 mt-2 min-w-48 rounded-xl border border-border bg-white p-2 shadow-xl">{children}</div> : null}
    </div>
  )
}

export function DropdownItem({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-muted">{children}</button>
}
