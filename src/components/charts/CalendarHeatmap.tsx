import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth } from 'date-fns'
import { DailyWorkLog } from '../../types'

export function CalendarHeatmap({ month, logs, onSelect }: { month: string; logs: DailyWorkLog[]; onSelect?: (date: string) => void }) {
  const days = eachDayOfInterval({ start: startOfMonth(parseISO(`${month}-01`)), end: endOfMonth(parseISO(`${month}-01`)) })
  const byDate = new Map(logs.map((log) => [log.date, log]))
  const tone = (hours: number) => (hours <= 0 ? 'bg-slate-100 text-slate-400' : hours < 1.5 ? 'bg-green-100 text-green-800' : hours < 3 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
  return (
    <div className="grid grid-cols-7 gap-1">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="py-1 text-center text-xs font-semibold text-slate-500">{day}</div>)}
      {days.map((day) => {
        const date = format(day, 'yyyy-MM-dd')
        const log = byDate.get(date)
        return (
          <button key={date} onClick={() => onSelect?.(date)} className={`aspect-square rounded-lg p-1 text-left text-xs transition hover:ring-2 hover:ring-brand ${tone(log?.otHours ?? 0)}`}>
            <span className="font-bold">{format(day, 'd')}</span>
            <span className="mt-1 block">{log?.otHours ? `${log.otHours}h` : ''}</span>
          </button>
        )
      })}
    </div>
  )
}
