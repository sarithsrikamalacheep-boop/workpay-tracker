import { PageKey } from '../../types'
import { Select } from '../ui/Select'
import { BrandMark } from '../brand/BrandMark'
import { navItems } from './Sidebar'

export function Header({ current, month, setMonth }: { current: PageKey; month: string; setMonth: (month: string) => void; onNavigate: (page: PageKey) => void }) {
  const title = navItems.find((item) => item.key === current)?.label ?? 'Home'
  const months = Array.from({ length: 12 }, (_, index) => `2026-${String(index + 1).padStart(2, '0')}`)
  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="lg:hidden"><BrandMark compact /></div>
          <div>
            <p className="hidden text-sm font-semibold uppercase tracking-wide text-primary sm:block">WorkPay Tracker</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Select month">
            {months.map((item) => <option key={item} value={item}>{item}</option>)}
          </Select>
        </div>
      </div>
    </header>
  )
}
