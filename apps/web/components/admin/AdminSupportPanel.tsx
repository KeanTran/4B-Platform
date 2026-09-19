'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock3, Headphones, Inbox, Loader2, Mail, MessageSquareText, Phone, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { SUPPORT_STATUSES, type AdminSupportMessage, type SupportStatus } from '@/types/support';

const STATUS_LABELS: Record<SupportStatus, string> = {
  new: 'Mới',
  in_progress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  spam: 'Spam',
};

type SupportFilter = SupportStatus | 'all';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function AdminSupportPanel() {
  const [messages, setMessages] = useState<AdminSupportMessage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SupportFilter>('new');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<SupportStatus>('new');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    let active = true;
    async function loadMessages() {
      try {
        const response = await fetch('/api/admin/support', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Không thể tải hộp thư hỗ trợ.');
        if (!active) return;
        const nextMessages = result.messages as AdminSupportMessage[];
        setMessages(nextMessages);
        setSelectedId(nextMessages.find((item) => item.status === 'new')?.id ?? nextMessages[0]?.id ?? null);
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : 'Không thể tải hộp thư hỗ trợ.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadMessages();
    return () => { active = false; };
  }, []);

  const selectedMessage = messages.find((item) => item.id === selectedId) ?? null;
  const filteredMessages = useMemo(
    () => filter === 'all' ? messages : messages.filter((item) => item.status === filter),
    [filter, messages],
  );
  const newCount = messages.filter((item) => item.status === 'new').length;

  useEffect(() => {
    if (!selectedMessage) return;
    setStatus(selectedMessage.status);
    setAdminNote(selectedMessage.admin_note ?? '');
  }, [selectedMessage]);

  async function saveMessage() {
    if (!selectedMessage) return;
    setSaving(true);
    try {
      const response = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedMessage.id,
          status,
          admin_note: adminNote.trim() || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Không thể cập nhật yêu cầu.');
      const updated = result.message as AdminSupportMessage;
      setMessages((current) => current.map((item) => item.id === updated.id ? updated : item));
      toast.success('Đã cập nhật yêu cầu hỗ trợ.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật yêu cầu.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Card variant="surface" className="flex min-h-64 items-center justify-center gap-2 p-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Loader2 className="animate-spin" size={18} /> Đang tải hộp thư hỗ trợ…
      </Card>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
      <Card variant="surface" className="h-fit overflow-hidden">
        <div className="border-b p-4" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold" style={{ color: 'var(--text-heading)' }}>Yêu cầu từ Chat Now</h3>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{newCount} yêu cầu mới cần phản hồi</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}>
              <Inbox size={18} />
            </span>
          </div>
          <label className="mt-4 block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            Lọc trạng thái
            <select
              aria-label="Lọc trạng thái hỗ trợ"
              value={filter}
              onChange={(event) => setFilter(event.target.value as SupportFilter)}
              className="mt-1.5 h-10 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              <option value="all">Tất cả yêu cầu</option>
              {SUPPORT_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
            </select>
          </label>
        </div>

        <div className="max-h-[680px] overflow-y-auto p-2">
          {filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Không có yêu cầu ở trạng thái này.</div>
          ) : filteredMessages.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className="mb-1 w-full rounded-xl border p-3 text-left transition-colors"
              style={{
                borderColor: selectedId === item.id ? 'var(--primary)' : 'transparent',
                background: selectedId === item.id ? 'var(--color-bg-soft-primary)' : 'transparent',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="truncate text-sm font-bold" style={{ color: 'var(--text-heading)' }}>{item.email}</span>
                <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold" style={{ background: 'var(--surface)', color: 'var(--primary)' }}>
                  {STATUS_LABELS[item.status]}
                </span>
              </div>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.message}</p>
              <p className="mt-2 flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}><Clock3 size={11} />{formatDate(item.created_at)}</p>
            </button>
          ))}
        </div>
      </Card>

      {selectedMessage ? (
        <Card variant="surface" className="overflow-hidden">
          <div className="border-b p-5" style={{ borderColor: 'var(--border)' }}>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--primary)' }}>Yêu cầu hỗ trợ</p>
                <h3 className="mt-1 text-xl font-extrabold" style={{ color: 'var(--text-heading)' }}>{selectedMessage.email}</h3>
                <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Gửi lúc {formatDate(selectedMessage.created_at)}{selectedMessage.source_path ? ` từ ${selectedMessage.source_path}` : ''}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${selectedMessage.email}?subject=${encodeURIComponent('4B phản hồi yêu cầu hỗ trợ')}`} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold text-white no-underline" style={{ background: 'var(--primary)' }}>
                  <Mail size={15} /> Phản hồi email
                </a>
                {selectedMessage.phone ? (
                  <a href={`tel:${selectedMessage.phone}`} className="inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-bold no-underline" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                    <Phone size={15} /> Gọi điện
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}><MessageSquareText size={14} /> Nội dung người dùng gửi</div>
              <p className="whitespace-pre-wrap text-sm leading-7" style={{ color: 'var(--text-main)' }}>{selectedMessage.message}</p>
              {selectedMessage.phone ? <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>Số liên hệ: <strong style={{ color: 'var(--text-main)' }}>{selectedMessage.phone}</strong></p> : null}
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                Trạng thái xử lý
                <select
                  aria-label="Trạng thái yêu cầu"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as SupportStatus)}
                  className="mt-1.5 h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                >
                  {SUPPORT_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
                </select>
              </label>
              <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                Ghi chú nội bộ
                <textarea
                  aria-label="Ghi chú nội bộ"
                  value={adminNote}
                  onChange={(event) => setAdminNote(event.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="Ví dụ: Đã phản hồi qua email, chờ người dùng xác nhận…"
                  className="mt-1.5 w-full resize-y rounded-xl border bg-[var(--surface)] p-3 text-sm outline-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
                />
              </label>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => void saveMessage()} disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--gradient-primary)' }}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {saving ? 'Đang lưu…' : 'Lưu trạng thái'}
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card variant="surface" className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
          <Headphones size={32} style={{ color: 'var(--primary)' }} />
          <h3 className="mt-3 font-extrabold" style={{ color: 'var(--text-heading)' }}>Hộp thư đang trống</h3>
          <p className="mt-1 max-w-sm text-sm" style={{ color: 'var(--text-muted)' }}>Yêu cầu được gửi từ Chat Now trên website sẽ xuất hiện tại đây.</p>
        </Card>
      )}
    </div>
  );
}
