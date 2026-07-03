import { addMonths, format, parseISO } from 'date-fns'
import { Banknote, ChevronLeft, ChevronRight, Clock, Gift, WalletCards } from 'lucide-react'
import { SimpleBarChart } from '../components/charts/Charts'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table'
import { calculateBudgetSummary, dailyRowsForMonth, summarizeMonth } from '../utils/calculations'
import { thaiDate } from '../utils/dateUtils'
import { money, numberText } from '../utils/format'
import { PageProps } from './pageTypes'
import { MiniChartIllustration } from '../components/brand/BrandMark'

export function MonthlySummary({ data, month, setMonth }: PageProps) {
  const summary = summarizeMonth(data, month)
  const budget = calculateBudgetSummary(month, data)
  const rows = dailyRowsForMonth(data, month).sort((a, b) => a.date.localeCompare(b.date))
  const otRows = rows.filter((row) => row.otHours > 0)
  const noOtRecorded = rows.filter((row) => row.otHours === 0).length
  const highest = [...otRows].sort((a, b) => b.otHours - a.otHours)[0]
  const noteCount = rows.filter((row) => row.workNote.trim()).length
  const bonusExtra = summary.bonusIncome + summary.extraIncome + summary.otherIncome
  const move = (delta: number) => setMonth(format(addMonths(parseISO(`${month}-01`), delta), 'yyyy-MM'))
  const avgOt = summary.otHours / Math.max(1, summary.otDayCount)
  const avgOtPay = summary.otIncome / Math.max(1, summary.otDayCount)
  const avgIncomePerRecordedDay = summary.grossIncome / Math.max(1, rows.length)

  return (
    <div className="space-y-4 sm:space-y-7">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Monthly Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">Income, expenses, and OT for this month.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => move(-1)}><ChevronLeft size={20} /></Button>
          <div className="rounded-xl border border-border bg-white px-5 py-3 font-bold text-slate-900">{month}</div>
          <Button variant="outline" size="icon" onClick={() => move(1)}><ChevronRight size={20} /></Button>
        </div>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-[#071b3d] via-[#0f4ed8] to-[#2f7cff] text-white shadow-glow">
        <MiniChartIllustration />
        <CardHeader>
          <CardTitle className="text-white">Total Income This Month</CardTitle>
          <CardDescription className="text-blue-100">Estimated income from saved salary, OT, and extra pay records</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold tracking-tight sm:text-6xl">{money(summary.grossIncome, data.settings)}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard title="Salary" value={money(summary.baseSalary, data.settings)} sub="Base salary for this month" icon={Banknote} tone="blue" />
        <StatCard title="OT Income" value={money(summary.otIncome, data.settings)} sub={`${numberText(summary.otHours)} hours`} icon={Clock} tone="orange" />
        <StatCard title="Bonus / Extra Pay" value={money(bonusExtra, data.settings)} sub={`${data.bonusExtraIncome.filter((item) => item.month === month && item.status !== 'expected').length} confirmed items`} icon={Gift} tone="purple" />
        <StatCard title="Total Income" value={money(summary.grossIncome, data.settings)} sub="Estimated total income" icon={WalletCards} tone="green" />
      </div>

      <Card className="bg-blue-50">
        <p className="text-sm font-semibold text-blue-950 sm:text-lg">
          This month has {numberText(summary.otHours)} OT hours worth {money(summary.otIncome, data.settings)}
          {highest ? `, with the highest OT day on ${thaiDate(highest.date)} at ${numberText(highest.otHours)} hours.` : '.'}
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Income vs Expenses</CardTitle>
          <CardDescription>Percentage-based budget plan compared with actual spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl bg-emerald-50 p-3 sm:p-4"><p className="text-xs text-emerald-700 sm:text-base">Total Income</p><p className="mt-1 text-xl font-bold text-emerald-800 sm:mt-2 sm:text-2xl">{money(budget.monthlyIncome, data.settings)}</p></div>
            <div className="rounded-2xl bg-amber-50 p-3 sm:p-4"><p className="text-xs text-amber-700 sm:text-base">Total Expenses</p><p className="mt-1 text-xl font-bold text-amber-800 sm:mt-2 sm:text-2xl">{money(budget.totalSpent, data.settings)}</p></div>
            <div className="rounded-2xl bg-blue-50 p-3 sm:p-4"><p className="text-xs text-blue-700 sm:text-base">Remaining</p><p className="mt-1 text-xl font-bold text-blue-800 sm:mt-2 sm:text-2xl">{money(budget.moneyLeft, data.settings)}</p></div>
            <div className="rounded-2xl bg-purple-50 p-3 sm:p-4"><p className="text-xs text-purple-700 sm:text-base">Allocation</p><p className="mt-1 text-xl font-bold text-purple-800 sm:mt-2 sm:text-2xl">{numberText(budget.totalAllocationPercent)}%</p></div>
            <div className="rounded-2xl bg-slate-100 p-3 sm:p-4"><p className="text-xs text-slate-600 sm:text-base">Planned</p><p className="mt-1 text-xl font-bold text-slate-900 sm:mt-2 sm:text-2xl">{money(budget.plannedBudget, data.settings)}</p></div>
          </div>
          <div className="mt-5 space-y-3">
            {budget.categories.map((category) => (
              <div key={category.categoryId} className="rounded-2xl border border-border bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-950 sm:text-lg">{category.categoryName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {numberText(category.allocationPercent)}% | Budget {money(category.budgetAmount, data.settings)} | Spent {money(category.spentAmount, data.settings)}
                    </p>
                  </div>
                  <Badge tone={category.remainingAmount < 0 ? 'red' : 'green'}>{category.remainingAmount < 0 ? 'Over' : 'Left'} {money(Math.abs(category.remainingAmount), data.settings)}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OT Breakdown</CardTitle>
          <CardDescription>OT pay, meal allowance, and transport allowance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-muted p-3 sm:p-4"><p className="text-xs text-muted-foreground sm:text-base">OT Pay</p><p className="mt-1 text-xl font-bold sm:mt-2 sm:text-2xl">{money(summary.otBasePay, data.settings)}</p></div>
            <div className="rounded-2xl bg-emerald-50 p-3 sm:p-4"><p className="text-xs text-emerald-700 sm:text-base">Meal</p><p className="mt-1 text-xl font-bold text-emerald-800 sm:mt-2 sm:text-2xl">{money(summary.mealAllowance, data.settings)}</p></div>
            <div className="rounded-2xl bg-blue-50 p-3 sm:p-4"><p className="text-xs text-blue-700 sm:text-base">Transport</p><p className="mt-1 text-xl font-bold text-blue-800 sm:mt-2 sm:text-2xl">{money(summary.transportAllowance, data.settings)}</p></div>
            <div className="rounded-2xl bg-amber-50 p-3 sm:p-4"><p className="text-xs text-amber-700 sm:text-base">Total OT</p><p className="mt-1 text-xl font-bold text-amber-800 sm:mt-2 sm:text-2xl">{money(summary.otIncome, data.settings)}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Month Details</CardTitle>
          <CardDescription>Key monthly numbers at a glance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ['OT Days', `${summary.otDayCount} days`],
              ['No OT Days', `${noOtRecorded} days`],
              ['Highest OT Day', highest ? `${numberText(highest.otHours)} hrs - ${thaiDate(highest.date)}` : '-'],
              ['Average OT per OT Day', `${numberText(avgOt)} hrs/day`],
              ['Average OT Income per OT Day', money(avgOtPay, data.settings)],
              ['Average Income per Recorded Day', money(avgIncomePerRecordedDay, data.settings)],
              ['Recorded Notes', `${noteCount} notes`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl bg-muted p-4 text-base">
                <span className="text-muted-foreground">{label}</span>
                <b className="text-right text-slate-950">{value}</b>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily OT Hours</CardTitle>
          <CardDescription>OT hours by day of month</CardDescription>
        </CardHeader>
        <CardContent>
          <SimpleBarChart data={rows.map((row) => ({ name: row.date.slice(8), value: row.otHours }))} y="value" color="#f59e0b" height={220} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily OT Records</CardTitle>
          <CardDescription>Only days with OT are shown to keep the list easy to read</CardDescription>
        </CardHeader>
        <CardContent>
          {!otRows.length ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No records for this month. Log your OT from the calendar to see the summary.</div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-xl border border-border md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50"><TableHead>Date</TableHead><TableHead>OT</TableHead><TableHead>Type</TableHead><TableHead>OT Pay</TableHead><TableHead>Meal</TableHead><TableHead>Transport</TableHead><TableHead>Total</TableHead><TableHead>Note</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {otRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-semibold">{thaiDate(row.date)}</TableCell>
                        <TableCell>{numberText(row.otHours)} hrs</TableCell>
                        <TableCell>{row.otMultiplier}x</TableCell>
                        <TableCell>{money(row.otBasePay, data.settings)}</TableCell>
                        <TableCell>{money(row.mealAllowance, data.settings)}</TableCell>
                        <TableCell>{money(row.transportAllowance, data.settings)}</TableCell>
                        <TableCell className="font-bold text-emerald-700">{money(row.totalOtIncome, data.settings)}</TableCell>
                        <TableCell className="max-w-lg truncate text-muted-foreground">{row.workNote || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-3 md:hidden">
                {otRows.map((row) => (
                  <div key={row.id} className="rounded-2xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="font-bold text-slate-950">{thaiDate(row.date)}</p><p className="mt-1 text-muted-foreground">{row.workNote || 'No note'}</p></div>
                      <Badge tone="green">{money(row.totalOtIncome, data.settings)}</Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <p><span className="text-muted-foreground">OT Pay</span><br /><b>{money(row.otBasePay, data.settings)}</b></p>
                      <p><span className="text-muted-foreground">Meal</span><br /><b>{money(row.mealAllowance, data.settings)}</b></p>
                      <p><span className="text-muted-foreground">Transport</span><br /><b>{money(row.transportAllowance, data.settings)}</b></p>
                    </div>
                    <p className="mt-3 font-semibold">{numberText(row.otHours)} hrs - {row.otMultiplier}x</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
