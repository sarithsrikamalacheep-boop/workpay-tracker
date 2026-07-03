import { AppData } from '../types'
import { PageKey } from '../types'

export interface PageProps {
  data: AppData
  setData: (data: AppData) => void
  month: string
  setMonth: (month: string) => void
  notify: (message: string) => void
  onNavigate?: (page: PageKey) => void
}
