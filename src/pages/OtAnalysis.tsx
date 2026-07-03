import { Clock, Flame, Moon, Timer } from 'lucide-react'
import { CalendarHeatmap } from '../components/charts/CalendarHeatmap'
import { OtTrendChart, SimpleBarChart } from '../components/charts/Charts'
import { Card } from '../components/ui/Card'
import { StatCard } from '../components/ui/StatCard'
import { longestOtStreak, monthsForYear, summarizeMonth, tagAnalysis, weekdayOt } from '../utils/calculations'
import { thaiDate } from '../utils/dateUtils'
import { money, numberText } from '../utils/format'
import { PageProps } from './pageTypes'

export function OtAnalysis({ data, month }: PageProps) {
  const year = Number(month.slice(0, 4))
  const monthly = monthsForYear(year).map((item) => summarizeMonth(data, item))
  const tags = tagAnalysis(data)
  const highest = [...data.dailyLogs].sort((a, b) => b.otHours - a.otHours)[0]
  const noOtDays = data.dailyLogs.filter((log) => log.otHours === 0).length
  const avgWeek = data.dailyLogs.reduce((sum, log) => sum + log.otHours, 0) / Math.max(1, data.dailyLogs.length / 7)
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Highest OT Day" value={highest ? `${highest.otHours} hrs` : '-'} sub={highest ? thaiDate(highest.date) : ''} icon={Flame} tone="red" />
        <StatCard title="Longest Streak" value={`${longestOtStreak(data.dailyLogs)} days`} icon={Timer} tone="orange" />
        <StatCard title="Avg OT / Week" value={`${numberText(avgWeek)} hrs`} icon={Clock} />
        <StatCard title="No-OT Days" value={`${noOtDays} days`} icon={Moon} tone="green" />
      </div>
      <Card><p className="text-sm font-semibold text-blue-900">Most OT comes from {tags[0]?.tag ?? '-'}, totaling {numberText(tags[0]?.hours ?? 0)} hours and {money(tags[0]?.income ?? 0, data.settings)}.</p></Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-3 font-bold">OT Trend</h2><OtTrendChart data={monthly.map((item) => ({ month: item.month.slice(5), otHours: item.otHours }))} /></Card>
        <Card><h2 className="mb-3 font-bold">OT by Tag</h2><SimpleBarChart data={tags.map((tag) => ({ name: tag.tag, value: tag.hours }))} y="value" color="#2563eb" /></Card>
        <Card><h2 className="mb-3 font-bold">OT by Weekday</h2><SimpleBarChart data={weekdayOt(data).map((day) => ({ name: day.name, value: day.hours }))} y="value" color="#f59e0b" /></Card>
        <Card><h2 className="mb-3 font-bold">OT Heatmap</h2><CalendarHeatmap month={month} logs={data.dailyLogs.filter((log) => log.date.startsWith(month))} /></Card>
      </div>
    </div>
  )
}
