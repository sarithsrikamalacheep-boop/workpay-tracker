import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { MonthlySummary } from '../../types'

const axisStyle = { fontSize: 12, fill: '#64748b' }

export function MonthlyIncomeChart({ data }: { data: MonthlySummary[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={72} />
        <Tooltip cursor={{ fill: '#f1f5f9' }} />
        <Legend wrapperStyle={{ paddingTop: 12 }} />
        <Bar dataKey="baseSalary" name="Base salary" stackId="a" fill="#0b3b75" radius={[0, 0, 6, 6]} />
        <Bar dataKey="otIncome" name="OT income" stackId="a" fill="#10b981" />
        <Bar dataKey="bonusIncome" name="Bonus / extra" stackId="a" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function OtTrendChart({ data }: { data: { month: string; otHours: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={52} />
        <Tooltip />
        <Line type="monotone" dataKey="otHours" name="OT hours" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function IncomeBreakdownChart({ data }: { data: { name: string; value: number }[] }) {
  const colors = ['#0b3b75', '#10b981', '#8b5cf6', '#f59e0b']
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={64} outerRadius={96} paddingAngle={4}>
          {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function SalaryGrowthChart({ data }: { data: { effectiveDate: string; salary: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="effectiveDate" tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} />
        <Tooltip />
        <Area type="monotone" dataKey="salary" name="Salary" stroke="#0b3b75" fill="#dbeafe" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function SimpleBarChart({ data, x = 'name', y = 'value', color = '#0b3b75', height = 280 }: { data: Record<string, unknown>[]; x?: string; y?: string; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey={x} tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={72} />
        <Tooltip cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey={y} fill={color} radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DualBarChart({ data, x = 'name', first = 'income', second = 'expenses', firstName = 'Income', secondName = 'Expenses', height = 320 }: { data: Record<string, unknown>[]; x?: string; first?: string; second?: string; firstName?: string; secondName?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey={x} tick={axisStyle} tickLine={false} axisLine={false} />
        <YAxis tick={axisStyle} tickLine={false} axisLine={false} width={72} />
        <Tooltip cursor={{ fill: '#f8fafc' }} />
        <Legend wrapperStyle={{ paddingTop: 12 }} />
        <Bar dataKey={first} name={firstName} fill="#0b3b75" radius={[8, 8, 0, 0]} />
        <Bar dataKey={second} name={secondName} fill="#f59e0b" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
