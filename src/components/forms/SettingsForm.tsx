import { UserSettings } from '../../types'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Select } from '../ui/Select'

export function SettingsForm({ settings, onChange, onReset, onClear }: { settings: UserSettings; onChange: (settings: UserSettings) => void; onReset: () => void; onClear: () => void }) {
  const set = <K extends keyof UserSettings>(key: K, next: UserSettings[K]) => onChange({ ...settings, [key]: next })
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-3">
        <h3 className="font-bold text-slate-900">Salary Settings</h3>
        <label className="text-sm font-semibold text-slate-700">Current Salary<Input type="number" value={settings.currentSalary} onChange={(e) => set('currentSalary', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">OT Hour Divisor<Input type="number" value={settings.otHourDivisor} onChange={(e) => set('otHourDivisor', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">Payday<Select value={settings.paydayType} onChange={(e) => set('paydayType', e.target.value as UserSettings['paydayType'])}><option value="monthEnd">Month End</option><option value="specificDate">Specific Date</option></Select></label>
      </section>
      <section className="space-y-3">
        <h3 className="font-bold text-slate-900">OT & Goal Settings</h3>
        <label className="text-sm font-semibold text-slate-700">OT Multiplier 1<Input type="number" step="0.1" value={settings.otMultiplier1} onChange={(e) => set('otMultiplier1', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">OT Multiplier 2<Input type="number" step="0.1" value={settings.otMultiplier2} onChange={(e) => set('otMultiplier2', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">OT Multiplier 3<Input type="number" step="0.1" value={settings.otMultiplier3} onChange={(e) => set('otMultiplier3', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">Meal Allowance<Input type="number" value={settings.mealAllowanceAmount} onChange={(e) => set('mealAllowanceAmount', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">Transport Allowance<Input type="number" value={settings.transportAllowanceAmount} onChange={(e) => set('transportAllowanceAmount', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">OT Rounding<Select value={settings.roundOtMode} onChange={(e) => set('roundOtMode', e.target.value as UserSettings['roundOtMode'])}><option value="none">No Rounding</option><option value="halfHour">Half Hour</option><option value="oneHour">One Hour</option></Select></label>
        <label className="text-sm font-semibold text-slate-700">Annual Income Target<Input type="number" value={settings.annualIncomeTarget ?? 0} onChange={(e) => set('annualIncomeTarget', Number(e.target.value))} /></label>
        <label className="text-sm font-semibold text-slate-700">OT Income Target<Input type="number" value={settings.otIncomeTarget ?? 0} onChange={(e) => set('otIncomeTarget', Number(e.target.value))} /></label>
      </section>
      <section className="space-y-3 lg:col-span-2">
        <h3 className="font-bold text-slate-900">App Settings</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-semibold text-slate-700">Currency<Input value={settings.currency} onChange={(e) => set('currency', e.target.value)} /></label>
          <label className="text-sm font-semibold text-slate-700">Language<Select value={settings.language} onChange={(e) => set('language', e.target.value as UserSettings['language'])}><option value="en">English</option><option value="th">Thai</option></Select></label>
          <label className="flex items-center gap-2 pt-7 text-sm font-semibold text-slate-700"><input type="checkbox" checked={settings.privacyMode} onChange={(e) => set('privacyMode', e.target.checked)} />Privacy mode</label>
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={onReset}>Reset Demo Data</Button><Button variant="danger" onClick={onClear}>Clear All Data</Button></div>
      </section>
    </div>
  )
}
