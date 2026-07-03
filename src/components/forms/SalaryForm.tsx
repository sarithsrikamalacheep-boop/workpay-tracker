import { SalaryHistory } from '../../types'
import { salaryAnnualImpact } from '../../utils/calculations'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'

export function emptySalary(previousSalary = 0): SalaryHistory {
  return { id: crypto.randomUUID(), effectiveDate: new Date().toISOString().slice(0, 10), salary: previousSalary, previousSalary, increaseAmount: 0, increasePercent: 0, note: '', createdAt: new Date().toISOString() }
}

export function SalaryForm({ value, onChange, onSave, onDelete }: { value: SalaryHistory; onChange: (value: SalaryHistory) => void; onSave: () => void; onDelete?: () => void }) {
  const setSalary = (salary: number) => {
    const increaseAmount = salary - (value.previousSalary ?? 0)
    onChange({ ...value, salary, increaseAmount, increasePercent: value.previousSalary ? (increaseAmount / value.previousSalary) * 100 : 0 })
  }
  return (
    <div className="grid gap-3">
      <label className="text-sm font-semibold text-slate-700">Effective Date<Input type="date" value={value.effectiveDate} onChange={(e) => onChange({ ...value, effectiveDate: e.target.value })} /></label>
      <label className="text-sm font-semibold text-slate-700">New Salary<Input type="number" value={value.salary} onChange={(e) => setSalary(Number(e.target.value))} /></label>
      <label className="text-sm font-semibold text-slate-700">Previous Salary<Input type="number" value={value.previousSalary ?? 0} onChange={(e) => onChange({ ...value, previousSalary: Number(e.target.value) })} /></label>
      <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">Estimated annual impact: {salaryAnnualImpact(value).toLocaleString('en-US')} THB</p>
      <label className="text-sm font-semibold text-slate-700">Note<Textarea value={value.note ?? ''} onChange={(e) => onChange({ ...value, note: e.target.value })} /></label>
      <div className="flex gap-2"><Button onClick={onSave}>Save</Button>{onDelete ? <Button variant="danger" onClick={onDelete}>Delete</Button> : null}</div>
    </div>
  )
}
