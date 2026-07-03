import { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { cn } from '../../utils/cn'
import { IconBadge } from './IconBadge'

export function StatCard({ title, value, sub, icon: Icon, tone = 'blue' }: { title: string; value: string; sub?: string; icon: LucideIcon; tone?: 'blue' | 'green' | 'purple' | 'orange' | 'red' }) {
  return (
    <Card className="min-w-0 p-4 transition hover:-translate-y-0.5 hover:shadow-xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 pr-2 text-xs font-bold uppercase tracking-wide text-muted-foreground sm:text-sm">{title}</p>
        <IconBadge icon={Icon} tone={tone} className={cn('shadow-sm')} />
      </div>
      <div className="mt-3 min-w-0 sm:mt-4">
        <p className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[clamp(1.25rem,6vw,2rem)] font-black leading-none tracking-tight text-slate-950 sm:text-[clamp(1.8rem,4.8vw,2.45rem)]">{value}</p>
        {sub ? <p className="mt-2 text-xs font-semibold leading-snug text-muted-foreground sm:mt-3 sm:text-base">{sub}</p> : null}
      </div>
    </Card>
  )
}
