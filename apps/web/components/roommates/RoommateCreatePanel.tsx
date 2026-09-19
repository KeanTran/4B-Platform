'use client';

import { FormEvent, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import type { RoommatePost, RoommateProfile } from '@/types/roommates';

type CreateKind = 'profile' | 'post';

interface RoommateCreatePanelProps {
  kind: CreateKind;
  onClose: () => void;
  onCreated: (item: RoommateProfile | RoommatePost) => void;
}

const fieldClass =
  'h-11 w-full rounded-xl border bg-[var(--surface)] px-3 text-sm outline-none focus:ring-2 focus:ring-[var(--focus-ring)]';

function textValue(form: FormData, key: string) {
  return String(form.get(key) ?? '').trim();
}

export function RoommateCreatePanel({ kind, onClose, onCreated }: RoommateCreatePanelProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const shared = {
      city: textValue(form, 'city'),
      district: textValue(form, 'district'),
      budget_min: Number(form.get('budget_min')),
      budget_max: Number(form.get('budget_max')),
      move_in_date: textValue(form, 'move_in_date') || null,
    };
    const payload = kind === 'profile'
      ? {
          ...shared,
          display_name: textValue(form, 'display_name'),
          occupation: textValue(form, 'occupation') || null,
          bio: textValue(form, 'bio'),
          habits: textValue(form, 'habits').split(',').map((item) => item.trim()).filter(Boolean),
          is_discoverable: form.get('is_discoverable') === 'on',
        }
      : {
          ...shared,
          title: textValue(form, 'title'),
          content: textValue(form, 'content'),
          tags: textValue(form, 'tags').split(',').map((item) => item.trim()).filter(Boolean),
        };

    setSubmitting(true);
    try {
      const endpoint = kind === 'profile' ? 'profiles' : 'posts';
      const response = await fetch(`/api/roommates/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(response.status === 401 ? 'Bạn cần đăng nhập để thực hiện thao tác này.' : result.error);
      }
      onCreated(kind === 'profile' ? result.profile : result.post);
      toast.success(kind === 'profile' ? 'Đã lưu hồ sơ tìm bạn ở ghép.' : 'Đã đăng bài lên diễn đàn.');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể lưu dữ liệu.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="glass-surface-strong rounded-[var(--radius-xl)] p-5 sm:p-6" aria-label={kind === 'profile' ? 'Tạo hồ sơ ở ghép' : 'Đăng bài tìm bạn'}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: 'var(--primary)' }}>Thông tin công khai</p>
          <h3 className="brand-font mt-1 text-xl font-bold" style={{ color: 'var(--text-heading)' }}>
            {kind === 'profile' ? 'Tạo hồ sơ tìm bạn ở ghép' : 'Đăng bài lên diễn đàn'}
          </h3>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Không nhập số điện thoại hoặc thông tin nhạy cảm vào nội dung công khai.</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Đóng biểu mẫu" className="flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}><X size={16} /></button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
        {kind === 'profile' ? (
          <>
            <label className="text-xs font-bold">Tên hiển thị<input name="display_name" required minLength={2} maxLength={80} className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
            <label className="text-xs font-bold">Nghề nghiệp<input name="occupation" maxLength={120} className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
          </>
        ) : (
          <label className="text-xs font-bold sm:col-span-2">Tiêu đề<input name="title" required minLength={8} maxLength={160} className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
        )}
        <label className="text-xs font-bold">Tỉnh/thành phố<input name="city" required defaultValue="TP.HCM" className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
        <label className="text-xs font-bold">Quận/huyện<input name="district" required className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
        <label className="text-xs font-bold">Ngân sách tối thiểu (đ)<input name="budget_min" type="number" required min={0} step={100000} className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
        <label className="text-xs font-bold">Ngân sách tối đa (đ)<input name="budget_max" type="number" required min={0} step={100000} className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
        <label className="text-xs font-bold">Ngày chuyển vào<input name="move_in_date" type="date" className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
        <label className="text-xs font-bold">{kind === 'profile' ? 'Thói quen' : 'Thẻ'} (cách nhau bằng dấu phẩy)<input name={kind === 'profile' ? 'habits' : 'tags'} className={`${fieldClass} mt-1.5`} style={{ borderColor: 'var(--border)' }} /></label>
        <label className="text-xs font-bold sm:col-span-2">{kind === 'profile' ? 'Giới thiệu' : 'Nội dung'}<textarea name={kind === 'profile' ? 'bio' : 'content'} required={kind === 'post'} minLength={kind === 'post' ? 20 : undefined} maxLength={kind === 'post' ? 3000 : 1000} rows={4} className="mt-1.5 w-full rounded-xl border bg-[var(--surface)] p-3 text-sm outline-none focus:ring-2 focus:ring-[var(--focus-ring)]" style={{ borderColor: 'var(--border)' }} /></label>
        {kind === 'profile' && (
          <label className="flex items-center gap-2 text-xs font-bold sm:col-span-2"><input name="is_discoverable" type="checkbox" className="h-4 w-4 accent-[var(--primary)]" />Cho phép hiển thị hồ sơ trong mục khám phá</label>
        )}
        <div className="flex justify-end gap-3 sm:col-span-2">
          <button type="button" onClick={onClose} className="h-11 rounded-full border px-5 text-sm font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>Huỷ</button>
          <button type="submit" disabled={submitting} className="flex h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-white disabled:opacity-60" style={{ background: 'var(--gradient-primary)' }}>
            {submitting && <Loader2 size={15} className="animate-spin" />}
            {kind === 'profile' ? 'Lưu hồ sơ' : 'Đăng bài'}
          </button>
        </div>
      </form>
    </section>
  );
}
