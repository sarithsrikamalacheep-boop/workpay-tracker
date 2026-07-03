import { ReactNode, useEffect, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { loadData, saveData } from './data/storage'
import { PageKey } from './types'
import { Dashboard } from './pages/Dashboard'
import { CalendarPage } from './pages/Calendar'
import { Budget } from './pages/Budget'
import { MonthlySummary } from './pages/MonthlySummary'
import { YtdSummary } from './pages/YtdSummary'
import { Settings } from './pages/Settings'

export default function App() {
  const [data, setDataState] = useState(loadData)
  const [page, setPage] = useState<PageKey>('home')
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7))
  const [toast, setToast] = useState('')

  const setData = (next: typeof data) => {
    setDataState(next)
    saveData(next)
  }

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => saveData(data), [data])

  const props = { data, setData, month, setMonth, notify }
  const pages: Record<PageKey, ReactNode> = {
    home: <Dashboard {...props} onNavigate={setPage} />,
    calendar: <CalendarPage {...props} />,
    budget: <Budget {...props} onNavigate={setPage} />,
    monthly: <MonthlySummary {...props} />,
    year: <YtdSummary {...props} />,
    settings: <Settings {...props} />,
  }

  return (
    <AppShell current={page} month={month} setMonth={setMonth} onNavigate={setPage}>
      {pages[page]}
      {toast ? <div className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-navy px-5 py-4 text-base font-bold text-white shadow-2xl lg:bottom-6">{toast}</div> : null}
    </AppShell>
  )
}
