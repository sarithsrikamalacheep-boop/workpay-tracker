import { BonusExtraIncome } from '../../types'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { Select } from '../ui/Select'

export function emptyBonus(): BonusExtraIncome {
  const date = new Date().toISOString().slice(0, 10)
  return { id: crypto.randomUUID(), date, month: date.slice(0, 7), type: 'bonus', title: '', amount: 0, status: 'expected', note: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
}

export function BonusForm({ value, onChange, onSave, onDelete }: { value: BonusExtraIncome; onChange: (value: BonusExtraIncome) => void; onSave: () => void; onDelete?: () => void }) {
  const set = <K extends keyof BonusExtraIncome>(key: K, next: BonusExtraIncome[K]) => onChange({ ...value, [key]: next, month: key === 'date' ? String(next).slice(0, 7) : value.month, updatedAt: new Date().toISOString() })
  return (
    <div className="grid gap-3">
      <label className="text-sm font-semibold text-slate-700">Date<Input type="date" value={value.date} onChange={(e) => set('date', e.target.value)} /></label>
      <label className="text-sm font-semibold text-slate-700">Type<Select value={value.type} onChange={(e) => set('type', e.target.value as BonusExtraIncome['type'])}><option value="bonus">Bonus</option><option value="specialBonus">Special Bonus</option><option value="aprilExtraPay">April Extra Pay</option><option value="allowance">Allowance</option><option value="incentive">Incentive</option><option value="adjustment">Adjustment</option><option value="other">Other</option></Select></label>
      <label className="text-sm font-semibold text-slate-700">Title<Input value={value.title} onChange={(e) => set('title', e.target.value)} /></label>
      <label className="text-sm font-semibold text-slate-700">Amount<Input type="number" value={value.amount} onChange={(e) => set('amount', Number(e.target.value))} /></label>
      <label className="text-sm font-semibold text-slate-700">Status<Select value={value.status} onChange={(e) => set('status', e.target.value as BonusExtraIncome['status'])}><option value="expected">Expected</option><option value="confirmed">Confirmed</option><option value="paid">Paid</option></Select></label>
      <label className="text-sm font-semibold text-slate-700">Note<Textarea value={value.note ?? ''} onChange={(e) => set('note', e.target.value)} /></label>
      <div className="flex gap-2"><Button onClick={onSave}>Save</Button>{onDelete ? <Button variant="danger" onClick={onDelete}>Delete</Button> : null}</div>
    </div>
  )
}
