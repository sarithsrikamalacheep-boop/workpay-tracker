import { AppData } from '../types'
import { dailyRowsForMonth, monthsForYear, summarizeMonth, summarizeYear, tagAnalysis } from './calculations'

function escapeCsv(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

export function toCsv<T extends object>(rows: T[]) {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0] as Record<string, unknown>)
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escapeCsv((row as Record<string, unknown>)[header])).join(','))].join('\n')
}

export function downloadText(filename: string, content: string, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function exportDailyLogs(data: AppData, month?: string) {
  const rows = month ? dailyRowsForMonth(data, month) : data.dailyLogs
  return toCsv(rows.map((row) => ({
    date: row.date,
    otHours: row.otHours,
    otType: row.otType,
    otMultiplier: row.otMultiplier,
    otPay: 'otPay' in row ? row.otPay : '',
    note: row.workNote,
    tags: row.workTags.join('|'),
    workload: row.workloadLevel,
    status: row.status,
  })))
}

export function exportMonthlySummary(data: AppData, year: number) {
  return toCsv(monthsForYear(year).map((month) => summarizeMonth(data, month)))
}

export function exportYtdSummary(data: AppData, year: number) {
  const ytd = summarizeYear(data, year, 12)
  return toCsv(ytd.summaries)
}

export function exportOtAnalysis(data: AppData) {
  return toCsv(tagAnalysis(data))
}

export function exportJson(data: AppData) {
  return JSON.stringify(data, null, 2)
}
