import { useRef, useState } from 'react'
import Modal from './ui/Modal'
import Button from './ui/Button'
import { useSchoolStudents } from '../context/SchoolStudentsContext'

const CSV_HEADERS = ['الاسم', 'المرحلة', 'الفصل', 'اسم ولي الأمر', 'بريد ولي الأمر', 'بريد الطالب']

const SAMPLE_ROWS = [
  ['سلمى القرني', 'ابتدائي', 'فصل الموهوبين — الرياضيات 3أ', 'منيرة القرني', 'muneera.q@email.com', 'salma.q@student.edu'],
  ['فيصل العتيبي', 'متوسط', 'نادي القيادة الشبابية', 'سالم العتيبي', 'salem.o@email.com', 'faisal.o@student.edu'],
]

interface ParsedRow {
  name: string
  stage: string
  className: string
  parentName: string
  parentEmail: string
  studentEmail: string
}

function downloadSampleCsv() {
  const rows = [CSV_HEADERS, ...SAMPLE_ROWS]
  const csv = rows.map((r) => r.join(',')).join('\r\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'قالب-استيراد-الطلاب.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function parseCsv(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []
  return lines.slice(1).map((line) => {
    const cols = line.split(',').map((c) => c.trim())
    return {
      name: cols[0] ?? '',
      stage: cols[1] ?? 'غير محدد',
      className: cols[2] ?? '—',
      parentName: cols[3] ?? '—',
      parentEmail: cols[4] ?? '—',
      studentEmail: cols[5] ?? '—',
    }
  }).filter((r) => r.name)
}

export default function BulkImportStudentsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addStudentsBulk } = useSchoolStudents()
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [imported, setImported] = useState(false)

  function close() {
    setFileName(null)
    setRows([])
    setError(null)
    setImported(false)
    if (fileRef.current) fileRef.current.value = ''
    onClose()
  }

  function handleFile(file: File) {
    setFileName(file.name)
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ''))
      if (parsed.length === 0) {
        setError('لم يتم العثور على بيانات صالحة في الملف — تأكد من استخدام نموذج CSV الصحيح')
        setRows([])
      } else {
        setRows(parsed)
      }
    }
    reader.readAsText(file, 'UTF-8')
  }

  function confirmImport() {
    addStudentsBulk(rows)
    setImported(true)
  }

  return (
    <Modal open={open} onClose={close} width={720}>
      {imported ? (
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</span>
          <span className="font-sans text-lg font-extrabold text-navy">تم استيراد {rows.length} طالبًا بنجاح</span>
          <p className="text-xs text-ink-faint">تمت إضافتهم إلى قائمة طلاب المدرسة</p>
          <Button size="sm" className="mt-2" onClick={close}>تم</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-sans text-xl font-extrabold text-navy">استيراد الطلاب من CSV</span>
            <button onClick={close} className="text-xl text-ink-faint">✕</button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-surface-alt px-4 py-3.5">
            <div>
              <div className="text-xs font-bold text-ink">لست متأكدًا من التنسيق؟</div>
              <div className="text-[11px] text-ink-faint">نزّل نموذج CSV جاهزًا وعدّل عليه ثم ارفعه</div>
            </div>
            <Button variant="secondary" size="sm" onClick={downloadSampleCsv}>تنزيل نموذج CSV</Button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFile(file)
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-line-checkbox bg-surface-alt py-8 text-center transition-colors hover:bg-surface"
          >
            <span className="text-sm font-bold text-ink">
              {fileName ? `الملف المحدد: ${fileName}` : 'اضغط لاختيار ملف CSV'}
            </span>
            <span className="text-xs text-ink-faint">
              الأعمدة المطلوبة: {CSV_HEADERS.join('، ')}
            </span>
          </button>

          {error && (
            <div className="rounded-xl bg-danger-bg-soft px-4 py-3 text-xs font-semibold text-danger-light">{error}</div>
          )}

          {rows.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-ink-soft">معاينة ({rows.length} طالب)</span>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-line">
                <table className="w-full text-right text-[11px]">
                  <thead>
                    <tr className="bg-surface-alt">
                      <th className="px-3 py-2 font-bold text-ink-muted">الاسم</th>
                      <th className="px-3 py-2 font-bold text-ink-muted">المرحلة</th>
                      <th className="px-3 py-2 font-bold text-ink-muted">الفصل</th>
                      <th className="px-3 py-2 font-bold text-ink-muted">ولي الأمر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t border-line-soft">
                        <td className="px-3 py-2 font-semibold text-ink">{r.name}</td>
                        <td className="px-3 py-2 text-ink-faint">{r.stage}</td>
                        <td className="px-3 py-2 text-ink-faint">{r.className}</td>
                        <td className="px-3 py-2 text-ink-faint">{r.parentName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5">
            <Button variant="secondary" size="sm" onClick={close}>إلغاء</Button>
            <Button size="sm" disabled={rows.length === 0} onClick={confirmImport}>
              تأكيد استيراد {rows.length > 0 ? rows.length : ''} طالب
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}
