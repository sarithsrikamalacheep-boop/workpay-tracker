import { Banknote, CalendarDays, Clock, PiggyBank, TrendingUp } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { MiniChartIllustration } from '../components/brand/BrandMark'
import { calculateBudgetSummary, dailyRowsForMonth, getCurrentSalary, summarizeMonth, summarizeYear } from '../utils/calculations'
import { thaiDate } from '../utils/dateUtils'
import { money, numberText } from '../utils/format'
import { PageProps } from './pageTypes'

export function Dashboard({ data, month, onNavigate }: PageProps) {
  const year = Number(month.slice(0, 4))
  const selectedMonthIndex = Number(month.slice(5, 7))
  const summary = summarizeMonth(data, month)
  const ytd = summarizeYear(data, year, selectedMonthIndex)
  const currentSalary = getCurrentSalary(data.salaryHistory, data.settings.currentSalary)
  const budget = calculateBudgetSummary(month, data)
  const recent = data.dailyLogs.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <div className="space-y-7">
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#071b3d] via-[#0f4ed8] to-[#2f7cff] p-6 text-white shadow-glow ring-1 ring-blue-200 md:p-8">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(ellipse_at_bottom,rgba(255,255,255,0.22),transparent_65%)]" />
        <MiniChartIllustration />
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="relative z-10">
            <Badge tone="green">Current Month</Badge>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">This Month's Income</h2>
            <p className="mt-4 text-5xl font-black tracking-tight sm:text-6xl">{money(summary.grossIncome, data.settings)}</p>
            <p className="mt-3 text-lg text-blue-100">Salary + OT + Bonus / Extra Pay</p>
          </div>
          <Button size="lg" className="relative z-10 w-full rounded-2xl !bg-white !text-[#0b3b75] shadow-xl hover:!bg-blue-50 md:w-auto" onClick={() => onNavigate?.('calendar')}>
            <CalendarDays size={22} />Open OT Calendar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Monthly OT" value={`${numberText(summary.otHours)} hrs`} sub={`${money(summary.otIncome, data.settings)} total OT income`} icon={Clock} tone="orange" />
        <StatCard title="YTD Income" value={money(ytd.total.gross, data.settings)} sub={`${selectedMonthIndex} months included`} icon={TrendingUp} tone="green" />
        <StatCard title="Current Salary" value={money(currentSalary, data.settings)} sub="Active salary for calculations" icon={Banknote} tone="blue" />
        <StatCard title="Budget Status" value={money(budget.moneyLeft, data.settings)} sub={`${money(budget.safeToSpendToday, data.settings)} safe to spend today`} icon={PiggyBank} tone={budget.allocationStatus.status === 'over' ? 'red' : budget.allocationStatus.status === 'under' ? 'orange' : 'green'} />
      </div>

      <Card className="overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Budget Status</CardTitle>
            <CardDescription>{budget.allocationStatus.message}</CardDescription>
          </div>
          <Button variant="outline" onClick={() => onNavigate?.('budget')}>Open Budget</Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-emerald-700">Money Left</p><p className="mt-2 text-3xl font-bold text-emerald-800">{money(budget.moneyLeft, data.settings)}</p></div>
            <div className="rounded-2xl bg-amber-50 p-4"><p className="text-amber-700">Total Spent</p><p className="mt-2 text-3xl font-bold text-amber-800">{money(budget.totalSpent, data.settings)}</p></div>
            <div className="rounded-2xl bg-blue-50 p-4"><p className="text-blue-700">Safe Today</p><p className="mt-2 text-3xl font-bold text-blue-800">{money(budget.safeToSpendToday, data.settings)}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent OT Logs</CardTitle>
            <CardDescription>Your latest calendar records</CardDescription>
          </div>
          <Button variant="outline" onClick={() => onNavigate?.('calendar')}>Open OT Calendar</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recent.map((log) => {
              const computed = dailyRowsForMonth(data, log.date.slice(0, 7)).find((item) => item.id === log.id)
              return (
                <div key={log.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-bold text-slate-950">{thaiDate(log.date)}</p>
                      <p className="mt-1 text-base text-muted-foreground">{numberText(log.otHours)} hrs - {log.workNote || 'No note'}</p>
                    </div>
                    <Badge tone="green">{money(computed?.otPay ?? 0, data.settings)}</Badge>
                  </div>
                </div>
              )
            })}
            {!recent.length ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-4 text-lg font-bold text-slate-900">No OT records yet</p>
                <p className="mt-1 text-muted-foreground">Tap a date on the calendar to add your first OT log.</p>
                <Button className="mt-5" onClick={() => onNavigate?.('calendar')}>Open OT Calendar</Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
