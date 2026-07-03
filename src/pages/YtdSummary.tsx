import { Calendar, Clock, PiggyBank, Receipt, Trophy } from 'lucide-react'
import { DualBarChart, OtTrendChart } from '../components/charts/Charts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { StatCard } from '../components/ui/StatCard'
import { calculateTotalExpenses, calculateYtdExpenses, calculateYtdNetSaved, monthsForYear, summarizeYear } from '../utils/calculations'
import { money, numberText } from '../utils/format'
import { PageProps } from './pageTypes'
import { MiniChartIllustration } from '../components/brand/BrandMark'

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function YtdSummary({ data, month, setMonth }: PageProps) {
  const year = Number(month.slice(0, 4))
  const throughMonth = year === new Date().getFullYear() ? Number(month.slice(5, 7)) : 12
  const ytd = summarizeYear(data, year, throughMonth)
  const allMonths = monthsForYear(year).map((item) => summarizeYear(data, year, 12).summaries.find((summary) => summary.month === item)!)
  const average = ytd.total.gross / Math.max(1, ytd.summaries.length)
  const ytdExpenses = calculateYtdExpenses(year, data.expenseRecords, throughMonth)
  const netSaved = calculateYtdNetSaved(year, data, throughMonth)
  const averageSpending = ytdExpenses / Math.max(1, throughMonth)
  const savingRate = ytd.total.gross > 0 ? (netSaved / ytd.total.gross) * 100 : 0
  const monthExpenseRows = allMonths.map((item) => ({ month: item.month, expenses: calculateTotalExpenses(item.month, data.expenseRecords) }))
  const highestSpending = [...monthExpenseRows].sort((a, b) => b.expenses - a.expenses)[0]
  const bestSaving = [...allMonths]
    .map((item) => ({ month: item.month, saved: item.grossIncome - calculateTotalExpenses(item.month, data.expenseRecords) }))
    .sort((a, b) => b.saved - a.saved)[0]
  const top = ytd.bestIncomeMonth
  const topHasBonus = top ? (top.bonusIncome + top.extraIncome + top.otherIncome) > 0 : false

  return (
    <div className="space-y-4 sm:space-y-7">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-4xl">Year Summary</h2>
          <p className="mt-1 text-sm text-muted-foreground sm:mt-2 sm:text-base">Yearly income, expenses, and savings.</p>
        </div>
        <label className="w-44 text-sm font-semibold text-slate-700">Year<Input type="number" value={year} onChange={(event) => setMonth(`${event.target.value}-${month.slice(5, 7)}`)} /></label>
      </div>

      <Card className="relative overflow-hidden bg-gradient-to-br from-[#071b3d] via-[#0f4ed8] to-[#2f7cff] text-white shadow-glow">
        <MiniChartIllustration />
        <CardHeader>
          <CardTitle className="text-white">YTD Income</CardTitle>
          <CardDescription className="text-blue-100">Actual income from January through the selected month</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold tracking-tight sm:text-6xl">{money(ytd.total.gross, data.settings)}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard title="Average Monthly Income" value={money(average, data.settings)} icon={Calendar} tone="green" />
        <StatCard title="Total OT Hours" value={`${numberText(ytd.total.otHours)} hrs`} sub={money(ytd.total.ot, data.settings)} icon={Clock} tone="orange" />
        <StatCard title="Best Income Month" value={top ? monthNames[Number(top.month.slice(5, 7)) - 1] : '-'} sub={money(top?.grossIncome ?? 0, data.settings)} icon={Trophy} tone="purple" />
        <StatCard title="Total Expenses YTD" value={money(ytdExpenses, data.settings)} icon={Receipt} tone="orange" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard title="Net Saved YTD" value={money(netSaved, data.settings)} sub={`${numberText(savingRate)}% saving rate`} icon={PiggyBank} tone={netSaved >= 0 ? 'green' : 'red'} />
        <StatCard title="Average Monthly Spending" value={money(averageSpending, data.settings)} icon={Receipt} tone="orange" />
        <StatCard title="Best Saving Month" value={bestSaving ? monthNames[Number(bestSaving.month.slice(5, 7)) - 1] : '-'} sub={money(bestSaving?.saved ?? 0, data.settings)} icon={PiggyBank} tone="green" />
        <StatCard title="Highest Spending Month" value={highestSpending ? monthNames[Number(highestSpending.month.slice(5, 7)) - 1] : '-'} sub={money(highestSpending?.expenses ?? 0, data.settings)} icon={Receipt} tone="red" />
      </div>

      <Card>
        <CardHeader><CardTitle>Yearly OT Breakdown</CardTitle><CardDescription>OT pay, meal allowance, and transport allowance</CardDescription></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-muted p-3 sm:p-4"><p className="text-xs text-muted-foreground sm:text-base">OT Pay</p><p className="mt-1 text-xl font-bold sm:mt-2 sm:text-2xl">{money(ytd.total.otBasePay, data.settings)}</p></div>
            <div className="rounded-2xl bg-emerald-50 p-3 sm:p-4"><p className="text-xs text-emerald-700 sm:text-base">Meal</p><p className="mt-1 text-xl font-bold text-emerald-800 sm:mt-2 sm:text-2xl">{money(ytd.total.mealAllowance, data.settings)}</p></div>
            <div className="rounded-2xl bg-blue-50 p-3 sm:p-4"><p className="text-xs text-blue-700 sm:text-base">Transport</p><p className="mt-1 text-xl font-bold text-blue-800 sm:mt-2 sm:text-2xl">{money(ytd.total.transportAllowance, data.settings)}</p></div>
            <div className="rounded-2xl bg-amber-50 p-3 sm:p-4"><p className="text-xs text-amber-700 sm:text-base">Total OT</p><p className="mt-1 text-xl font-bold text-amber-800 sm:mt-2 sm:text-2xl">{money(ytd.total.ot, data.settings)}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50">
        <p className="text-sm font-semibold text-blue-950 sm:text-lg">
          This year&apos;s income is {money(ytd.total.gross, data.settings)}
          {top ? `, and the highest income month is ${monthNames[Number(top.month.slice(5, 7)) - 1]}${topHasBonus ? ' because it includes extra pay.' : ' from salary and OT.'}` : '.'}
        </p>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly Income vs Expense</CardTitle><CardDescription>Total income compared with actual expenses</CardDescription></CardHeader>
          <CardContent><DualBarChart data={allMonths.map((item) => ({ name: item.month.slice(5), income: item.grossIncome, expenses: calculateTotalExpenses(item.month, data.expenseRecords) }))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Monthly OT Hours</CardTitle><CardDescription>OT hours by month</CardDescription></CardHeader>
          <CardContent><OtTrendChart data={allMonths.map((item) => ({ month: item.month.slice(5), otHours: item.otHours }))} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Breakdown</CardTitle><CardDescription>Readable month-by-month income details</CardDescription></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allMonths.map((item) => {
              const monthIndex = Number(item.month.slice(5, 7)) - 1
              const bonusExtra = item.bonusIncome + item.extraIncome + item.otherIncome
              return (
                <div key={item.month} className="rounded-2xl border border-border bg-white p-3 shadow-sm sm:p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-slate-950 sm:text-lg">{monthNames[monthIndex]}</p>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        OT {numberText(item.otHours)} hrs / OT Pay {money(item.otBasePay, data.settings)} / Meal {money(item.mealAllowance, data.settings)} / Transport {money(item.transportAllowance, data.settings)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                        Salary {money(item.baseSalary, data.settings)} / OT Income {money(item.otIncome, data.settings)} / Bonus {money(bonusExtra, data.settings)}
                      </p>
                    </div>
                    <p className="text-base font-bold text-emerald-700 sm:text-xl">Total {money(item.grossIncome, data.settings)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
