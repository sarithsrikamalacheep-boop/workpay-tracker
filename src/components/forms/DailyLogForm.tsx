import { Save, Copy, CircleSlash } from 'lucide-react'
import { DailyWorkLog, UserSettings } from '../../types'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'

const freshLog = (settings: UserSettings): DailyWorkLog => ({
  id: crypto.randomUUID(),
  date: new Date().toISOString().slice(0, 10),
  isWorkday: true,
  isHoliday: false,
  otHours: 0,
  otType: 'weekday',
  otMultiplier: settings.otMultiplier1,
  workNote: '',
  workTags: [],
  workloadLevel: 'normal',
  mood: 'normal',
  status: 'confirmed',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export function DailyLogForm({ value, settings, previous, onChange, onSave, onDelete }: { value?: DailyWorkLog; settings: UserSettings; previous?: DailyWorkLog; onChange: (log: DailyWorkLog) => void; onSave: () => void; onDelete?: () => void }) {
  const log = value ?? freshLog(settings)
  const set = <K extends keyof DailyWorkLog>(key: K, next: DailyWorkLog[K]) => onChange({ ...log, [key]: next, updatedAt: new Date().toISOString() })
  const setOtType = (type: DailyWorkLog['otType']) => {
    const multiplier = type === 'holiday' ? settings.otMultiplier2 : type === 'special' ? settings.otMultiplier3 : settings.otMultiplier1
    onChange({ ...log, otType: type, otMultiplier: multiplier, isHoliday: type === 'holiday', updatedAt: new Date().toISOString() })
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Date<Input type="date" value={log.date} onChange={(e) => set('date', e.target.value)} /></label>
        <label className="text-sm font-semibold text-slate-700">Status<Select value={log.status} onChange={(e) => set('status', e.target.value as DailyWorkLog['status'])}><option value="draft">Draft</option><option value="confirmed">Confirmed</option><option value="paid">Paid</option></Select></label>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {[1, 2, 3].map((hours) => <Button key={hours} variant="secondary" onClick={() => set('otHours', hours)}>OT {hours}h</Button>)}
        <Button variant="secondary" onClick={() => set('otHours', 0)}><CircleSlash size={17} />No OT</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm font-semibold text-slate-700">OT Hours<Input type="number" min="0" step="0.5" value={log.otHours} onChange={(e) => set('otHours', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">OT Type<Select value={log.otType} onChange={(e) => setOtType(e.target.value as DailyWorkLog['otType'])}><option value="weekday">1.5x OT</option><option value="holiday">2x OT</option><option value="special">3x OT</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Multiplier<Input type="number" step="0.1" value={log.otMultiplier} onChange={(e) => set('otMultiplier', Number(e.target.value))} /></label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">Workload<Select value={log.workloadLevel} onChange={(e) => set('workloadLevel', e.target.value as DailyWorkLog['workloadLevel'])}><option value="light">Light</option><option value="normal">Normal</option><option value="heavy">Heavy</option><option value="veryHeavy">Very Heavy</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Mood<Select value={log.mood} onChange={(e) => set('mood', e.target.value as DailyWorkLog['mood'])}><option value="good">Good</option><option value="normal">Normal</option><option value="tired">Tired</option><option value="stress">Stressed</option></Select></label>
      </div>
      <label className="text-sm font-semibold text-slate-700">Tags<Input value={log.workTags.join(', ')} onChange={(e) => set('workTags', e.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="Production Support, Meeting" /></label>
      <label className="text-sm font-semibold text-slate-700">Work Note<Textarea value={log.workNote} onChange={(e) => set('workNote', e.target.value)} placeholder="What did you work on today?" /></label>
      <div className="flex flex-wrap gap-2">
        {previous ? <Button variant="secondary" onClick={() => onChange({ ...previous, id: log.id, date: log.date, createdAt: log.createdAt, updatedAt: new Date().toISOString() })}><Copy size={17} />Same as yesterday</Button> : null}
        <Button onClick={onSave} className="flex-1 sm:flex-none"><Save size={18} />Save</Button>
        {onDelete ? <Button variant="danger" onClick={onDelete}>Delete</Button> : null}
      </div>
    </div>
  )
}
