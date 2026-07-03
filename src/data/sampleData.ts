import { addDays, format, isWeekend, parseISO } from 'date-fns'
import { AppData, BudgetAllocation, DailyWorkLog, ExpenseCategory, ExpenseRecord, RecurringExpense, UserSettings } from '../types'

const now = () => new Date().toISOString()
const id = (prefix: string, value: string) => `${prefix}-${value}`

export const defaultSettings: UserSettings = {
  id: 'default',
  currentSalary: 0,
  otHourDivisor: 166.67,
  otMultiplier1: 1.5,
  otMultiplier2: 2,
  otMultiplier3: 3,
  mealAllowanceAmount: 83,
  transportAllowanceAmount: 60,
  transportCutoffHours: 4,
  extraMealThresholdHours: 5,
  salaryCalculationBase: 'monthly',
  standardWorkingDaysPerMonth: 30,
  standardWorkingHoursPerDay: 8,
  paydayType: 'monthEnd',
  paydayDate: 30,
  currency: 'THB',
  defaultOtMultiplierWeekday: 1.5,
  defaultOtMultiplierHoliday: 2,
  defaultOtMultiplierSpecial: 3,
  roundOtMode: 'none',
  privacyMode: false,
  annualIncomeTarget: 620000,
  otIncomeTarget: 65000,
  language: 'en',
}

const notes = [
  ['Production Support', 'Checked production issues and followed up after deployment'],
  ['Monthly Report', 'Prepared monthly report and verified key numbers'],
  ['Meeting', 'Joined planning meetings and summarized action items'],
  ['Data Analysis', 'Analyzed performance data and updated dashboard metrics'],
  ['Urgent Issue', 'Resolved an urgent operation issue'],
  ['Customer Follow-up', 'Followed up with customers and updated case information'],
  ['Presentation', 'Prepared slides and rehearsed the presentation'],
]

const categorySeeds = [
  { id: 'cat-food', name: 'Food', color: '#10b981', type: 'spending', allocationPercent: 20 },
  { id: 'cat-transport', name: 'Transport', color: '#0ea5e9', type: 'spending', allocationPercent: 10 },
  { id: 'cat-shopping', name: 'Shopping', color: '#f59e0b', type: 'spending', allocationPercent: 10 },
  { id: 'cat-bills', name: 'Bills', color: '#6366f1', type: 'spending', allocationPercent: 15 },
  { id: 'cat-family', name: 'Family', color: '#ec4899', type: 'spending', allocationPercent: 5 },
  { id: 'cat-travel', name: 'Travel', color: '#8b5cf6', type: 'spending', allocationPercent: 5 },
  { id: 'cat-health', name: 'Health', color: '#14b8a6', type: 'spending', allocationPercent: 5 },
  { id: 'cat-entertainment', name: 'Entertainment', color: '#f97316', type: 'spending', allocationPercent: 5 },
  { id: 'cat-saving', name: 'Saving', color: '#059669', type: 'saving', allocationPercent: 10 },
  { id: 'cat-investment', name: 'Investment', color: '#7c3aed', type: 'investment', allocationPercent: 10 },
  { id: 'cat-other', name: 'Other', color: '#64748b', type: 'spending', allocationPercent: 5 },
] as const

export function createDefaultExpenseCategories(): ExpenseCategory[] {
  return categorySeeds.map((item) => ({
    id: item.id,
    name: item.name,
    color: item.color,
    type: item.type,
    isDefault: true,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  }))
}

export function createDefaultBudgetAllocations(): BudgetAllocation[] {
  return categorySeeds.map((item) => ({
    id: `alloc-${item.id}`,
    categoryId: item.id,
    allocationPercent: item.allocationPercent,
    isActive: true,
    createdAt: now(),
    updatedAt: now(),
  }))
}

function makeExpense(idText: string, date: string, categoryId: string, title: string, amount: number, paymentMethod: ExpenseRecord['paymentMethod'] = 'transfer', note = ''): ExpenseRecord {
  return {
    id: id('expense', idText),
    date,
    month: date.slice(0, 7),
    categoryId,
    title,
    amount,
    note,
    paymentMethod,
    isRecurring: false,
    createdAt: now(),
    updatedAt: now(),
  }
}

function makeExpenses(): ExpenseRecord[] {
  return [
    makeExpense('2026-06-lunch', '2026-06-03', 'cat-food', 'Lunch', 120, 'cash'),
    makeExpense('2026-06-dinner', '2026-06-05', 'cat-food', 'Dinner', 250, 'transfer'),
    makeExpense('2026-06-coffee', '2026-06-08', 'cat-food', 'Coffee', 80, 'card'),
    makeExpense('2026-06-groceries', '2026-06-11', 'cat-food', 'Groceries', 1200, 'card'),
    makeExpense('2026-06-fuel', '2026-06-12', 'cat-transport', 'Fuel', 900, 'card'),
    makeExpense('2026-06-phone', '2026-06-15', 'cat-bills', 'Phone Bill', 599, 'transfer'),
    makeExpense('2026-06-movie', '2026-06-19', 'cat-entertainment', 'Movie', 300, 'card'),
    makeExpense('2026-06-family', '2026-06-22', 'cat-family', 'Family Support', 1500, 'transfer'),
    makeExpense('2026-06-saving', '2026-06-25', 'cat-saving', 'Monthly Saving', 5000, 'transfer'),
    makeExpense('2026-06-investment', '2026-06-25', 'cat-investment', 'Index Fund', 4000, 'transfer'),
  ]
}

function makeRecurringExpenses(): RecurringExpense[] {
  return [
    {
      id: 'recurring-phone',
      categoryId: 'cat-bills',
      title: 'Phone Bill',
      amount: 599,
      dayOfMonth: 15,
      paymentMethod: 'transfer',
      isActive: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ]
}

function makeLogs(): DailyWorkLog[] {
  const start = parseISO('2026-03-01')
  const logs: DailyWorkLog[] = []

  for (let i = 0; i < 116; i += 1) {
    const date = addDays(start, i)
    const dateText = format(date, 'yyyy-MM-dd')
    const weekend = isWeekend(date)
    const pattern = i % 12
    const tagNote = notes[i % notes.length]
    const hasOt = !weekend && ![0, 5, 9].includes(pattern)
    const holidayOt = weekend && i % 9 === 0
    const otHours = holidayOt ? 3 : hasOt ? [0.5, 1, 1.5, 2, 2.5, 3, 4][i % 7] : 0
    const otType = holidayOt ? 'holiday' : i % 23 === 0 ? 'special' : 'weekday'
    const otMultiplier = otType === 'special' ? 3 : otType === 'holiday' ? 2 : 1.5
    const workloadLevel = otHours >= 3 ? 'veryHeavy' : otHours >= 2 ? 'heavy' : otHours > 0 ? 'normal' : 'light'

    logs.push({
      id: id('log', dateText),
      date: dateText,
      isWorkday: !weekend,
      isHoliday: weekend,
      startTime: weekend ? undefined : '09:00',
      endTime: otHours > 0 ? `${18 + Math.floor(otHours)}:${otHours % 1 ? '30' : '00'}` : '18:00',
      otHours,
      otType,
      otMultiplier,
      workNote: otHours > 0 ? `${tagNote[1]}. Continued work after office hours.` : tagNote[1],
      workTags: i % 10 === 0 ? [tagNote[0], 'Urgent Issue'] : [tagNote[0]],
      workloadLevel,
      mood: workloadLevel === 'veryHeavy' ? 'tired' : workloadLevel === 'heavy' ? 'stress' : i % 4 === 0 ? 'good' : 'normal',
      status: dateText < '2026-06-01' ? 'paid' : 'confirmed',
      createdAt: now(),
      updatedAt: now(),
    })
  }

  return logs
}

export function createSampleData(): AppData {
  return {
    settings: defaultSettings,
    dailyLogs: makeLogs(),
    salaryHistory: [],
    bonusExtraIncome: [
      {
        id: 'bonus-apr-extra',
        date: '2026-04-30',
        month: '2026-04',
        type: 'aprilExtraPay',
        title: 'April Extra Pay',
        amount: 3000,
        status: 'paid',
        note: 'Special April extra pay',
        createdAt: now(),
        updatedAt: now(),
      },
      {
        id: 'bonus-dec-annual',
        date: '2026-12-25',
        month: '2026-12',
        type: 'bonus',
        title: 'Annual Bonus',
        amount: 70000,
        status: 'expected',
        note: 'Estimated year-end bonus',
        createdAt: now(),
        updatedAt: now(),
      },
    ],
    deductions: [
      { id: 'deduct-2026-03', date: '2026-03-31', month: '2026-03', type: 'socialSecurity', title: 'Social security', amount: 750, createdAt: now() },
      { id: 'deduct-2026-04', date: '2026-04-30', month: '2026-04', type: 'socialSecurity', title: 'Social security', amount: 750, createdAt: now() },
      { id: 'deduct-2026-05', date: '2026-05-31', month: '2026-05', type: 'socialSecurity', title: 'Social security', amount: 750, createdAt: now() },
      { id: 'deduct-2026-06', date: '2026-06-30', month: '2026-06', type: 'socialSecurity', title: 'Social security', amount: 750, createdAt: now() },
    ],
    workTagTemplates: notes.map(([name], index) => ({
      id: `tag-${index}`,
      name,
      color: ['#2563eb', '#16a34a', '#f59e0b', '#7c3aed', '#dc2626', '#0891b2', '#db2777'][index],
      createdAt: now(),
    })),
    expenseCategories: createDefaultExpenseCategories(),
    budgetAllocations: createDefaultBudgetAllocations(),
    expenseRecords: makeExpenses(),
    recurringExpenses: makeRecurringExpenses(),
  }
}
