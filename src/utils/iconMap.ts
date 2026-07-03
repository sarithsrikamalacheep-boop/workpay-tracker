import { Banknote, Bus, Car, CircleEllipsis, Clapperboard, HeartPulse, Home, LucideIcon, PiggyBank, Plane, ReceiptText, ShoppingBag, TrendingUp, Utensils } from 'lucide-react'

export function categoryIcon(name: string): LucideIcon {
  const key = name.toLowerCase()
  if (key.includes('food')) return Utensils
  if (key.includes('transport')) return Car
  if (key.includes('shopping')) return ShoppingBag
  if (key.includes('bill')) return ReceiptText
  if (key.includes('family')) return Home
  if (key.includes('travel')) return Plane
  if (key.includes('health')) return HeartPulse
  if (key.includes('entertainment')) return Clapperboard
  if (key.includes('saving')) return PiggyBank
  if (key.includes('investment')) return TrendingUp
  if (key.includes('salary')) return Banknote
  if (key.includes('transport allowance')) return Bus
  return CircleEllipsis
}
