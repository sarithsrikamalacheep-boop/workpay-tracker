import { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

export function Select({ className = '', ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn('min-h-12 w-full rounded-xl border border-input bg-white px-4 py-3 text-base shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
}
