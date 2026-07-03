import { useMemo, useState } from 'react'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { tagAnalysis } from '../utils/calculations'
import { thaiDate } from '../utils/dateUtils'
import { notesSummary } from '../utils/insightUtils'
import { PageProps } from './pageTypes'

export function WorkNotes({ data, month }: PageProps) {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('')
  const [workload, setWorkload] = useState('')
  const tags = tagAnalysis(data).map((item) => item.tag)
  const rows = useMemo(() => data.dailyLogs
    .filter((log) => log.date.startsWith(month))
    .filter((log) => !query || log.workNote.toLowerCase().includes(query.toLowerCase()) || log.workTags.join(' ').toLowerCase().includes(query.toLowerCase()))
    .filter((log) => !tag || log.workTags.includes(tag))
    .filter((log) => !workload || log.workloadLevel === workload)
    .sort((a, b) => b.date.localeCompare(a.date)), [data.dailyLogs, month, query, tag, workload])
  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          <Input placeholder="Search notes or tags" value={query} onChange={(e) => setQuery(e.target.value)} />
          <Select value={tag} onChange={(e) => setTag(e.target.value)}><option value="">All Tags</option>{tags.map((item) => <option key={item} value={item}>{item}</option>)}</Select>
          <Select value={workload} onChange={(e) => setWorkload(e.target.value)}><option value="">All Workloads</option><option value="light">Light</option><option value="normal">Normal</option><option value="heavy">Heavy</option><option value="veryHeavy">Very Heavy</option></Select>
        </div>
      </Card>
      <Card><h2 className="mb-2 font-bold">Monthly Work Summary</h2><p className="text-sm leading-6 text-slate-700">{notesSummary(data, month)}</p></Card>
      <div className="grid gap-3">
        {rows.map((log) => (
          <Card key={log.id}>
            <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold">{thaiDate(log.date)}</h3><Badge tone={log.workloadLevel === 'veryHeavy' ? 'red' : log.workloadLevel === 'heavy' ? 'orange' : 'blue'}>{log.workloadLevel}</Badge></div>
            <p className="mt-2 text-sm text-slate-700">{log.workNote}</p>
            <div className="mt-3 flex flex-wrap gap-1">{log.workTags.map((item) => <Badge key={item}>{item}</Badge>)}</div>
          </Card>
        ))}
      </div>
    </div>
  )
}
