import { useState } from 'react'
import { Card } from '../components/ui/Card'
import { Select } from '../components/ui/Select'
import { Button } from '../components/ui/Button'
import { exportDailyLogs, exportJson, exportMonthlySummary, exportOtAnalysis, exportYtdSummary, toCsv, downloadText } from '../utils/exportUtils'
import { PageProps } from './pageTypes'

export function ExportPage({ data, month, notify }: PageProps) {
  const [option, setOption] = useState('daily')
  const year = Number(month.slice(0, 4))
  const runExport = () => {
    const exports: Record<string, { filename: string; content: string; type?: string }> = {
      daily: { filename: `daily-logs-${month}.csv`, content: exportDailyLogs(data, month) },
      monthly: { filename: `monthly-summary-${year}.csv`, content: exportMonthlySummary(data, year) },
      ytd: { filename: `ytd-summary-${year}.csv`, content: exportYtdSummary(data, year) },
      bonus: { filename: 'bonus-extra.csv', content: toCsv(data.bonusExtraIncome) },
      salary: { filename: 'salary-history.csv', content: toCsv(data.salaryHistory) },
      ot: { filename: 'ot-analysis.csv', content: exportOtAnalysis(data) },
      notes: { filename: `work-notes-${month}.csv`, content: toCsv(data.dailyLogs.filter((log) => log.date.startsWith(month)).map((log) => ({ date: log.date, note: log.workNote, tags: log.workTags.join('|'), workload: log.workloadLevel }))) },
      json: { filename: 'workpay-all-data.json', content: exportJson(data), type: 'application/json' },
    }
    const selected = exports[option]
    downloadText(selected.filename, selected.content, selected.type)
    notify('Export completed')
  }
  return (
    <Card>
      <div className="max-w-xl space-y-4">
        <h2 className="text-lg font-bold">Export Data</h2>
        <Select value={option} onChange={(e) => setOption(e.target.value)}>
          <option value="daily">Daily Logs CSV</option><option value="monthly">Monthly Summary CSV</option><option value="ytd">YTD Summary CSV</option><option value="bonus">Bonus & Extra CSV</option><option value="salary">Salary History CSV</option><option value="ot">OT Analysis CSV</option><option value="notes">Work Notes CSV</option><option value="json">All Data JSON</option>
        </Select>
        <div className="flex gap-2"><Button onClick={runExport}>Export Selected</Button><Button variant="secondary" onClick={() => { downloadText('workpay-all-data.json', exportJson(data), 'application/json'); notify('Backup exported') }}>Export All Data</Button></div>
        <p className="text-sm text-slate-500">CSV files can be opened in Excel or Google Sheets. The export utilities are structured so real XLSX support can be added later.</p>
      </div>
    </Card>
  )
}
