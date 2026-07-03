import { useState } from 'react'
import { Minus, Plus, Save, Trash2 } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Dialog } from '../components/ui/Dialog'
import { Input, Textarea } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { DailyWorkLog } from '../types'
import { calculateOtPay, dailyRowsForMonth, getSalaryForMonth } from '../utils/calculations'
import { thaiDate } from '../utils/dateUtils'
import { money, numberText } from '../utils/format'
import { PageProps } from './pageTypes'

function makeLog(data: PageProps['data']): DailyWorkLog {
  return {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    isWorkday: true,
    isHoliday: false,
    otHours: 1,
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

export function DailyLog({ data, setData, notify, onNavigate }: PageProps) {
  const [editing, setEditing] = useState<DailyWorkLog>(() => makeLog(data))
  const [deleteTarget, setDeleteTarget] = useState<DailyWorkLog | null>(null)
  const recentRows = data.dailyLogs.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  const salary = getSalaryForMonth(editing.date.slice(0, 7), data.salaryHistory, data.settings.currentSalary)
  const estimate = calculateOtPay(editing, salary, data.settings)
  const exists = data.dailyLogs.some((log) => log.id === editing.id)

  const set = <K extends keyof DailyWorkLog>(key: K, value: DailyWorkLog[K]) => setEditing({ ...editing, [key]: value, updatedAt: new Date().toISOString() })
  const setType = (type: DailyWorkLog['otType']) => {
    const otMultiplier = type === 'holiday' ? data.settings.otMultiplier2 : type === 'special' ? data.settings.otMultiplier3 : data.settings.otMultiplier1
    setEditing({ ...editing, otType: type, otMultiplier, isHoliday: type === 'holiday', updatedAt: new Date().toISOString() })
  }
  const save = () => {
    setData({ ...data, dailyLogs: exists ? data.dailyLogs.map((log) => log.id === editing.id ? editing : log) : [editing, ...data.dailyLogs] })
    notify('OT record saved')
    setEditing(makeLog(data))
    onNavigate?.('home')
  }
  const confirmDelete = () => {
    if (!deleteTarget) return
    setData({ ...data, dailyLogs: data.dailyLogs.filter((log) => log.id !== deleteTarget.id) })
    setDeleteTarget(null)
    setEditing(makeLog(data))
    notify('OT record deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Add OT Record</h2>
          <p className="mt-2 text-muted-foreground">Fast daily entry with a clear income estimate.</p>
        </div>
        <Button variant="outline" onClick={() => setEditing(makeLog(data))}>New blank record</Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>OT details</CardTitle>
            <CardDescription>Only the essentials: date, hours, type, and a short note.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <label className="block text-sm font-semibold text-slate-700">Date<Input type="date" value={editing.date} onChange={(event) => set('date', event.target.value)} /></label>

            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">OT hours</p>
              <div className="grid grid-cols-[56px_1fr_56px] items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => set('otHours', Math.max(0, editing.otHours - 0.5))}><Minus size={22} /></Button>
                <div className="rounded-2xl bg-blue-50 py-5 text-center text-5xl font-bold tracking-tight text-primary">{numberText(editing.otHours)}</div>
                <Button variant="outline" size="icon" onClick={() => set('otHours', editing.otHours + 0.5)}><Plus size={22} /></Button>
              </div>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {[0, 1, 2, 3, 4].map((hour) => <Button key={hour} variant={editing.otHours === hour ? 'default' : 'outline'} size="sm" onClick={() => set('otHours', hour)}>{hour}h</Button>)}
              </div>
            </div>

            <label className="block text-sm font-semibold text-slate-700">OT type<Select value={editing.otType} onChange={(event) => setType(event.target.value as DailyWorkLog['otType'])}><option value="weekday">Weekday</option><option value="holiday">Holiday</option><option value="special">Special</option></Select></label>
            <label className="block text-sm font-semibold text-slate-700">Work note<Textarea value={editing.workNote} onChange={(event) => set('workNote', event.target.value)} placeholder="e.g. monthly report, production support, meeting" /></label>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-700">Estimated OT pay</p>
              <p className="mt-1 text-3xl font-bold text-emerald-800">{money(estimate, data.settings)}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={save} className="flex-1"><Save size={20} />Save record</Button>
              {exists ? <Button size="lg" variant="destructive" onClick={() => setDeleteTarget(editing)}><Trash2 size={20} />Delete</Button> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent records</CardTitle>
            <CardDescription>Edit or delete your latest OT entries.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRows.map((row) => {
                const computed = dailyRowsForMonth(data, row.date.slice(0, 7)).find((item) => item.id === row.id)
                return (
                  <div key={row.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{thaiDate(row.date)}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{numberText(row.otHours)} h • {row.workNote || 'No note'}</p>
                      </div>
                      <Badge tone="green">{money(computed?.otPay ?? 0, data.settings)}</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditing(row)}>Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => setDeleteTarget(row)}>Delete</Button>
                    </div>
                  </div>
                )
              })}
              {!recentRows.length ? <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">No OT records yet.</p> : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!deleteTarget} title="Delete OT record?" description="This action removes the selected local record from your browser storage." onClose={() => setDeleteTarget(null)}>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" onClick={confirmDelete}>Delete record</Button>
        </div>
      </Dialog>
    </div>
  )
}
