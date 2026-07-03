export type Language = 'th' | 'en'
export type OtType = 'weekday' | 'holiday' | 'special'
export type WorkloadLevel = 'light' | 'normal' | 'heavy' | 'veryHeavy'
export type Mood = 'good' | 'normal' | 'tired' | 'stress'
export type Status = 'draft' | 'confirmed' | 'paid'

export interface UserSettings {
  id: string
  currentSalary: number
  otHourDivisor: number
  otMultiplier1: number
  otMultiplier2: number
  otMultiplier3: number
  mealAllowanceAmount: number
  transportAllowanceAmount: number
  transportCutoffHours: number
  extraMealThresholdHours: number
  salaryCalculationBase: 'monthly' | 'daily'
  standardWorkingDaysPerMonth: number
  standardWorkingHoursPerDay: number
  paydayType: 'monthEnd' | 'specificDate'
  paydayDate?: number
  currency: string
  defaultOtMultiplierWeekday: number
  defaultOtMultiplierHoliday: number
  defaultOtMultiplierSpecial: number
  roundOtMode: 'none' | 'halfHour' | 'oneHour'
  privacyMode: boolean
  annualIncomeTarget?: number
  otIncomeTarget?: number
  language: Language
}

export interface DailyWorkLog {
  id: string
  date: string
  isWorkday: boolean
  isHoliday: boolean
  startTime?: string
  endTime?: string
  otHours: number
  otType: OtType
  otMultiplier: number
  workNote: string
  workTags: string[]
  workloadLevel: WorkloadLevel
  mood?: Mood
  status: Status
  createdAt: string
  updatedAt: string
}

export interface SalaryHistory {
  id: string
  effectiveDate: string
  salary: number
  previousSalary?: number
  increaseAmount?: number
  increasePercent?: number
  note?: string
  createdAt: string
}

export interface BonusExtraIncome {
  id: string
  date: string
  month: string
  type: 'bonus' | 'specialBonus' | 'aprilExtraPay' | 'allowance' | 'incentive' | 'adjustment' | 'other'
  title: string
  amount: number
  status: 'expected' | 'confirmed' | 'paid'
  note?: string
  createdAt: string
  updatedAt: string
}

export interface Deduction {
  id: string
  date: string
  month: string
  type: 'socialSecurity' | 'tax' | 'providentFund' | 'unpaidLeave' | 'other'
  title: string
  amount: number
  note?: string
  createdAt: string
}

export interface WorkTagTemplate {
  id: string
  name: string
  color?: string
  createdAt: string
}

export interface ExpenseCategory {
  id: string
  name: string
  icon?: string
  color?: string
  type: 'spending' | 'saving' | 'investment'
  isDefault: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BudgetAllocation {
  id: string
  categoryId: string
  allocationPercent: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ExpenseRecord {
  id: string
  date: string
  month: string
  categoryId: string
  title: string
  amount: number
  note?: string
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'other'
  isRecurring?: boolean
  createdAt: string
  updatedAt: string
}

export interface RecurringExpense {
  id: string
  categoryId: string
  title: string
  amount: number
  dayOfMonth: number
  paymentMethod?: 'cash' | 'transfer' | 'card' | 'other'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MonthlySummary {
  month: string
  baseSalary: number
  otHours: number
  otIncome: number
  otBasePay: number
  mealAllowance: number
  transportAllowance: number
  bonusIncome: number
  extraIncome: number
  otherIncome: number
  grossIncome: number
  deduction: number
  netEstimate: number
  workdayCount: number
  otDayCount: number
  mostCommonWorkTag: string
  workloadLevelSummary: Record<WorkloadLevel, number>
}

export interface AppData {
  settings: UserSettings
  dailyLogs: DailyWorkLog[]
  salaryHistory: SalaryHistory[]
  bonusExtraIncome: BonusExtraIncome[]
  deductions: Deduction[]
  workTagTemplates: WorkTagTemplate[]
  expenseCategories: ExpenseCategory[]
  budgetAllocations: BudgetAllocation[]
  expenseRecords: ExpenseRecord[]
  recurringExpenses: RecurringExpense[]
}

export type PageKey = 'home' | 'calendar' | 'budget' | 'monthly' | 'year' | 'settings'
