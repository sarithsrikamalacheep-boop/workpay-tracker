import { useState } from 'react'
import { SalaryForm, emptySalary } from '../components/forms/SalaryForm'
import { SalaryGrowthChart } from '../components/charts/Charts'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { StatCard } from '../components/ui/StatCard'
import { SalaryHistory as SalaryRecord } from '../types'
import { getCurrentSalary, salaryAnnualImpact } from '../utils/calculations'
import { money, percent } from '../utils/format'
import { Banknote, LineChart, TrendingUp, Wallet } from 'lucide-react'
import { PageProps } from './pageTypes'

export function SalaryHistory({ data, setData, month, notify }: PageProps) {
  const [editing, setEditing] = useState<SalaryRecord | undefined>()
  const rows = [...data.salaryHistory].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))
  const current = getCurrentSalary(data.salaryHistory, data.settings.currentSalary)
  const yearRows = rows.filter((row) => row.effectiveDate.startsWith(month.slice(0, 4)))
  const starting = [...yearRows].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))[0]?.salary ?? current
  const save = () => {
    if (!editing) return
    const exists = data.salaryHistory.some((item) => item.id === editing.id)
    setData({ ...data, settings: { ...data.settings, currentSalary: getCurrentSalary([...data.salaryHistory.filter((item) => item.id !== editing.id), editing], editing.salary) }, salaryHistory: exists ? data.salaryHistory.map((item) => item.id === editing.id ? editing : item) : [...data.salaryHistory, editing] })
    notify('Salary history saved')
    setEditing(undefined)
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Current Salary" value={money(current, data.settings)} icon={Wallet} />
        <StatCard title="Starting This Year" value={money(starting, data.settings)} icon={Banknote} tone="green" />
        <StatCard title="Increase YTD" value={money(current - starting, data.settings)} icon={TrendingUp} tone="orange" />
        <StatCard title="Growth %" value={percent(starting ? ((current - starting) / starting) * 100 : 0)} icon={LineChart} tone="purple" />
      </div>
      <Card><div className="mb-3 flex justify-between"><h2 className="font-bold">Salary Growth Timeline</h2><Button onClick={() => setEditing(emptySalary(current))}>Add Salary</Button></div><SalaryGrowthChart data={[...data.salaryHistory].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))} /></Card>
      <Card><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Effective Date</th><th>Salary</th><th>Increase</th><th>Increase %</th><th>Annual Impact</th><th>Note</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} onClick={() => setEditing(row)} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50"><td className="py-2">{row.effectiveDate}</td><td>{money(row.salary, data.settings)}</td><td>{money(row.increaseAmount ?? 0, data.settings)}</td><td>{percent(row.increasePercent ?? 0)}</td><td>{money(salaryAnnualImpact(row), data.settings)}</td><td>{row.note}</td></tr>)}</tbody></table></div></Card>
      <Modal open={!!editing} title="Salary History" onClose={() => setEditing(undefined)}>{editing ? <SalaryForm value={editing} onChange={setEditing} onSave={save} onDelete={() => { if (confirm('Delete this salary record?')) { setData({ ...data, salaryHistory: data.salaryHistory.filter((item) => item.id !== editing.id) }); notify('Record deleted'); setEditing(undefined) } }} /> : null}</Modal>
    </div>
  )
}
