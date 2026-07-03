import { MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { PageKey } from '../../types'
import { navItems } from './Sidebar'

export function BottomNav({ current, onNavigate }: { current: PageKey; onNavigate: (page: PageKey) => void }) {
  const [open, setOpen] = useState(false)
  const moreItems = navItems.filter((item) => !item.mobile)
  const moreActive = moreItems.some((item) => item.key === current)
  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-3 z-50 w-48 rounded-[22px] border border-white/80 bg-white/95 p-2 shadow-2xl ring-1 ring-slate-200 backdrop-blur lg:hidden">
          {moreItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                onNavigate(key)
                setOpen(false)
              }}
              className={`flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-left text-sm font-bold ${current === key ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-muted'}`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <nav className="fixed inset-x-2 bottom-2 z-40 grid grid-cols-5 rounded-[22px] border border-white/80 bg-white/92 px-1.5 py-1.5 shadow-2xl ring-1 ring-slate-200/70 backdrop-blur-xl lg:hidden">
        {navItems.filter((item) => item.mobile).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setOpen(false); onNavigate(key) }} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[16px] px-1 py-1.5 text-[10px] font-bold ${current === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>
            <Icon size={20} />
            <span className="truncate">{label}</span>
          </button>
        ))}
        <button onClick={() => setOpen((value) => !value)} className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[16px] px-1 py-1.5 text-[10px] font-bold ${moreActive || open ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>
          <MoreHorizontal size={20} />
          <span className="truncate">More</span>
        </button>
      </nav>
    </>
  )
}
