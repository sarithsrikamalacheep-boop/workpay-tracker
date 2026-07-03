import { AppData } from '../types'
import { forecastAnnualIncome, summarizeMonth, tagAnalysis } from './calculations'
import { money, percent } from './format'

export function dashboardInsights(data: AppData, month: string) {
  const current = summarizeMonth(data, month)
  const [year, m] = month.split('-').map(Number)
  const prevMonth = m === 1 ? `${year - 1}-12` : `${year}-${String(m - 1).padStart(2, '0')}`
  const previous = summarizeMonth(data, prevMonth)
  const incomeDiff = current.grossIncome - previous.grossIncome
  const otDiff = current.otHours - previous.otHours
  const target = data.settings.annualIncomeTarget ?? 0
  const forecast = forecastAnnualIncome(data, year)
  const topTag = tagAnalysis(data, data.dailyLogs.filter((log) => log.date.startsWith(month)))[0]?.tag

  return [
    incomeDiff >= 0
      ? `Income is up ${money(incomeDiff, data.settings)} from last month, with OT changing by ${otDiff.toFixed(1)} hours.`
      : `Income is down ${money(Math.abs(incomeDiff), data.settings)} from last month. Review OT and extra income for the main driver.`,
    previous.otHours > 0 ? `Monthly OT is ${otDiff >= 0 ? 'higher' : 'lower'} than last month by ${percent(Math.abs((otDiff / previous.otHours) * 100))}.` : `Monthly OT totals ${current.otHours.toFixed(1)} hours.`,
    target ? `Annual forecast is at ${percent((forecast / target) * 100)} of your yearly goal.` : 'Set an annual income target in Settings to track progress.',
    topTag ? `The highest OT work tag is ${topTag}.` : 'No work tags are recorded for this month yet.',
  ]
}

export function monthlyInsight(data: AppData, month: string) {
  const current = summarizeMonth(data, month)
  const [year, m] = month.split('-').map(Number)
  const prevMonth = m === 1 ? `${year - 1}-12` : `${year}-${String(m - 1).padStart(2, '0')}`
  const previous = summarizeMonth(data, prevMonth)
  const diff = current.grossIncome - previous.grossIncome
  const driver = Math.abs(current.otIncome - previous.otIncome) > Math.abs(current.bonusIncome - previous.bonusIncome) ? 'OT' : 'bonus / extra income'
  return `This month's income is ${diff >= 0 ? 'up' : 'down'} ${money(Math.abs(diff), data.settings)} from last month, mainly driven by ${driver}.`
}

export function notesSummary(data: AppData, month: string) {
  const logs = data.dailyLogs.filter((log) => log.date.startsWith(month))
  const tags = tagAnalysis(data, logs).slice(0, 3).map((item) => item.tag)
  const heavyDays = logs.filter((log) => ['heavy', 'veryHeavy'].includes(log.workloadLevel)).length
  const otWeeks = new Set(logs.filter((log) => log.otHours > 0).map((log) => Math.ceil(Number(log.date.slice(-2)) / 7)))
  return `This month mainly focused on ${tags.join(', ') || 'regular work'}, with ${heavyDays} heavy workload days and OT concentrated in week ${[...otWeeks].join(', ') || '-'}.`
}
