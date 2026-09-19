'use client';

import { useState } from 'react';
import { Loader2, PenLine, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Mẹo hay', 'Kinh nghiệm', 'Tài chính phòng trọ', 'Nấu ăn & Tiết kiệm', 'Khác'];

const EMPTY_FORM = {
  author_name: '',
  title: '',
  category: 'Mẹo hay',
  excerpt: '',
  content: '',
};

export function BlogSubmission() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          excerpt: form.excerpt.trim() || undefined,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Không thể gửi bài viết.');
      toast.success(result.message ?? 'Bài viết đã được gửi và đang chờ admin duyệt.');
      setForm(EMPTY_FORM);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi bài viết.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5" style={{ background: 'var(--primary)' }}>
        <Plus size={16} /> Viết bài chia sẻ
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="blog-submission-title">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: 'var(--primary)' }}><PenLine size={17} /></span>
                <div>
                  <h2 id="blog-submission-title" className="font-extrabold" style={{ color: 'var(--text-heading)' }}>Viết bài chia sẻ</h2>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bài gửi mới luôn được admin duyệt trước khi công khai.</p>
                </div>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Đóng form viết bài" className="flex h-9 w-9 items-center justify-center rounded-full" style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <form onSubmit={submit} className="max-h-[calc(90vh-74px)] space-y-4 overflow-y-auto p-5">
              <div className="rounded-xl border p-3 text-xs leading-5" style={{ background: 'var(--color-bg-soft-primary)', borderColor: 'var(--color-border-soft-primary)', color: 'var(--text-muted)' }}>
                Bạn cần đăng nhập để gửi bài. Sau khi được duyệt, bài sẽ có đường dẫn riêng và có thể xuất hiện trên công cụ tìm kiếm.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  Tên tác giả
                  <input required minLength={2} maxLength={80} value={form.author_name} onChange={(event) => setForm((current) => ({ ...current, author_name: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }} />
                </label>
                <label className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                  Chuyên mục
                  <select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}>
                    {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>
              </div>
              <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                Tiêu đề
                <input required minLength={3} maxLength={180} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }} />
              </label>
              <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                Mô tả ngắn
                <textarea maxLength={500} rows={2} value={form.excerpt} onChange={(event) => setForm((current) => ({ ...current, excerpt: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border bg-[var(--surface)] p-3 text-sm outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }} />
              </label>
              <label className="block text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                Nội dung
                <textarea required minLength={20} maxLength={50000} rows={9} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border bg-[var(--surface)] p-3 text-sm leading-6 outline-none" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }} />
              </label>
              <div className="flex justify-end gap-3 border-t pt-4" style={{ borderColor: 'var(--border)' }}>
                <button type="button" onClick={() => setOpen(false)} className="h-11 rounded-xl border px-4 text-sm font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}>Hủy</button>
                <button type="submit" disabled={submitting} className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--primary)' }}>
                  {submitting ? <Loader2 className="animate-spin" size={16} /> : <PenLine size={16} />}
                  {submitting ? 'Đang gửi…' : 'Gửi để admin duyệt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
