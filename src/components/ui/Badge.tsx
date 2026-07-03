import { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray' }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-600/10',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/10',
    orange: 'bg-amber-50 text-amber-700 ring-amber-600/10',
    red: 'bg-red-50 text-red-700 ring-red-600/10',
    purple: 'bg-purple-50 text-purple-700 ring-purple-600/10',
    gray: 'bg-slate-100 text-slate-600 ring-slate-600/10',
  }
  return <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset', styles[tone])}>{children}</span>
}
