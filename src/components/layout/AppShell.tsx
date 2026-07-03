import { ReactNode } from 'react'
import { PageKey } from '../../types'
import { BottomNav } from './BottomNav'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

export function AppShell({ current, month, setMonth, onNavigate, children }: { current: PageKey; month: string; setMonth: (month: string) => void; onNavigate: (page: PageKey) => void; children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background lg:flex">
      <Sidebar current={current} onNavigate={onNavigate} />
      <div className="relative z-10 min-w-0 flex-1 pb-32 lg:pb-0">
        <Header current={current} month={month} setMonth={setMonth} onNavigate={onNavigate} />
        <main className="mx-auto w-full max-w-6xl p-4 sm:p-5 lg:p-8">{children}</main>
      </div>
      <BottomNav current={current} onNavigate={onNavigate} />
    </div>
  )
}
