import { AppData } from '../types'
import { createDefaultBudgetAllocations, createDefaultExpenseCategories, createSampleData } from './sampleData'

const STORAGE_KEY = 'workpay-tracker-data-v1'
const DEMO_SALARY_IDS = new Set(['salary-2026-01-01', 'salary-2026-04-01'])

function migrateData(data: AppData): AppData {
  const sample = createSampleData()
  const salaryHistory = (data.salaryHistory ?? []).filter((item) => !DEMO_SALARY_IDS.has(item.id))
  const hadOnlyDemoSalary = (data.salaryHistory?.length ?? 0) > 0 && salaryHistory.length === 0 && data.salaryHistory.every((item) => DEMO_SALARY_IDS.has(item.id))
  const expenseCategories = data.expenseCategories?.length ? data.expenseCategories.map((category) => ({ ...category, isActive: category.isActive ?? true })) : createDefaultExpenseCategories()
  let budgetAllocations = data.budgetAllocations?.length ? data.budgetAllocations.map((allocation) => ({ ...allocation, isActive: allocation.isActive ?? true })) : createDefaultBudgetAllocations()
  const legacyBudgets = (data as unknown as { monthlyBudgets?: { id: string; month: string; categoryId: string; plannedAmount: number; createdAt: string; updatedAt: string }[] }).monthlyBudgets
  if (!data.budgetAllocations?.length && legacyBudgets?.length) {
    const byCategory = new Map<string, number>()
    legacyBudgets.forEach((item) => {
      byCategory.set(item.categoryId, Math.max(byCategory.get(item.categoryId) ?? 0, item.plannedAmount))
    })
    const total = [...byCategory.values()].reduce((sum, value) => sum + value, 0)
    if (total > 0) {
      budgetAllocations = [...byCategory.entries()].map(([categoryId, plannedAmount]) => ({
        id: `alloc-${categoryId}`,
        categoryId,
        allocationPercent: (plannedAmount / total) * 100,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    }
  }
  const settings = {
    ...data.settings,
    currentSalary: hadOnlyDemoSalary && data.settings.currentSalary === 37000 ? 0 : data.settings.currentSalary,
    otHourDivisor: data.settings.otHourDivisor ?? 166.67,
    otMultiplier1: data.settings.otMultiplier1 ?? data.settings.defaultOtMultiplierWeekday ?? 1.5,
    otMultiplier2: data.settings.otMultiplier2 ?? data.settings.defaultOtMultiplierHoliday ?? 2,
    otMultiplier3: data.settings.otMultiplier3 ?? data.settings.defaultOtMultiplierSpecial ?? 3,
    mealAllowanceAmount: data.settings.mealAllowanceAmount ?? 83,
    transportAllowanceAmount: data.settings.transportAllowanceAmount ?? 60,
    transportCutoffHours: data.settings.transportCutoffHours ?? 4,
    extraMealThresholdHours: data.settings.extraMealThresholdHours ?? 5,
  }
  return {
    ...data,
    settings,
    salaryHistory,
    expenseCategories,
    budgetAllocations,
    expenseRecords: data.expenseRecords ?? [],
    recurringExpenses: data.recurringExpenses ?? sample.recurringExpenses ?? [],
  }
}

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const sample = createSampleData()
    saveData(sample)
    return sample
  }

  try {
    const parsed = JSON.parse(raw) as AppData
    const migrated = migrateData(parsed)
    saveData(migrated)
    return migrated
  } catch {
    const sample = createSampleData()
    saveData(sample)
    return sample
  }
}

export function saveData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function resetSampleData(): AppData {
  const sample = createSampleData()
  saveData(sample)
  return sample
}

export function clearAllData(): AppData {
  const empty = createSampleData()
  empty.dailyLogs = []
  empty.bonusExtraIncome = []
  empty.deductions = []
  empty.expenseRecords = []
  saveData(empty)
  return empty
}
