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
        <div className="fixed bottom-28 right-4 z-50 w-52 rounded-[24px] border border-white/80 bg-white/95 p-2 shadow-2xl ring-1 ring-slate-200 backdrop-blur lg:hidden">
          {moreItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => {
                onNavigate(key)
                setOpen(false)
              }}
              className={`flex min-h-12 w-full items-center gap-3 rounded-2xl px-3 text-left font-bold ${current === key ? 'bg-blue-50 text-primary' : 'text-slate-600 hover:bg-muted'}`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </div>
      ) : null}
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-[26px] border border-white/80 bg-white/92 px-2 py-2 shadow-2xl ring-1 ring-slate-200/70 backdrop-blur-xl lg:hidden">
        {navItems.filter((item) => item.mobile).map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => { setOpen(false); onNavigate(key) }} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[18px] px-1 py-2 text-[11px] font-bold ${current === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>
            <Icon size={22} />
            <span className="truncate">{label}</span>
          </button>
        ))}
        <button onClick={() => setOpen((value) => !value)} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-[18px] px-1 py-2 text-[11px] font-bold ${moreActive || open ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-500'}`}>
          <MoreHorizontal size={22} />
          <span className="truncate">More</span>
        </button>
      </nav>
    </>
  )
}
