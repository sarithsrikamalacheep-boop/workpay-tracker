import { addMonths, format, parseISO } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Receipt, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Select } from '../components/ui/Select'
import { StatCard } from '../components/ui/StatCard'
import { BudgetAllocation, ExpenseRecord } from '../types'
import { calculateBudgetSummary } from '../utils/calculations'
import { thaiDate } from '../utils/dateUtils'
import { money, numberText } from '../utils/format'
import { PageProps } from './pageTypes'
import { MiniChartIllustration } from '../components/brand/BrandMark'
import { IconBadge } from '../components/ui/IconBadge'
import { categoryIcon } from '../utils/iconMap'

function freshExpense(month: string, categoryId = ''): ExpenseRecord {
  const today = new Date().toISOString().slice(0, 10)
  const date = today.startsWith(month) ? today : `${month}-01`
  return {
    id: crypto.randomUUID(),
    date,
    month: date.slice(0, 7),
    categoryId,
    title: '',
    amount: 0,
    note: '',
    paymentMethod: 'transfer',
    isRecurring: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function progressTone(status: string) {
  if (status === 'over') return 'bg-red-500'
  if (status === 'warning') return 'bg-amber-500'
  return 'bg-emerald-500'
}

function statusTone(status: string) {
  if (status === 'over') return 'red'
  if (status === 'warning') return 'orange'
  return 'green'
}

function typeTone(type: string) {
  if (type === 'saving') return 'green'
  if (type === 'investment') return 'purple'
  return 'blue'
}

export function Budget({ data, setData, month, setMonth, notify, onNavigate }: PageProps) {
  const summary = calculateBudgetSummary(month, data)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>()
  const [expense, setExpense] = useState<ExpenseRecord | undefined>()
  const [allocationDraft, setAllocationDraft] = useState<number | undefined>()
  const selectedCategory = data.expenseCategories.find((item) => item.id === selectedCategoryId)
  const selectedSummary = summary.categories.find((item) => item.categoryId === selectedCategoryId)
  const selectedExpenses = useMemo(() => data.expenseRecords.filter((item) => item.month === month && item.categoryId === selectedCategoryId).sort((a, b) => b.date.localeCompare(a.date)), [data.expenseRecords, month, selectedCategoryId])
  const move = (delta: number) => setMonth(format(addMonths(parseISO(`${month}-01`), delta), 'yyyy-MM'))

  const updateExpense = <K extends keyof ExpenseRecord>(key: K, value: ExpenseRecord[K]) => {
    if (!expense) return
    setExpense({ ...expense, [key]: value, month: key === 'date' ? String(value).slice(0, 7) : expense.month, updatedAt: new Date().toISOString() })
  }

  const saveExpense = () => {
    if (!expense?.categoryId || !expense.title.trim() || expense.amount <= 0) {
      notify('Please enter category, title, and amount')
      return
    }
    const exists = data.expenseRecords.some((item) => item.id === expense.id)
    setData({ ...data, expenseRecords: exists ? data.expenseRecords.map((item) => item.id === expense.id ? expense : item) : [...data.expenseRecords, expense] })
    setExpense(undefined)
    notify('Expense saved')
  }

  const deleteExpense = (id: string) => {
    if (!confirm('Delete this expense?')) return
    setData({ ...data, expenseRecords: data.expenseRecords.filter((item) => item.id !== id) })
    notify('Expense deleted')
  }

  const saveAllocation = () => {
    if (!selectedCategoryId || allocationDraft === undefined) return
    if (allocationDraft < 0) {
      notify('Percentage cannot be negative')
      return
    }
    const exists = data.budgetAllocations.some((item) => item.categoryId === selectedCategoryId)
    const next: BudgetAllocation = {
      id: exists ? data.budgetAllocations.find((item) => item.categoryId === selectedCategoryId)!.id : crypto.randomUUID(),
      categoryId: selectedCategoryId,
      allocationPercent: allocationDraft,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setData({ ...data, budgetAllocations: exists ? data.budgetAllocations.map((item) => item.categoryId === selectedCategoryId ? next : item) : [...data.budgetAllocations, next] })
    notify('Allocation updated')
  }

  const applyRecurring = () => {
    const created: ExpenseRecord[] = []
    data.recurringExpenses.filter((item) => item.isActive).forEach((item) => {
      const date = `${month}-${String(Math.min(28, Math.max(1, item.dayOfMonth))).padStart(2, '0')}`
      const duplicate = data.expenseRecords.some((expenseItem) => expenseItem.month === month && expenseItem.categoryId === item.categoryId && expenseItem.title === item.title && expenseItem.amount === item.amount)
      if (!duplicate) {
        created.push({
          id: crypto.randomUUID(),
          date,
          month,
          categoryId: item.categoryId,
          title: item.title,
          amount: item.amount,
          paymentMethod: item.paymentMethod,
          isRecurring: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
    })
    if (!created.length) {
      notify('No new recurring expenses to apply')
      return
    }
    setData({ ...data, expenseRecords: [...data.expenseRecords, ...created] })
    notify('Recurring expenses applied')
  }

  return (
    <div className="space-y-4 sm:space-y-7">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Budget</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">Plan spending by income percentage.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => move(-1)}><ChevronLeft size={20} /></Button>
          <div className="rounded-xl border border-border bg-white px-5 py-3 font-bold text-slate-900">{month}</div>
          <Button variant="outline" size="icon" onClick={() => move(1)}><ChevronRight size={20} /></Button>
        </div>
      </div>

      <Card className="relative overflow-hidden border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-glow">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/35 blur-2xl sm:h-44 sm:w-44" />
        <MiniChartIllustration className="opacity-15" />
        <CardHeader className="relative z-10">
          <Badge tone={summary.allocationStatus.status === 'balanced' ? 'green' : summary.allocationStatus.status === 'over' ? 'red' : 'orange'}>{summary.allocationStatus.message}</Badge>
          <CardTitle className="text-2xl">Money Left This Month</CardTitle>
          <CardDescription>Income minus actual expenses</CardDescription>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-4xl font-black tracking-tight text-navy sm:text-6xl">{money(summary.moneyLeft, data.settings)}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:mt-5 sm:flex sm:flex-wrap sm:gap-3">
            <div className="rounded-2xl bg-white/70 p-3"><p className="text-muted-foreground">Safe Today</p><b className="text-emerald-700">{money(summary.safeToSpendToday, data.settings)}</b></div>
            <div className="rounded-2xl bg-white/70 p-3"><p className="text-muted-foreground">Spent</p><b className="text-amber-700">{money(summary.totalSpent, data.settings)}</b></div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
            <Button onClick={() => setExpense(freshExpense(month))}><Plus size={18} />Add Expense</Button>
            <Button variant="secondary" onClick={applyRecurring}>Apply Recurring</Button>
            <Button variant="outline" onClick={() => onNavigate?.('settings')}>Edit Allocation</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard title="Monthly Income" value={money(summary.monthlyIncome, data.settings)} sub="Salary + OT + extra pay" icon={WalletCards} tone="green" />
        <StatCard title="Total Spent" value={money(summary.totalSpent, data.settings)} sub="Actual expenses this month" icon={Receipt} tone="orange" />
        <StatCard title="Planned Budget" value={money(summary.plannedBudget, data.settings)} sub={`${numberText(summary.totalAllocationPercent)}% allocated`} icon={WalletCards} tone="blue" />
        <StatCard title="Safe to Spend Today" value={money(summary.safeToSpendToday, data.settings)} sub="Spending categories only" icon={Receipt} tone="purple" />
      </div>

      <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
        {summary.categories.map((category) => (
          <button
            key={category.categoryId}
            className="rounded-2xl border border-border bg-white p-3 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg sm:rounded-[24px] sm:p-5"
            onClick={() => {
              setSelectedCategoryId(category.categoryId)
              setAllocationDraft(category.allocationPercent)
            }}
          >
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <IconBadge icon={categoryIcon(category.categoryName)} tone={typeTone(category.categoryType)} />
                  <div>
                    <p className="text-base font-bold text-slate-950 sm:text-xl">{category.categoryName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-base">{numberText(category.allocationPercent)}% of income</p>
                  </div>
                </div>
              </div>
              <Badge tone={statusTone(category.status)}>{category.status === 'over' ? 'Over' : category.status === 'warning' ? 'Near limit' : 'Healthy'}</Badge>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 sm:mt-5 sm:h-3">
              <div className={`h-full rounded-full ${progressTone(category.status)}`} style={{ width: `${Math.min(100, category.usedPercent)}%` }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:mt-5 sm:gap-3 sm:text-sm">
              <div><p className="text-muted-foreground">Budget</p><p className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-lg">{money(category.budgetAmount, data.settings)}</p></div>
              <div><p className="text-muted-foreground">Spent</p><p className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-lg">{money(category.spentAmount, data.settings)}</p></div>
              <div><p className="text-muted-foreground">{category.remainingAmount >= 0 ? 'Left' : 'Over'}</p><p className={`mt-0.5 text-sm font-bold sm:mt-1 sm:text-lg ${category.remainingAmount < 0 ? 'text-red-600' : 'text-emerald-700'}`}>{money(Math.abs(category.remainingAmount), data.settings)}</p></div>
            </div>
          </button>
        ))}
      </div>

      <Modal open={!!selectedCategory} title={selectedCategory?.name ?? 'Category'} onClose={() => setSelectedCategoryId(undefined)}>
        {selectedSummary ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-muted p-4">
              <div className="grid gap-3 sm:grid-cols-4">
                <div><p className="text-muted-foreground">Allocation</p><p className="text-2xl font-bold">{numberText(selectedSummary.allocationPercent)}%</p></div>
                <div><p className="text-muted-foreground">Budget</p><p className="text-2xl font-bold">{money(selectedSummary.budgetAmount, data.settings)}</p></div>
                <div><p className="text-muted-foreground">Spent</p><p className="text-2xl font-bold">{money(selectedSummary.spentAmount, data.settings)}</p></div>
                <div><p className="text-muted-foreground">{selectedSummary.remainingAmount >= 0 ? 'Remaining' : 'Over'}</p><p className="text-2xl font-bold">{money(Math.abs(selectedSummary.remainingAmount), data.settings)}</p></div>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white"><div className={`h-full ${progressTone(selectedSummary.status)}`} style={{ width: `${Math.min(100, selectedSummary.usedPercent)}%` }} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <label className="text-sm font-semibold text-slate-700">Allocation %<Input type="number" min="0" step="0.1" value={allocationDraft ?? 0} onChange={(event) => setAllocationDraft(Number(event.target.value))} /></label>
              <Button className="self-end" variant="secondary" onClick={saveAllocation}>Edit Allocation</Button>
              <Button className="self-end" onClick={() => setExpense(freshExpense(month, selectedSummary.categoryId))}><Plus size={18} />Add Expense</Button>
            </div>
            <div className="space-y-3">
              <p className="text-lg font-bold text-slate-950">Expense List</p>
              {!selectedExpenses.length ? <p className="rounded-2xl border border-dashed border-border p-6 text-center text-muted-foreground">No expenses in this category yet.</p> : null}
              {selectedExpenses.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><p className="font-bold">{item.title}</p><p className="text-sm text-muted-foreground">{thaiDate(item.date)} {item.note ? `- ${item.note}` : ''}</p></div>
                    <b className="text-lg text-slate-950">{money(item.amount, data.settings)}</b>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setExpense(item)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteExpense(item.id)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={!!expense} title={expense?.id && data.expenseRecords.some((item) => item.id === expense.id) ? 'Edit Expense' : 'Add Expense'} onClose={() => setExpense(undefined)}>
        {expense ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Date<Input type="date" value={expense.date} onChange={(event) => updateExpense('date', event.target.value)} /></label>
              <label className="text-sm font-semibold text-slate-700">Category<Select value={expense.categoryId} onChange={(event) => updateExpense('categoryId', event.target.value)}><option value="">Select category</option>{data.expenseCategories.filter((item) => item.isActive).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></label>
              <label className="text-sm font-semibold text-slate-700">Title<Input value={expense.title} onChange={(event) => updateExpense('title', event.target.value)} placeholder="Lunch, rent, fuel" /></label>
              <label className="text-sm font-semibold text-slate-700">Amount<Input type="number" value={expense.amount} onChange={(event) => updateExpense('amount', Number(event.target.value))} /></label>
              <label className="text-sm font-semibold text-slate-700">Payment Method<Select value={expense.paymentMethod ?? 'transfer'} onChange={(event) => updateExpense('paymentMethod', event.target.value as ExpenseRecord['paymentMethod'])}><option value="cash">Cash</option><option value="transfer">Transfer</option><option value="card">Card</option><option value="other">Other</option></Select></label>
            </div>
            <label className="block text-sm font-semibold text-slate-700">Note<Textarea value={expense.note ?? ''} onChange={(event) => updateExpense('note', event.target.value)} /></label>
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveExpense}>Save Expense</Button>
              <Button variant="outline" onClick={() => setExpense(undefined)}>Cancel</Button>
              {data.expenseRecords.some((item) => item.id === expense.id) ? <Button variant="destructive" onClick={() => deleteExpense(expense.id)}>Delete</Button> : null}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
