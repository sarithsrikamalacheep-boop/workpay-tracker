import { addMonths, eachDayOfInterval, endOfMonth, format, getDay, isToday, parseISO, startOfMonth } from 'date-fns'
import { ChevronLeft, ChevronRight, Copy, Minus, Plus, Save, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { Input, Textarea } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { DailyWorkLog } from '../types'
import { calculateDailyOtIncome, getSalaryForMonth, summarizeMonth } from '../utils/calculations'
import { cn } from '../utils/cn'
import { thaiDate } from '../utils/dateUtils'
import { money, numberText } from '../utils/format'
import { PageProps } from './pageTypes'

function multiplierFor(type: DailyWorkLog['otType'], data: PageProps['data']) {
  if (type === 'holiday') return data.settings.otMultiplier2
  if (type === 'special') return data.settings.otMultiplier3
  return data.settings.otMultiplier1
}

function makeLog(date: string, data: PageProps['data']): DailyWorkLog {
  return {
    id: crypto.randomUUID(),
    date,
    isWorkday: true,
    isHoliday: false,
    otHours: 0,
    otType: 'weekday',
    otMultiplier: data.settings.otMultiplier1,
    workNote: '',
    workTags: [],
    workloadLevel: 'normal',
    mood: 'normal',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function dayTone(hours?: number) {
  if (!hours) return 'bg-white hover:bg-slate-50'
  if (hours <= 1.5) return 'bg-emerald-50 hover:bg-emerald-100'
  if (hours <= 3) return 'bg-amber-50 hover:bg-amber-100'
  return 'bg-red-50 hover:bg-red-100'
}

export function CalendarPage({ data, setData, month, setMonth, notify }: PageProps) {
  const [editing, setEditing] = useState<DailyWorkLog | null>(null)
  const [weekHours, setWeekHours] = useState(1)
  const [weekType, setWeekType] = useState<DailyWorkLog['otType']>('weekday')
  const [weekNote, setWeekNote] = useState('')
  const summary = summarizeMonth(data, month)
  const logsByDate = useMemo(() => new Map(data.dailyLogs.map((log) => [log.date, log])), [data.dailyLogs])
  const monthStart = startOfMonth(parseISO(`${month}-01`))
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) })
  const leadingBlanks = Array.from({ length: getDay(monthStart) })
  const monthSalary = getSalaryForMonth(month, data.salaryHistory, data.settings.currentSalary)
  const selectedSalary = editing ? getSalaryForMonth(editing.date.slice(0, 7), data.salaryHistory, data.settings.currentSalary) : monthSalary
  const selectedOt = editing ? calculateDailyOtIncome(editing, selectedSalary, data.settings) : undefined
  const previousLoggedDay = editing ? data.dailyLogs.filter((log) => log.date < editing.date).sort((a, b) => b.date.localeCompare(a.date))[0] : undefined

  const move = (delta: number) => setMonth(format(addMonths(monthStart, delta), 'yyyy-MM'))
  const openDay = (date: string) => setEditing(logsByDate.get(date) ?? makeLog(date, data))
  const set = <K extends keyof DailyWorkLog>(key: K, value: DailyWorkLog[K]) => editing && setEditing({ ...editing, [key]: value, updatedAt: new Date().toISOString() })
  const setType = (type: DailyWorkLog['otType']) => editing && setEditing({ ...editing, otType: type, otMultiplier: multiplierFor(type, data), isHoliday: type === 'holiday', updatedAt: new Date().toISOString() })

  const saveLog = (override?: DailyWorkLog) => {
    const log = override ?? editing
    if (!log) return
    const exists = data.dailyLogs.some((item) => item.id === log.id)
    setData({ ...data, dailyLogs: exists ? data.dailyLogs.map((item) => item.id === log.id ? log : item) : [...data.dailyLogs, log] })
    setEditing(null)
    notify('Saved successfully')
  }

  const deleteLog = () => {
    if (!editing) return
    if (!window.confirm('Are you sure you want to delete this record?')) return
    setData({ ...data, dailyLogs: data.dailyLogs.filter((log) => log.id !== editing.id) })
    setEditing(null)
    notify('Record deleted')
  }

  const copyPrevious = () => {
    if (!editing || !previousLoggedDay) return
    setEditing({
      ...editing,
      otHours: previousLoggedDay.otHours,
      otType: previousLoggedDay.otType,
      otMultiplier: previousLoggedDay.otMultiplier,
      workNote: previousLoggedDay.workNote,
      updatedAt: new Date().toISOString(),
    })
  }

  const fillWeekdays = () => {
    const nextLogs = [...data.dailyLogs]
    eachDayOfInterval({ start: monthStart, end: endOfMonth(monthStart) }).forEach((day) => {
      const weekday = getDay(day)
      if (weekday === 0 || weekday === 6) return
      const date = format(day, 'yyyy-MM-dd')
      const existingIndex = nextLogs.findIndex((log) => log.date === date)
      const base = existingIndex >= 0 ? nextLogs[existingIndex] : makeLog(date, data)
      const updated = { ...base, otHours: weekHours, otType: weekType, otMultiplier: multiplierFor(weekType, data), workNote: weekNote, updatedAt: new Date().toISOString() }
      if (existingIndex >= 0) nextLogs[existingIndex] = updated
      else nextLogs.push(updated)
    })
    setData({ ...data, dailyLogs: nextLogs })
    notify('Weekdays saved')
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">OT Calendar</h2>
          <p className="mt-2 text-muted-foreground">Tap a date to log OT hours, add a note, and see the daily total.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => move(-1)}><ChevronLeft size={20} /></Button>
          <Input className="w-40 font-bold" type="month" value={month} onChange={(event) => setMonth(event.target.value)} aria-label="Select month" />
          <Button variant="outline" size="icon" onClick={() => move(1)}><ChevronRight size={20} /></Button>
        </div>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-[#071b3d] via-[#0f4ed8] to-[#2f7cff] text-white shadow-glow">
        <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <CardHeader>
          <CardTitle className="text-white">Monthly Overview</CardTitle>
          <CardDescription className="text-blue-100">OT totals include OT pay, meal allowance, and transport allowance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div><p className="text-blue-100">This Month's Income</p><p className="mt-1 text-3xl font-bold">{money(summary.grossIncome, data.settings)}</p></div>
            <div><p className="text-blue-100">Total OT Hours</p><p className="mt-1 text-3xl font-bold">{numberText(summary.otHours)} hrs</p></div>
            <div><p className="text-blue-100">OT Days</p><p className="mt-1 text-3xl font-bold">{summary.otDayCount} days</p></div>
            <div><p className="text-blue-100">Total OT Income</p><p className="mt-1 text-3xl font-bold">{money(summary.otIncome, data.settings)}</p></div>
          </div>
        </CardContent>
      </Card>

      <details className="rounded-[26px] border border-white/80 bg-white/95 p-5 shadow-soft ring-1 ring-slate-200/50">
        <summary className="cursor-pointer text-xl font-bold text-slate-950">Quick Fill Weekdays</summary>
        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
          <label className="text-sm font-semibold text-slate-700">Monday to Friday OT<Input type="number" min="0" step="0.5" value={weekHours} onChange={(event) => setWeekHours(Number(event.target.value))} /></label>
          <label className="text-sm font-semibold text-slate-700">OT Type<Select value={weekType} onChange={(event) => setWeekType(event.target.value as DailyWorkLog['otType'])}><option value="weekday">1.5x OT</option><option value="holiday">2x OT</option><option value="special">3x OT</option></Select></label>
          <label className="text-sm font-semibold text-slate-700">Work Note<Input value={weekNote} onChange={(event) => setWeekNote(event.target.value)} placeholder="e.g. support line" /></label>
          <Button onClick={fillWeekdays}>Save Weekdays</Button>
        </div>
      </details>

      <Card>
        <div className="mb-3 grid grid-cols-7 gap-2 text-center text-sm font-bold text-muted-foreground">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day}>{day}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {leadingBlanks.map((_, index) => <div key={`blank-${index}`} className="min-h-24 rounded-2xl bg-transparent" />)}
          {days.map((day) => {
            const date = format(day, 'yyyy-MM-dd')
            const log = logsByDate.get(date)
            const pay = log ? calculateDailyOtIncome(log, monthSalary, data.settings).totalOtIncome : 0
            const selected = editing?.date === date
            return (
              <button
                key={date}
                onClick={() => openDay(date)}
                className={cn(
                  'min-h-28 rounded-[24px] border p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring md:min-h-32',
                  dayTone(log?.otHours),
                  isToday(day) ? 'border-blue-500 ring-2 ring-blue-100' : 'border-border',
                  selected && 'border-navy ring-2 ring-navy/20',
                )}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xl font-bold text-slate-950">{format(day, 'd')}</span>
                  {log?.workNote ? <span className="h-2.5 w-2.5 rounded-full bg-purple-500" title="Has note" /> : null}
                </div>
                {log ? (
                  <div className="mt-3 space-y-1">
                    <p className="text-base font-bold text-slate-800">OT {numberText(log.otHours)} hrs</p>
                    <p className="text-sm font-semibold text-emerald-700">{money(pay, data.settings)}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm font-medium text-muted-foreground">Tap to log</p>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <Dialog open={!!editing} title={editing ? `Log OT for ${thaiDate(editing.date)}` : ''} description="Daily total includes OT pay, meal allowance, and transport allowance." onClose={() => setEditing(null)}>
        {editing ? (
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">OT Hours</p>
              <div className="grid grid-cols-[56px_1fr_56px] items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => set('otHours', Math.max(0, editing.otHours - 0.5))}><Minus size={22} /></Button>
                <div className="rounded-2xl bg-blue-50 py-5 text-center text-5xl font-bold tracking-tight text-primary">{numberText(editing.otHours)}</div>
                <Button variant="outline" size="icon" onClick={() => set('otHours', editing.otHours + 0.5)}><Plus size={22} /></Button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((hour) => <Button key={hour} variant={editing.otHours === hour ? 'default' : 'outline'} size="sm" onClick={() => set('otHours', hour)}>{hour} hrs</Button>)}
              </div>
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">OT Type</p>
              <div className="grid grid-cols-3 gap-2">
                {[['weekday', '1.5x OT'], ['holiday', '2x OT'], ['special', '3x OT']].map(([value, label]) => (
                  <Button key={value} variant={editing.otType === value ? 'default' : 'outline'} onClick={() => setType(value as DailyWorkLog['otType'])}>{label}</Button>
                ))}
              </div>
            </div>

            <label className="block text-sm font-semibold text-slate-700">Work Note<Textarea value={editing.workNote} onChange={(event) => set('workNote', event.target.value)} placeholder="What did you work on? e.g. report, support line, meeting" /></label>

            <div className="rounded-[24px] bg-emerald-50 p-4">
              <p className="text-base font-bold text-emerald-800">Today's Calculation</p>
              <div className="mt-3 space-y-2 text-sm text-emerald-950">
                <p className="flex justify-between gap-3"><span>Hourly Rate</span><b>{money(selectedOt?.hourlyRate ?? 0, data.settings)}</b></p>
                <p className="flex justify-between gap-3"><span>OT Pay</span><b>{money(selectedOt?.otBasePay ?? 0, data.settings)}</b></p>
                <p className="flex justify-between gap-3"><span>Meal Allowance</span><b>{money(selectedOt?.mealAllowance ?? 0, data.settings)}</b></p>
                <p className="flex justify-between gap-3"><span>Transport Allowance</span><b>{money(selectedOt?.transportAllowance ?? 0, data.settings)}</b></p>
              </div>
              <p className="mt-3 border-t border-emerald-200 pt-3 text-3xl font-bold text-emerald-800">Today's Total {money(selectedOt?.totalOtIncome ?? 0, data.settings)}</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={copyPrevious} disabled={!previousLoggedDay}><Copy size={18} />Use Previous Logged Day</Button>
              <Button variant="secondary" onClick={() => saveLog({ ...editing, otHours: 0, updatedAt: new Date().toISOString() })}>No OT Today</Button>
            </div>

            <div className="sticky bottom-0 -mx-6 -mb-6 grid gap-2 border-t border-border bg-white p-6 sm:grid-cols-3">
              <Button size="lg" onClick={() => saveLog()}><Save size={20} />Save</Button>
              <Button size="lg" variant="destructive" onClick={deleteLog}><Trash2 size={20} />Delete This Day</Button>
              <Button size="lg" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  )
}
