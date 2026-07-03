import { useState } from 'react'
import { BonusForm, emptyBonus } from '../components/forms/BonusForm'
import { SimpleBarChart } from '../components/charts/Charts'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { StatCard } from '../components/ui/StatCard'
import { BonusExtraIncome } from '../types'
import { money } from '../utils/format'
import { Gift, PiggyBank, Sparkles, Wallet } from 'lucide-react'
import { PageProps } from './pageTypes'

export function BonusExtra({ data, setData, month, notify }: PageProps) {
  const [editing, setEditing] = useState<BonusExtraIncome | undefined>()
  const year = month.slice(0, 4)
  const rows = data.bonusExtraIncome.filter((item) => item.month.startsWith(year)).sort((a, b) => b.date.localeCompare(a.date))
  const paid = rows.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0)
  const expected = rows.filter((item) => item.status === 'expected').reduce((sum, item) => sum + item.amount, 0)
  const save = () => {
    if (!editing) return
    const exists = data.bonusExtraIncome.some((item) => item.id === editing.id)
    setData({ ...data, bonusExtraIncome: exists ? data.bonusExtraIncome.map((item) => item.id === editing.id ? editing : item) : [...data.bonusExtraIncome, editing] })
    notify('Extra income saved')
    setEditing(undefined)
  }
  const remove = () => {
    if (!editing || !confirm('Delete this record?')) return
    setData({ ...data, bonusExtraIncome: data.bonusExtraIncome.filter((item) => item.id !== editing.id) })
    notify('Record deleted')
    setEditing(undefined)
  }
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Paid Bonus This Year" value={money(paid, data.settings)} icon={PiggyBank} tone="green" />
        <StatCard title="Expected Bonus" value={money(expected, data.settings)} icon={Gift} tone="purple" />
        <StatCard title="Next Bonus Month" value={rows.find((item) => item.status === 'expected')?.month ?? '-'} icon={Sparkles} tone="orange" />
        <StatCard title="Total Extra YTD" value={money(paid + expected, data.settings)} icon={Wallet} />
      </div>
      <Card><div className="mb-3 flex justify-between"><h2 className="font-bold">Bonus Timeline</h2><Button onClick={() => setEditing(emptyBonus())}>Add Record</Button></div><SimpleBarChart data={rows.map((row) => ({ name: row.month, value: row.amount }))} y="value" color="#7c3aed" /></Card>
      <Card><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="py-2">Month</th><th>Type</th><th>Title</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} onClick={() => setEditing(row)} className="cursor-pointer border-b border-slate-100 hover:bg-blue-50"><td className="py-2">{row.month}</td><td>{row.type}</td><td>{row.title}</td><td>{money(row.amount, data.settings)}</td><td><Badge tone={row.status === 'paid' ? 'green' : row.status === 'confirmed' ? 'blue' : 'orange'}>{row.status}</Badge></td><td>{row.note}</td></tr>)}</tbody></table></div></Card>
      <Modal open={!!editing} title="Bonus & Extra Income" onClose={() => setEditing(undefined)}>{editing ? <BonusForm value={editing} onChange={setEditing} onSave={save} onDelete={data.bonusExtraIncome.some((item) => item.id === editing.id) ? remove : undefined} /> : null}</Modal>
    </div>
  )
}
