import { BarChart3, TrendingUp } from 'lucide-react'
import { cn } from '../../utils/cn'

export function BrandMark({ compact = false, dark = false, className = '' }: { compact?: boolean; dark?: boolean; className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[#071b3d] via-[#0b3b75] to-[#1267e8] text-white shadow-[0_16px_30px_rgba(11,42,85,0.28)] ring-1 ring-white/40">
        <div className="absolute inset-x-2 bottom-2 flex items-end justify-center gap-1 opacity-80">
          <span className="h-2 w-1.5 rounded-t bg-[#28d79f]" />
          <span className="h-4 w-1.5 rounded-t bg-[#28d79f]" />
          <span className="h-6 w-1.5 rounded-t bg-[#60a5fa]" />
        </div>
        <span className="relative -mt-1 text-2xl font-black tracking-tighter drop-shadow-sm">WP</span>
        <TrendingUp className="absolute right-1.5 top-1.5 h-4 w-4 text-[#28d79f]" strokeWidth={3} />
      </div>
      {!compact ? (
        <div className="leading-tight">
          <p className={cn('text-xl font-black tracking-tight', dark ? 'text-white' : 'text-slate-950')}>WorkPay <span className={dark ? 'text-blue-200' : 'text-[#2563eb]'}>Tracker</span></p>
          <p className={cn('text-xs font-semibold', dark ? 'text-blue-100' : 'text-slate-500')}>Track income. Plan smarter.</p>
        </div>
      ) : null}
    </div>
  )
}

export function MiniChartIllustration({ className = '' }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute bottom-4 right-5 hidden items-end gap-2 opacity-25 sm:flex', className)}>
      {[28, 44, 62, 82, 108].map((height, index) => (
        <span key={height} className="w-4 rounded-t-xl bg-white/80" style={{ height: `${height}px`, opacity: 0.42 + index * 0.08 }} />
      ))}
      <BarChart3 className="mb-1 h-9 w-9 text-white/80" />
    </div>
  )
}
