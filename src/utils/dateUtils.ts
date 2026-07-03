import { format, parseISO } from 'date-fns'

export const monthKey = (date: string | Date) => format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM')
export const dayKey = (date: string | Date) => format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd')
export const yearKey = (date: string | Date) => format(typeof date === 'string' ? parseISO(date) : date, 'yyyy')

export function thaiMonth(month: string) {
  const date = parseISO(`${month}-01`)
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(date)
}

export function thaiDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(parseISO(date))
}
