import { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'

type Tone = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'slate'

export function IconBadge({ icon: Icon, tone = 'blue', className = '' }: { icon: LucideIcon; tone?: Tone; className?: string }) {
  const styles: Record<Tone, string> = {
    blue: 'bg-blue-100 text-blue-700 ring-blue-200',
    green: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    purple: 'bg-purple-100 text-purple-700 ring-purple-200',
    orange: 'bg-amber-100 text-amber-700 ring-amber-200',
    red: 'bg-red-100 text-red-700 ring-red-200',
    slate: 'bg-slate-200 text-slate-700 ring-slate-300',
  }
  return (
    <span className={cn('inline-grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1 sm:h-12 sm:w-12 sm:rounded-2xl', styles[tone], className)}>
      <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.4} />
    </span>
  )
}
