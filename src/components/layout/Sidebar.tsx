import { BarChart3, CalendarDays, Home, PieChart, Settings, WalletCards } from 'lucide-react'
import { BrandMark } from '../brand/BrandMark'
import { IconBadge } from '../ui/IconBadge'
import { PageKey } from '../../types'

export const navItems: { key: PageKey; label: string; icon: typeof Home; mobile?: boolean }[] = [
  { key: 'home', label: 'Home', icon: Home, mobile: true },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, mobile: true },
  { key: 'budget', label: 'Budget', icon: PieChart, mobile: true },
  { key: 'monthly', label: 'Monthly', icon: WalletCards, mobile: true },
  { key: 'year', label: 'Year', icon: BarChart3, mobile: false },
  { key: 'settings', label: 'Settings', icon: Settings, mobile: false },
]

export function Sidebar({ current, onNavigate }: { current: PageKey; onNavigate: (page: PageKey) => void }) {
  return (
    <aside className="hidden w-80 shrink-0 border-r border-white/10 bg-gradient-to-b from-[#071b3d] via-[#0b2a55] to-[#0b1d3d] p-5 text-white lg:block">
      <div className="mb-8 rounded-[30px] bg-white/10 p-5 shadow-soft ring-1 ring-white/10">
        <BrandMark dark />
        <p className="mt-4 text-sm font-medium text-blue-100">Track your work. Understand your money. Plan your future.</p>
      </div>
      <nav className="space-y-2">
        {navItems.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onNavigate(key)}
            className={`flex min-h-16 w-full items-center gap-3 rounded-[22px] px-3 py-3 text-left text-base font-bold transition ${current === key ? 'bg-white text-navy shadow-lg' : 'text-blue-50 hover:bg-white/10 hover:text-white'}`}
          >
            <IconBadge
              icon={Icon}
              tone={current === key ? 'blue' : 'slate'}
              className={current === key ? 'bg-blue-100 text-blue-700 ring-blue-200' : 'bg-[#173f78] text-white ring-white/20 shadow-inner'}
            />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
