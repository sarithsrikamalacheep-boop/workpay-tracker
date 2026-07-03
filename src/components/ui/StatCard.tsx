import { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { cn } from '../../utils/cn'
import { IconBadge } from './IconBadge'

export function StatCard({ title, value, sub, icon: Icon, tone = 'blue' }: { title: string; value: string; sub?: string; icon: LucideIcon; tone?: 'blue' | 'green' | 'purple' | 'orange' | 'red' }) {
  return (
    <Card className="min-w-0 p-5 transition hover:-translate-y-0.5 hover:shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 pr-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
        <IconBadge icon={Icon} tone={tone} className={cn('h-12 w-12 shadow-sm')} />
      </div>
      <div className="mt-4 min-w-0">
        <p className="max-w-full whitespace-nowrap text-[clamp(1.8rem,4.8vw,2.45rem)] font-black leading-none tracking-tight text-slate-950">{value}</p>
        {sub ? <p className="mt-3 text-base font-semibold leading-snug text-muted-foreground">{sub}</p> : null}
      </div>
    </Card>
  )
}
