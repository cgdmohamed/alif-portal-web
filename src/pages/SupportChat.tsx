import { useEffect, useState } from 'react'
import Card from '../components/ui/Card'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import { supportApi, type ApiConversation, type ApiSupportMessage } from '../lib/supportApi'
import { usersApi, type ApiUser } from '../lib/usersApi'
import { ApiError } from '../lib/api'

const quickReplies = ['مرحبًا! كيف أقدر أساعدك؟', 'تم الحل ✅', 'سأقوم بتحويلك لموظف آخر']

export default function SupportChat() {
  const [conversations, setConversations] = useState<ApiConversation[] | null>(null)
  const [active, setActive] = useState<ApiConversation | null>(null)
  const [messages, setMessages] = useState<ApiSupportMessage[]>([])
  const [draft, setDraft] = useState('')
  const [agents, setAgents] = useState<ApiUser[]>([])
  const [transferOpen, setTransferOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function loadConversations() {
    supportApi
      .conversations()
      .then((rows) => {
        setConversations(rows)
        if (!active && rows.length > 0) setActive(rows[0])
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : 'تعذر تحميل المحادثات'))
  }

  useEffect(loadConversations, [])
  useEffect(() => {
    usersApi.list({ role: 'support_agent' }).then(setAgents).catch(() => setAgents([]))
  }, [])

  useEffect(() => {
    if (!active) return
    supportApi.messages(active.id).then(setMessages).catch(() => setMessages([]))
  }, [active?.id])

  async function send(text: string) {
    if (!text.trim() || !active || active.status === 'closed') return
    const message = await supportApi.sendMessage(active.id, text)
    setMessages((m) => [...m, message])
    setDraft('')
  }

  async function transferTo(agentId: string) {
    if (!active) return
    const updated = await supportApi.transfer(active.id, agentId)
    setActive(updated)
    setTransferOpen(false)
    loadConversations()
  }

  async function closeConversation() {
    if (!active) return
    const updated = await supportApi.close(active.id)
    setActive(updated)
    loadConversations()
  }

  if (error) {
    return <div className="rounded-xl bg-danger-bg-soft px-4 py-6 text-center text-sm text-danger-light">{error}</div>
  }

  if (conversations === null) {
    return <div className="rounded-xl bg-surface-alt px-4 py-8 text-center text-sm text-ink-faint">جارٍ التحميل...</div>
  }

  return (
    <div dir="rtl" className="flex h-[calc(100vh-56px)] gap-4">
      <Card className="flex w-[280px] flex-none flex-col gap-2 overflow-y-auto">
        <span className="mb-1 text-sm font-extrabold text-ink">المحادثات</span>
        {conversations.length === 0 && <div className="text-xs text-ink-faint">لا توجد محادثات بعد</div>}
        {conversations.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c)}
            className={`flex items-center gap-2.5 rounded-lg p-2.5 text-right ${
              active?.id === c.id ? 'bg-surface-alt' : ''
            }`}
          >
            <Avatar initials={c.participant.name[0]} size={34} />
            <div className="flex-1 overflow-hidden">
              <div className="truncate text-xs font-bold text-ink">{c.participant.name}</div>
              <div className="truncate text-[11px] text-ink-faint">{c.status === 'closed' ? 'مغلقة' : 'مفتوحة'}</div>
            </div>
          </button>
        ))}
      </Card>

      {active && (
        <>
          <Card className="flex flex-1 flex-col gap-3">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <Avatar initials={active.participant.name[0]} size={36} />
                <span className="text-sm font-bold text-ink">{active.participant.name}</span>
              </div>
              {active.status === 'closed' && <Badge tone="neutral">تم إغلاق التذكرة</Badge>}
              {active.agent && active.status !== 'closed' && <Badge tone="warning">محوّلة إلى {active.agent.name}</Badge>}
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-2">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[70%] rounded-xl p-3 text-xs ${
                    m.sender.id === active.participant.id
                      ? 'self-start rounded-tr-sm bg-surface-alt text-ink'
                      : 'self-end rounded-tl-sm bg-indigo text-white'
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((r) => (
                <button
                  key={r}
                  onClick={() => send(r)}
                  disabled={active.status === 'closed'}
                  className="rounded-full border border-line px-3 py-1.5 text-[11px] text-ink-soft transition-colors hover:bg-surface disabled:opacity-40"
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="flex gap-2.5">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(draft)}
                disabled={active.status === 'closed'}
                placeholder={active.status === 'closed' ? 'تم إغلاق هذه التذكرة' : 'اكتب ردًا...'}
                className="flex-1 rounded-xl border border-line bg-surface px-4 py-3 text-sm focus:border-indigo focus:bg-white focus:outline-none disabled:opacity-50"
              />
              <Button size="sm" disabled={active.status === 'closed'} onClick={() => send(draft)}>إرسال</Button>
            </div>
          </Card>

          <Card className="flex w-[260px] flex-none flex-col gap-3">
            <span className="text-sm font-extrabold text-ink">معلومات المستخدم</span>
            <div className="text-xs text-ink-soft">{active.participant.name}</div>
            <Button variant="secondary" size="sm" onClick={() => setTransferOpen(true)} disabled={active.status === 'closed'}>
              نقل المحادثة
            </Button>
            <Button variant="danger" size="sm" onClick={closeConversation} disabled={active.status === 'closed'}>
              إغلاق التذكرة
            </Button>
          </Card>
        </>
      )}

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} width={420}>
        <div className="flex flex-col gap-4">
          <span className="font-sans text-lg font-extrabold text-navy">نقل المحادثة إلى</span>
          <div className="flex flex-col gap-2">
            {agents.length === 0 && <div className="text-xs text-ink-faint">لا يوجد أعضاء فريق دعم مسجّلون</div>}
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => transferTo(a.id)}
                className="rounded-xl border border-line bg-surface-alt px-4 py-3 text-right text-sm font-semibold text-ink hover:bg-surface"
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
