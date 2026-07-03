import { useMemo, useState } from 'react'
import { MonthlyIncomeChart, SimpleBarChart } from '../components/charts/Charts'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { forecastAnnualIncome, getCurrentSalary, monthsForYear, summarizeMonth } from '../utils/calculations'
import { money } from '../utils/format'
import { PageProps } from './pageTypes'

const presets = {
  conservative: { name: 'Conservative', ot: 8, bonus: 30000 },
  expected: { name: 'Expected', ot: 18, bonus: 70000 },
  best: { name: 'Best Case', ot: 30, bonus: 100000 },
}

export function ForecastSimulator({ data, month }: PageProps) {
  const currentSalary = getCurrentSalary(data.salaryHistory, data.settings.currentSalary)
  const [scenario, setScenario] = useState('expected')
  const [newSalary, setNewSalary] = useState(currentSalary + 3000)
  const [effectiveMonth, setEffectiveMonth] = useState(month)
  const [averageOt, setAverageOt] = useState(presets.expected.ot)
  const [bonus, setBonus] = useState(presets.expected.bonus)
  const [bonusMonth, setBonusMonth] = useState('2026-12')
  const [target, setTarget] = useState(data.settings.annualIncomeTarget ?? 0)
  const currentForecast = forecastAnnualIncome(data, Number(month.slice(0, 4)))

  const projection = useMemo(() => monthsForYear(Number(month.slice(0, 4))).map((m) => {
    const base = m >= effectiveMonth ? newSalary : summarizeMonth(data, m).baseSalary
    const hourly = data.settings.otHourDivisor > 0 ? base / data.settings.otHourDivisor : 0
    const otBasePay = hourly * averageOt * data.settings.otMultiplier1
    const mealAllowance = averageOt < 1 ? 0 : averageOt >= data.settings.extraMealThresholdHours ? data.settings.mealAllowanceAmount * 2 : data.settings.mealAllowanceAmount
    const transportAllowance = averageOt < 1 || averageOt >= data.settings.transportCutoffHours ? 0 : data.settings.transportAllowanceAmount
    const otIncome = otBasePay + mealAllowance + transportAllowance
    const bonusIncome = m === bonusMonth ? bonus : 0
    return { month: m, baseSalary: base, otHours: averageOt, otIncome, otBasePay, mealAllowance, transportAllowance, bonusIncome, extraIncome: 0, otherIncome: 0, grossIncome: base + otIncome + bonusIncome, deduction: 0, netEstimate: base + otIncome + bonusIncome, workdayCount: 0, otDayCount: 0, mostCommonWorkTag: '-', workloadLevelSummary: { light: 0, normal: 0, heavy: 0, veryHeavy: 0 } }
  }), [averageOt, bonus, bonusMonth, data, effectiveMonth, month, newSalary])
  const scenarioForecast = projection.reduce((sum, item) => sum + item.grossIncome, 0)
  const applyPreset = (key: keyof typeof presets) => {
    setScenario(key)
    setAverageOt(presets[key].ot)
    setBonus(presets[key].bonus)
  }
  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="text-sm font-semibold">Scenario<Select value={scenario} onChange={(e) => applyPreset(e.target.value as keyof typeof presets)}>{Object.entries(presets).map(([key, value]) => <option key={key} value={key}>{value.name}</option>)}</Select></label>
          <label className="text-sm font-semibold">New Salary<Input type="number" value={newSalary} onChange={(e) => setNewSalary(Number(e.target.value))} /></label>
          <label className="text-sm font-semibold">Effective Month<Input type="month" value={effectiveMonth} onChange={(e) => setEffectiveMonth(e.target.value)} /></label>
          <label className="text-sm font-semibold">Average OT / Month<Input type="number" value={averageOt} onChange={(e) => setAverageOt(Number(e.target.value))} /></label>
          <label className="text-sm font-semibold">Bonus Amount<Input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))} /></label>
          <label className="text-sm font-semibold">Bonus Month<Input type="month" value={bonusMonth} onChange={(e) => setBonusMonth(e.target.value)} /></label>
          <label className="text-sm font-semibold">Annual Target<Input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))} /></label>
        </div>
      </Card>
      <Card><p className="font-semibold text-blue-900">If salary changes from {money(currentSalary, data.settings)} to {money(newSalary, data.settings)} starting {effectiveMonth}, annual income changes by about {money(scenarioForecast - currentForecast, data.settings)} and reaches {target ? Math.round((scenarioForecast / target) * 100) : 0}% of the goal.</p></Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-3 font-bold">Monthly Projected Income</h2><MonthlyIncomeChart data={projection} /></Card>
        <Card><h2 className="mb-3 font-bold">Current vs Scenario</h2><SimpleBarChart data={[{ name: 'Current', value: currentForecast }, { name: 'Scenario', value: scenarioForecast }]} y="value" color="#16a34a" /></Card>
      </div>
    </div>
  )
}
