import { ReactNode, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input, Textarea } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { clearAllData, resetSampleData } from '../data/storage'
import { BonusExtraIncome, ExpenseCategory, RecurringExpense, SalaryHistory } from '../types'
import { calculateAllocationStatus, calculateBudgetSummary, calculateCategoryBudgetAmount, calculateTotalAllocationPercent } from '../utils/calculations'
import { downloadText, exportJson } from '../utils/exportUtils'
import { money } from '../utils/format'
import { PageProps } from './pageTypes'

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <details className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-soft ring-1 ring-slate-200/50 sm:rounded-[28px] sm:p-5" open>
      <summary className="cursor-pointer list-none">
        <div>
          <h3 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</p>
        </div>
      </summary>
      <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">{children}</div>
    </details>
  )
}

export function Settings({ data, setData, month, notify }: PageProps) {
  const [salary, setSalary] = useState<SalaryHistory>({
    id: crypto.randomUUID(),
    effectiveDate: new Date().toISOString().slice(0, 10),
    salary: data.settings.currentSalary,
    note: '',
    createdAt: new Date().toISOString(),
  })
  const [extra, setExtra] = useState<BonusExtraIncome>({
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    month: new Date().toISOString().slice(0, 7),
    type: 'bonus',
    title: 'Bonus',
    amount: 0,
    status: 'confirmed',
    note: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const [category, setCategory] = useState<ExpenseCategory>({
    id: crypto.randomUUID(),
    name: '',
    color: '#0b3b75',
    type: 'spending',
    isDefault: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const [recurring, setRecurring] = useState<RecurringExpense>({
    id: crypto.randomUUID(),
    categoryId: data.expenseCategories[0]?.id ?? '',
    title: '',
    amount: 0,
    dayOfMonth: 1,
    paymentMethod: 'transfer',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  const budget = calculateBudgetSummary(month, data)
  const totalAllocation = calculateTotalAllocationPercent(data.budgetAllocations)
  const allocationStatus = calculateAllocationStatus(totalAllocation)

  const saveSalary = () => {
    setData({ ...data, settings: { ...data.settings, currentSalary: salary.salary }, salaryHistory: [...data.salaryHistory, salary] })
    setSalary({ ...salary, id: crypto.randomUUID(), note: '' })
    notify('Salary saved')
  }

  const saveExtra = () => {
    setData({ ...data, bonusExtraIncome: [...data.bonusExtraIncome, extra] })
    setExtra({ ...extra, id: crypto.randomUUID(), title: '', amount: 0, note: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    notify('Extra income saved')
  }

  const importBackup = (file?: File) => {
    if (!file) return
    file.text().then((text) => {
      setData(JSON.parse(text))
      notify('JSON imported')
    })
  }

  const updateAllocation = (categoryId: string, allocationPercent: number) => {
    if (allocationPercent < 0) {
      notify('Percentage cannot be negative')
      return
    }
    const exists = data.budgetAllocations.some((item) => item.categoryId === categoryId)
    const next = {
      id: exists ? data.budgetAllocations.find((item) => item.categoryId === categoryId)!.id : crypto.randomUUID(),
      categoryId,
      allocationPercent,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setData({ ...data, budgetAllocations: exists ? data.budgetAllocations.map((item) => item.categoryId === categoryId ? next : item) : [...data.budgetAllocations, next] })
  }

  const toggleAllocation = (categoryId: string, isActive: boolean) => {
    const exists = data.budgetAllocations.some((item) => item.categoryId === categoryId)
    const next = {
      id: exists ? data.budgetAllocations.find((item) => item.categoryId === categoryId)!.id : crypto.randomUUID(),
      categoryId,
      allocationPercent: data.budgetAllocations.find((item) => item.categoryId === categoryId)?.allocationPercent ?? 0,
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setData({ ...data, budgetAllocations: exists ? data.budgetAllocations.map((item) => item.categoryId === categoryId ? next : item) : [...data.budgetAllocations, next] })
  }

  const saveCategory = () => {
    if (!category.name.trim()) {
      notify('Category name is required')
      return
    }
    setData({ ...data, expenseCategories: [...data.expenseCategories, category] })
    setCategory({ ...category, id: crypto.randomUUID(), name: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    notify('Category saved')
  }

  const saveRecurring = () => {
    if (!recurring.categoryId || !recurring.title.trim() || recurring.amount <= 0) {
      notify('Please enter recurring expense details')
      return
    }
    const exists = data.recurringExpenses.some((item) => item.id === recurring.id)
    setData({ ...data, recurringExpenses: exists ? data.recurringExpenses.map((item) => item.id === recurring.id ? recurring : item) : [...data.recurringExpenses, recurring] })
    setRecurring({ ...recurring, id: crypto.randomUUID(), title: '', amount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    notify('Recurring expense saved')
  }

  return (
    <div className="space-y-4 sm:space-y-7">
      <div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">Manage salary, OT calculation, bonus pay, privacy, and local data.</p>
      </div>

      <Section title="Salary" description="Set your current salary and salary history.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Current Salary<Input type="number" value={salary.salary} onChange={(event) => setSalary({ ...salary, salary: Number(event.target.value) })} /></label>
          <label className="text-sm font-semibold text-slate-700">Salary Effective Date<Input type="date" value={salary.effectiveDate} onChange={(event) => setSalary({ ...salary, effectiveDate: event.target.value })} /></label>
        </div>
        <label className="block text-sm font-semibold text-slate-700">Note<Textarea value={salary.note ?? ''} onChange={(event) => setSalary({ ...salary, note: event.target.value })} /></label>
        <Button onClick={saveSalary}>Save Salary</Button>
        <div className="grid gap-2">
          <p className="font-bold text-slate-950">Salary History</p>
          {[...data.salaryHistory].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate)).slice(0, 6).map((row) => (
            <div key={row.id} className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm sm:p-4 sm:text-base">
              <span className="font-medium">{row.effectiveDate}</span>
              <b>{money(row.salary, data.settings)}</b>
            </div>
          ))}
          {!data.salaryHistory.length ? <p className="rounded-xl border border-dashed border-border p-4 text-muted-foreground">No salary record found. Add your current salary in Settings.</p> : null}
        </div>
      </Section>

      <Section title="OT Calculation" description="Edit the divisor, multipliers, meal allowance, and transport allowance.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">OT Hour Divisor<Input type="number" step="0.01" value={data.settings.otHourDivisor} onChange={(event) => setData({ ...data, settings: { ...data.settings, otHourDivisor: Number(event.target.value) } })} /></label>
          <label className="text-sm font-semibold text-slate-700">OT Multiplier 1<Input type="number" step="0.1" value={data.settings.otMultiplier1} onChange={(event) => setData({ ...data, settings: { ...data.settings, otMultiplier1: Number(event.target.value), defaultOtMultiplierWeekday: Number(event.target.value) } })} /></label>
          <label className="text-sm font-semibold text-slate-700">OT Multiplier 2<Input type="number" step="0.1" value={data.settings.otMultiplier2} onChange={(event) => setData({ ...data, settings: { ...data.settings, otMultiplier2: Number(event.target.value), defaultOtMultiplierHoliday: Number(event.target.value) } })} /></label>
          <label className="text-sm font-semibold text-slate-700">OT Multiplier 3<Input type="number" step="0.1" value={data.settings.otMultiplier3} onChange={(event) => setData({ ...data, settings: { ...data.settings, otMultiplier3: Number(event.target.value), defaultOtMultiplierSpecial: Number(event.target.value) } })} /></label>
          <label className="text-sm font-semibold text-slate-700">Meal Allowance<Input type="number" value={data.settings.mealAllowanceAmount} onChange={(event) => setData({ ...data, settings: { ...data.settings, mealAllowanceAmount: Number(event.target.value) } })} /></label>
          <label className="text-sm font-semibold text-slate-700">Transport Allowance<Input type="number" value={data.settings.transportAllowanceAmount} onChange={(event) => setData({ ...data, settings: { ...data.settings, transportAllowanceAmount: Number(event.target.value) } })} /></label>
          <label className="text-sm font-semibold text-slate-700">Transport Cutoff Hours<Input type="number" step="0.5" value={data.settings.transportCutoffHours} onChange={(event) => setData({ ...data, settings: { ...data.settings, transportCutoffHours: Number(event.target.value) } })} /></label>
          <label className="text-sm font-semibold text-slate-700">Extra Meal Threshold<Input type="number" step="0.5" value={data.settings.extraMealThresholdHours} onChange={(event) => setData({ ...data, settings: { ...data.settings, extraMealThresholdHours: Number(event.target.value) } })} /></label>
        </div>
      </Section>

      <Section title="Bonus / Extra Pay" description="Confirmed and paid items are included in actual totals.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">Date<Input type="date" value={extra.date} onChange={(event) => setExtra({ ...extra, date: event.target.value, month: event.target.value.slice(0, 7) })} /></label>
          <label className="text-sm font-semibold text-slate-700">Type<Select value={extra.type} onChange={(event) => setExtra({ ...extra, type: event.target.value as BonusExtraIncome['type'] })}><option value="bonus">Bonus</option><option value="aprilExtraPay">April Extra Pay</option><option value="allowance">Allowance</option><option value="other">Other</option></Select></label>
          <label className="text-sm font-semibold text-slate-700">Title<Input value={extra.title} onChange={(event) => setExtra({ ...extra, title: event.target.value })} /></label>
          <label className="text-sm font-semibold text-slate-700">Amount<Input type="number" value={extra.amount} onChange={(event) => setExtra({ ...extra, amount: Number(event.target.value) })} /></label>
          <label className="text-sm font-semibold text-slate-700">Status<Select value={extra.status} onChange={(event) => setExtra({ ...extra, status: event.target.value as BonusExtraIncome['status'] })}><option value="confirmed">Confirmed</option><option value="paid">Paid</option><option value="expected">Expected</option></Select></label>
        </div>
        <Button onClick={saveExtra}>Save Bonus / Extra Pay</Button>
        <div className="grid gap-2">
          {data.bonusExtraIncome.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((row) => (
            <div key={row.id} className="flex items-center justify-between gap-3 rounded-xl bg-muted p-4">
              <div><p className="font-semibold">{row.month} - {row.title}</p><Badge tone={row.status === 'paid' ? 'green' : row.status === 'expected' ? 'orange' : 'blue'}>{row.status}</Badge></div>
              <b>{money(row.amount, data.settings)}</b>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Budget Allocation" description="Set percentage-based category budgets from this month's income.">
        <div className="rounded-2xl bg-muted p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-base font-bold text-slate-950 sm:text-lg">Total Allocation: {totalAllocation.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground sm:text-sm">Preview uses {money(budget.monthlyIncome, data.settings)} monthly income for {month}.</p>
            </div>
            <Badge tone={allocationStatus.status === 'balanced' ? 'green' : allocationStatus.status === 'over' ? 'red' : 'orange'}>{allocationStatus.message}</Badge>
          </div>
        </div>
        <div className="space-y-3">
          {data.expenseCategories.map((item) => {
            const allocation = data.budgetAllocations.find((budgetItem) => budgetItem.categoryId === item.id)
            const percent = allocation?.allocationPercent ?? 0
            const active = allocation?.isActive ?? item.isActive
            return (
              <div key={item.id} className="rounded-2xl border border-border bg-white p-3 sm:p-4">
                <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto] md:items-center">
                  <div>
                    <p className="text-base font-bold text-slate-950 sm:text-lg">{item.name}</p>
                    <p className="text-xs capitalize text-muted-foreground sm:text-sm">{item.type}</p>
                  </div>
                  <label className="text-sm font-semibold text-slate-700">Percent<Input type="number" min="0" step="0.1" value={percent} onChange={(event) => updateAllocation(item.id, Number(event.target.value))} /></label>
                  <div>
                    <p className="text-xs text-muted-foreground sm:text-sm">Preview Amount</p>
                    <p className="text-lg font-bold sm:text-xl">{money(calculateCategoryBudgetAmount(budget.monthlyIncome, percent), data.settings)}</p>
                  </div>
                  <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input className="h-5 w-5 accent-blue-800" type="checkbox" checked={active} onChange={(event) => toggleAllocation(item.id, event.target.checked)} />Active</label>
                  {!item.isDefault ? <Button variant="destructive" onClick={() => setData({ ...data, expenseCategories: data.expenseCategories.filter((categoryItem) => categoryItem.id !== item.id), budgetAllocations: data.budgetAllocations.filter((budgetItem) => budgetItem.categoryId !== item.id) })}>Delete</Button> : null}
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Budget Settings" description="Manage expense categories and recurring expenses.">
        <Card className="shadow-none">
          <p className="text-base font-bold text-slate-950 sm:text-lg">Add Category</p>
          <div className="mt-4 grid gap-4 md:grid-cols-4">
            <label className="text-sm font-semibold text-slate-700">Name<Input value={category.name} onChange={(event) => setCategory({ ...category, name: event.target.value, updatedAt: new Date().toISOString() })} /></label>
            <label className="text-sm font-semibold text-slate-700">Type<Select value={category.type} onChange={(event) => setCategory({ ...category, type: event.target.value as ExpenseCategory['type'] })}><option value="spending">Spending</option><option value="saving">Saving</option><option value="investment">Investment</option></Select></label>
            <label className="text-sm font-semibold text-slate-700">Color<Input type="color" value={category.color} onChange={(event) => setCategory({ ...category, color: event.target.value })} /></label>
            <Button className="self-end" onClick={saveCategory}>Add Category</Button>
          </div>
        </Card>
        <Card className="shadow-none">
          <p className="text-base font-bold text-slate-950 sm:text-lg">Recurring Expenses</p>
          <div className="mt-4 grid gap-4 md:grid-cols-5">
            <label className="text-sm font-semibold text-slate-700">Category<Select value={recurring.categoryId} onChange={(event) => setRecurring({ ...recurring, categoryId: event.target.value })}>{data.expenseCategories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></label>
            <label className="text-sm font-semibold text-slate-700">Title<Input value={recurring.title} onChange={(event) => setRecurring({ ...recurring, title: event.target.value })} /></label>
            <label className="text-sm font-semibold text-slate-700">Amount<Input type="number" value={recurring.amount} onChange={(event) => setRecurring({ ...recurring, amount: Number(event.target.value) })} /></label>
            <label className="text-sm font-semibold text-slate-700">Day<Input type="number" min="1" max="28" value={recurring.dayOfMonth} onChange={(event) => setRecurring({ ...recurring, dayOfMonth: Number(event.target.value) })} /></label>
            <Button className="self-end" onClick={saveRecurring}>Save Recurring</Button>
          </div>
          <div className="mt-4 space-y-2">
            {data.recurringExpenses.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted p-3 text-sm sm:p-4 sm:text-base">
                <div><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{data.expenseCategories.find((categoryItem) => categoryItem.id === item.categoryId)?.name} - day {item.dayOfMonth}</p></div>
                <div className="flex items-center gap-2">
                  <b>{money(item.amount, data.settings)}</b>
                  <Button size="sm" variant="outline" onClick={() => setRecurring(item)}>{item.isActive ? 'Edit' : 'Enable'}</Button>
                  <Button size="sm" variant="secondary" onClick={() => setData({ ...data, recurringExpenses: data.recurringExpenses.map((recurringItem) => recurringItem.id === item.id ? { ...recurringItem, isActive: !recurringItem.isActive, updatedAt: new Date().toISOString() } : recurringItem) })}>{item.isActive ? 'Disable' : 'Enable'}</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="Privacy" description="Control yearly target and money visibility.">
        <label className="block text-sm font-semibold text-slate-700">Annual Income Target<Input type="number" value={data.settings.annualIncomeTarget ?? 0} onChange={(event) => setData({ ...data, settings: { ...data.settings, annualIncomeTarget: Number(event.target.value) } })} /></label>
        <label className="flex items-center gap-3 text-base font-semibold text-slate-800">
          <input className="h-5 w-5 accent-blue-800" type="checkbox" checked={data.settings.privacyMode} onChange={(event) => setData({ ...data, settings: { ...data.settings, privacyMode: event.target.checked } })} />
          Privacy mode hides money values
        </label>
      </Section>

      <Section title="Data Management" description="Back up, restore, reset, or clear local browser data.">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button onClick={() => downloadText('workpay-backup.json', exportJson(data), 'application/json')}>Export JSON</Button>
          <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-input bg-white px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-accent sm:min-h-12 sm:px-5 sm:py-3 sm:text-base">Import JSON<input type="file" accept="application/json" className="hidden" onChange={(event) => importBackup(event.target.files?.[0])} /></label>
          <Button variant="secondary" onClick={() => { setData(resetSampleData()); notify('Demo data reset') }}>Reset Demo Data</Button>
          <Button variant="destructive" onClick={() => { if (confirm('Clear all local data?')) { setData(clearAllData()); notify('All data cleared') } }}>Clear All Data</Button>
        </div>
      </Section>

      <Card className="bg-blue-50">
        <p className="font-semibold text-blue-900">Storage Note</p>
        <p className="mt-1 text-sm text-blue-800">All records are stored locally in this browser. No backend or account is required.</p>
      </Card>
    </div>
  )
}
