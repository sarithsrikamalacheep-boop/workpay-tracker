import { differenceInCalendarDays, differenceInCalendarMonths, endOfMonth, format, getDay, getMonth, isBefore, parseISO, startOfMonth } from 'date-fns'
import { AppData, BudgetAllocation, DailyWorkLog, ExpenseRecord, MonthlySummary, SalaryHistory, UserSettings, WorkloadLevel } from '../types'

export function calculateHourlyRate(monthlySalary: number, otHourDivisor: number) {
  return otHourDivisor > 0 ? monthlySalary / otHourDivisor : 0
}

export function roundOtHours(hours: number, mode: UserSettings['roundOtMode']) {
  if (mode === 'halfHour') return Math.round(hours * 2) / 2
  if (mode === 'oneHour') return Math.round(hours)
  return hours
}

export function calculateOtBasePay(hourlyRate: number, otHours: number, otMultiplier: number) {
  return hourlyRate * otHours * otMultiplier
}

export function calculateMealAllowance(otHours: number, mealAllowanceAmount: number, extraMealThresholdHours: number) {
  if (otHours < 1) return 0
  if (otHours >= extraMealThresholdHours) return mealAllowanceAmount * 2
  return mealAllowanceAmount
}

export function calculateTransportAllowance(otHours: number, transportAllowanceAmount: number, transportCutoffHours: number) {
  if (otHours < 1) return 0
  if (otHours >= transportCutoffHours) return 0
  return transportAllowanceAmount
}

function getOtMultiplierForLog(log: DailyWorkLog, settings: UserSettings) {
  if (log.otType === 'holiday') return settings.otMultiplier2
  if (log.otType === 'special') return settings.otMultiplier3
  return settings.otMultiplier1
}

export function calculateDailyOtIncome(log: DailyWorkLog, monthlySalary: number, settings: UserSettings) {
  const otHours = roundOtHours(log.otHours, settings.roundOtMode)
  const hourlyRate = calculateHourlyRate(monthlySalary, settings.otHourDivisor)
  const otMultiplier = getOtMultiplierForLog(log, settings)
  const otBasePay = calculateOtBasePay(hourlyRate, otHours, otMultiplier)
  const mealAllowance = calculateMealAllowance(otHours, settings.mealAllowanceAmount, settings.extraMealThresholdHours)
  const transportAllowance = calculateTransportAllowance(otHours, settings.transportAllowanceAmount, settings.transportCutoffHours)
  return {
    hourlyRate,
    otMultiplier,
    otBasePay,
    mealAllowance,
    transportAllowance,
    totalOtIncome: otBasePay + mealAllowance + transportAllowance,
  }
}

export function calculateOtPay(log: DailyWorkLog, monthlySalary: number, settings: UserSettings) {
  return calculateDailyOtIncome(log, monthlySalary, settings).totalOtIncome
}

export function calculateMonthlyOtSummary(logs: DailyWorkLog[], salary: number, settings: UserSettings) {
  return logs.reduce(
    (acc, log) => {
      const daily = calculateDailyOtIncome(log, salary, settings)
      return {
        totalOtHours: acc.totalOtHours + log.otHours,
        totalOtBasePay: acc.totalOtBasePay + daily.otBasePay,
        totalMealAllowance: acc.totalMealAllowance + daily.mealAllowance,
        totalTransportAllowance: acc.totalTransportAllowance + daily.transportAllowance,
        totalOtIncome: acc.totalOtIncome + daily.totalOtIncome,
      }
    },
    { totalOtHours: 0, totalOtBasePay: 0, totalMealAllowance: 0, totalTransportAllowance: 0, totalOtIncome: 0 },
  )
}

export function getSalaryForMonth(month: string, history: SalaryHistory[], fallback: number) {
  const target = endOfMonth(parseISO(`${month}-01`))
  const sorted = [...history].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate))
  const active = sorted.filter((item) => parseISO(item.effectiveDate) <= target).at(-1)
  return active?.salary ?? fallback
}

export function getCurrentSalary(history: SalaryHistory[], fallback: number) {
  return [...history].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate)).at(-1)?.salary ?? fallback
}

export function summarizeMonth(data: AppData, month: string): MonthlySummary {
  const baseSalary = getSalaryForMonth(month, data.salaryHistory, data.settings.currentSalary)
  const logs = data.dailyLogs.filter((log) => log.date.startsWith(month))
  const bonusItems = data.bonusExtraIncome.filter((item) => item.month === month && item.status !== 'expected')
  const expectedOther = data.bonusExtraIncome.filter((item) => item.month === month && item.status === 'expected')
  const deductions = data.deductions.filter((item) => item.month === month)
  const tagCount = new Map<string, number>()
  const workloadLevelSummary: Record<WorkloadLevel, number> = { light: 0, normal: 0, heavy: 0, veryHeavy: 0 }

  const otSummary = calculateMonthlyOtSummary(logs, baseSalary, data.settings)
  const otIncome = otSummary.totalOtIncome
  const otHours = otSummary.totalOtHours
  logs.forEach((log) => {
    workloadLevelSummary[log.workloadLevel] += 1
    log.workTags.forEach((tag) => tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1))
  })

  const bonusIncome = bonusItems.filter((item) => ['bonus', 'specialBonus', 'aprilExtraPay'].includes(item.type)).reduce((sum, item) => sum + item.amount, 0)
  const extraIncome = bonusItems.filter((item) => ['allowance', 'incentive', 'adjustment'].includes(item.type)).reduce((sum, item) => sum + item.amount, 0)
  const otherIncome = bonusItems.filter((item) => item.type === 'other').reduce((sum, item) => sum + item.amount, 0) + expectedOther.filter((item) => item.status === 'paid').reduce((sum, item) => sum + item.amount, 0)
  const deduction = deductions.reduce((sum, item) => sum + item.amount, 0)
  const grossIncome = baseSalary + otIncome + bonusIncome + extraIncome + otherIncome
  const mostCommonWorkTag = [...tagCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-'

  return {
    month,
    baseSalary,
    otHours,
    otIncome,
    otBasePay: otSummary.totalOtBasePay,
    mealAllowance: otSummary.totalMealAllowance,
    transportAllowance: otSummary.totalTransportAllowance,
    bonusIncome,
    extraIncome,
    otherIncome,
    grossIncome,
    deduction,
    netEstimate: grossIncome - deduction,
    workdayCount: logs.filter((log) => log.isWorkday).length,
    otDayCount: logs.filter((log) => log.otHours > 0).length,
    mostCommonWorkTag,
    workloadLevelSummary,
  }
}

export function monthsForYear(year: number) {
  return Array.from({ length: 12 }, (_, index) => `${year}-${String(index + 1).padStart(2, '0')}`)
}

export function summarizeYear(data: AppData, year: number, throughMonth = 12) {
  const summaries = monthsForYear(year).slice(0, throughMonth).map((month) => summarizeMonth(data, month))
  const total = summaries.reduce(
    (acc, item) => ({
      gross: acc.gross + item.grossIncome,
      net: acc.net + item.netEstimate,
      base: acc.base + item.baseSalary,
      ot: acc.ot + item.otIncome,
      otBasePay: acc.otBasePay + item.otBasePay,
      mealAllowance: acc.mealAllowance + item.mealAllowance,
      transportAllowance: acc.transportAllowance + item.transportAllowance,
      bonus: acc.bonus + item.bonusIncome + item.extraIncome + item.otherIncome,
      deduction: acc.deduction + item.deduction,
      otHours: acc.otHours + item.otHours,
    }),
    { gross: 0, net: 0, base: 0, ot: 0, otBasePay: 0, mealAllowance: 0, transportAllowance: 0, bonus: 0, deduction: 0, otHours: 0 },
  )
  const bestIncomeMonth = [...summaries].sort((a, b) => b.grossIncome - a.grossIncome)[0]
  const highestOtMonth = [...summaries].sort((a, b) => b.otHours - a.otHours)[0]
  return { summaries, total, bestIncomeMonth, highestOtMonth }
}

export function forecastAnnualIncome(data: AppData, year: number) {
  const currentMonthIndex = getMonth(new Date()) + 1
  const ytd = summarizeYear(data, year, currentMonthIndex)
  const monthsWithData = ytd.summaries.filter((item) => item.otHours > 0 || item.bonusIncome > 0 || item.extraIncome > 0)
  const averageOtIncome = monthsWithData.length ? monthsWithData.reduce((sum, item) => sum + item.otIncome, 0) / monthsWithData.length : 0
  const currentSalary = getCurrentSalary(data.salaryHistory, data.settings.currentSalary)
  const remainingMonths = Math.max(0, 12 - currentMonthIndex)
  const expectedFutureIncome = data.bonusExtraIncome
    .filter((item) => item.status === 'expected' && item.month.startsWith(String(year)))
    .reduce((sum, item) => sum + item.amount, 0)
  return ytd.total.gross + remainingMonths * (currentSalary + averageOtIncome) + expectedFutureIncome
}

export function salaryAnnualImpact(record: SalaryHistory) {
  const effective = parseISO(record.effectiveDate)
  const remaining = 12 - getMonth(effective)
  return (record.increaseAmount ?? 0) * remaining
}

export function tagAnalysis(data: AppData, logs = data.dailyLogs) {
  const map = new Map<string, { tag: string; hours: number; income: number; days: number }>()
  logs.forEach((log) => {
    const month = format(parseISO(log.date), 'yyyy-MM')
    const salary = getSalaryForMonth(month, data.salaryHistory, data.settings.currentSalary)
    const pay = calculateOtPay(log, salary, data.settings)
    log.workTags.forEach((tag) => {
      const row = map.get(tag) ?? { tag, hours: 0, income: 0, days: 0 }
      row.hours += log.otHours
      row.income += pay / Math.max(1, log.workTags.length)
      row.days += 1
      map.set(tag, row)
    })
  })
  return [...map.values()].sort((a, b) => b.hours - a.hours)
}

export function weekdayOt(data: AppData) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return labels.map((name, day) => {
    const logs = data.dailyLogs.filter((log) => getDay(parseISO(log.date)) === day)
    return { name, hours: logs.reduce((sum, log) => sum + log.otHours, 0) }
  })
}

export function longestOtStreak(logs: DailyWorkLog[]) {
  const sorted = logs.filter((log) => log.otHours > 0).sort((a, b) => a.date.localeCompare(b.date))
  let best = 0
  let current = 0
  let previous: Date | null = null
  sorted.forEach((log) => {
    const day = parseISO(log.date)
    current = previous && differenceInCalendarMonths(day, previous) === 0 && (day.getTime() - previous.getTime()) / 86400000 === 1 ? current + 1 : 1
    best = Math.max(best, current)
    previous = day
  })
  return best
}

export function dailyRowsForMonth(data: AppData, month: string) {
  const salary = getSalaryForMonth(month, data.salaryHistory, data.settings.currentSalary)
  return data.dailyLogs
    .filter((log) => log.date.startsWith(month))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((log) => {
      const ot = calculateDailyOtIncome(log, salary, data.settings)
      return {
        ...log,
        hourlyRate: ot.hourlyRate,
        otMultiplier: ot.otMultiplier,
        otBasePay: ot.otBasePay,
        mealAllowance: ot.mealAllowance,
        transportAllowance: ot.transportAllowance,
        otPay: ot.totalOtIncome,
        totalOtIncome: ot.totalOtIncome,
      }
    })
}

export function monthRangeLabel(month: string) {
  const date = startOfMonth(parseISO(`${month}-01`))
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

export function calculateMonthlyIncome(month: string, data: AppData) {
  return summarizeMonth(data, month).grossIncome
}

export function calculateCategoryBudgetAmount(monthlyIncome: number, allocationPercent: number) {
  return monthlyIncome * Math.max(0, allocationPercent || 0) / 100
}

export function calculateTotalAllocationPercent(budgetAllocations: BudgetAllocation[]) {
  return budgetAllocations.filter((item) => item.isActive).reduce((sum, item) => sum + Math.max(0, item.allocationPercent || 0), 0)
}

export function calculateAllocationStatus(totalPercent: number) {
  const tolerance = 0.01
  if (Math.abs(totalPercent - 100) <= tolerance) return { status: 'balanced' as const, message: 'Balanced allocation: 100%' }
  if (totalPercent < 100) return { status: 'under' as const, message: `Unallocated: ${(100 - totalPercent).toFixed(1)}%` }
  return { status: 'over' as const, message: `Over allocated: ${(totalPercent - 100).toFixed(1)}%` }
}

export function calculateCategorySpent(month: string, categoryId: string, expenseRecords: ExpenseRecord[]) {
  return expenseRecords.filter((item) => item.month === month && item.categoryId === categoryId).reduce((sum, item) => sum + item.amount, 0)
}

export function calculateTotalExpenses(month: string, expenseRecords: ExpenseRecord[]) {
  return expenseRecords.filter((item) => item.month === month).reduce((sum, item) => sum + item.amount, 0)
}

export function calculateCategoryRemaining(categoryBudgetAmount: number, categorySpent: number) {
  return categoryBudgetAmount - categorySpent
}

export function calculateTotalPlannedBudget(monthlyIncome: number, budgetAllocations: BudgetAllocation[]) {
  return budgetAllocations.filter((item) => item.isActive).reduce((sum, item) => sum + calculateCategoryBudgetAmount(monthlyIncome, item.allocationPercent), 0)
}

function daysRemainingInMonth(selectedMonth: string) {
  const monthStart = startOfMonth(parseISO(`${selectedMonth}-01`))
  const monthEnd = endOfMonth(monthStart)
  const today = new Date()
  if (isBefore(monthEnd, today)) return 0
  const start = isBefore(today, monthStart) ? monthStart : today
  return Math.max(0, differenceInCalendarDays(monthEnd, start) + 1)
}

export function calculateSafeToSpendToday(monthlyIncome: number, _actualExpenses: number, plannedSavingInvestment: number, selectedMonth: string, spendingActual = 0, spendingBudgetTotal?: number) {
  const daysRemaining = daysRemainingInMonth(selectedMonth)
  if (daysRemaining <= 0) return 0
  const remainingSpendingBudget = (spendingBudgetTotal ?? Math.max(0, monthlyIncome - plannedSavingInvestment)) - spendingActual
  return Math.max(0, remainingSpendingBudget / daysRemaining)
}

export function calculateMoneyLeft(monthlyIncome: number, totalExpenses: number) {
  return monthlyIncome - totalExpenses
}

export function calculateBudgetSummary(month: string, data: AppData) {
  const monthlyIncome = calculateMonthlyIncome(month, data)
  const totalSpent = calculateTotalExpenses(month, data.expenseRecords)
  const activeAllocations = data.budgetAllocations.filter((item) => item.isActive)
  const totalAllocationPercent = calculateTotalAllocationPercent(activeAllocations)
  const plannedBudget = calculateTotalPlannedBudget(monthlyIncome, activeAllocations)
  const categories = data.expenseCategories
    .filter((category) => category.isActive)
    .map((category) => {
      const allocation = activeAllocations.find((item) => item.categoryId === category.id)
      const allocationPercent = allocation?.allocationPercent ?? 0
      const budgetAmount = calculateCategoryBudgetAmount(monthlyIncome, allocationPercent)
      const spentAmount = calculateCategorySpent(month, category.id, data.expenseRecords)
      const remainingAmount = calculateCategoryRemaining(budgetAmount, spentAmount)
      const usedPercent = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : spentAmount > 0 ? 999 : 0
      const status = usedPercent > 100 ? 'over' : usedPercent >= 70 ? 'warning' : 'healthy'
      return { categoryId: category.id, categoryName: category.name, categoryType: category.type, categoryColor: category.color, allocationPercent, budgetAmount, spentAmount, remainingAmount, usedPercent, status }
    })
  const plannedSavingInvestment = categories.filter((item) => item.categoryType !== 'spending').reduce((sum, item) => sum + item.budgetAmount, 0)
  const spendingBudgetTotal = categories.filter((item) => item.categoryType === 'spending').reduce((sum, item) => sum + item.budgetAmount, 0)
  const spendingActualTotal = data.expenseRecords
    .filter((expense) => expense.month === month && data.expenseCategories.find((category) => category.id === expense.categoryId)?.type === 'spending')
    .reduce((sum, expense) => sum + expense.amount, 0)
  const safeToSpendToday = calculateSafeToSpendToday(monthlyIncome, totalSpent, plannedSavingInvestment, month, spendingActualTotal, spendingBudgetTotal)
  return {
    monthlyIncome,
    totalSpent,
    totalAllocationPercent,
    allocationStatus: calculateAllocationStatus(totalAllocationPercent),
    plannedBudget,
    moneyLeft: calculateMoneyLeft(monthlyIncome, totalSpent),
    safeToSpendToday,
    plannedSavingInvestment,
    spendingBudgetTotal,
    spendingActualTotal,
    categories,
  }
}

export function calculateYtdExpenses(year: number, expenseRecords: ExpenseRecord[], throughMonth = 12) {
  return expenseRecords
    .filter((item) => item.month.startsWith(String(year)) && Number(item.month.slice(5, 7)) <= throughMonth)
    .reduce((sum, item) => sum + item.amount, 0)
}

export function calculateYtdNetSaved(year: number, data: AppData, throughMonth = 12) {
  const income = summarizeYear(data, year, throughMonth).total.gross
  const expenses = calculateYtdExpenses(year, data.expenseRecords, throughMonth)
  return income - expenses
}
