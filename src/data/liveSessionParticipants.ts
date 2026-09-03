export interface Participant {
  name: string
  status: string
  tone: 'success' | 'warning' | 'danger'
  muted: boolean
  cohost: boolean
}

export const initialParticipants: Participant[] = [
  { name: 'لمى الحربي', status: 'متصل', tone: 'success', muted: false, cohost: false },
  { name: 'عبدالله السبيعي', status: 'رفع يد', tone: 'warning', muted: false, cohost: false },
  { name: 'جود القحطاني', status: 'متصل', tone: 'success', muted: false, cohost: false },
  { name: 'نورة سالم', status: 'غير متصل', tone: 'danger', muted: false, cohost: false },
]
