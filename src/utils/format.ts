import { UserSettings } from '../types'

export function money(value: number, settings: UserSettings, compact = false) {
  if (settings.privacyMode) return '฿•••••'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: settings.currency,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(value || 0)
}

export function numberText(value: number, digits = 1) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value || 0)
}

export function percent(value: number) {
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value || 0)}%`
}
