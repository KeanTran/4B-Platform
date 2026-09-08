'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useUIStore } from '@/store/ui-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

const DAY_OPTIONS = [
  { value: 0, label: 'Thứ 2', short: 'T2' },
  { value: 1, label: 'Thứ 3', short: 'T3' },
  { value: 2, label: 'Thứ 4', short: 'T4' },
  { value: 3, label: 'Thứ 5', short: 'T5' },
  { value: 4, label: 'Thứ 6', short: 'T6' },
  { value: 5, label: 'Thứ 7', short: 'T7' },
  { value: 6, label: 'Chủ nhật', short: 'CN' },
];

export function AddDutyModal() {
  const { modalOpen, closeModal, addNotification } = useUIStore();
  const { members } = useAppStore();

  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [rotationType, setRotationType] = useState<string>('none');

  useEffect(() => {
    if (modalOpen === 'add-duty') {
      setTitle('');
      setAssignedTo('');
      setSelectedDay(0);
      setRotationType('none');
    }
  }, [modalOpen]);

  if (modalOpen !== 'add-duty') return null;

  const handleSubmit = () => {
    if (!title.trim() || !assignedTo) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Call the callback from duties page to add the duty to local state
    const callback = (window as any).__addDutyCallback;
    if (callback) {
      callback(title.trim(), assignedTo, selectedDay);
    } else {
      toast.success('Đã thêm nhiệm vụ thành công!');
    }

    const assignedMember = members.find((m) => m.id === assignedTo);
    addNotification({
      type: 'duty',
      title: 'Lịch trực nhật mới',
      message: `Đã phân công "${title.trim()}" cho ${assignedMember?.nickname || 'thành viên'}.`,
    });

    closeModal();
  };

  return (
    <Modal id="add-duty" title="Thêm Nhiệm Vụ Mới" size="md">
      <div className="space-y-4">
        {/* Task Title */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Tên nhiệm vụ
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Quét nhà, Lau sàn, Rửa bát..."
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        {/* Assignee */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Giao cho
          </label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
            }}
          >
            <option value="">-- Chọn thành viên --</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.nickname || 'Thành viên'}
              </option>
            ))}
          </select>
        </div>

        {/* Day of Week */}
        <div>
          <label
            className="mb-2 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Ngày trong tuần
          </label>
          <div className="grid grid-cols-7 gap-1.5">
            {DAY_OPTIONS.map((day) => (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className={`flex flex-col items-center rounded-xl border p-2 text-xs transition-all ${
                  selectedDay === day.value ? 'border-[var(--primary)]' : ''
                }`}
                style={{
                  borderColor: selectedDay === day.value ? 'var(--primary)' : 'var(--border)',
                  background: selectedDay === day.value ? 'var(--color-bg-soft-primary)' : 'var(--bg-light)',
                  color: selectedDay === day.value ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                <span className="font-bold">{day.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rotation Type */}
        <div>
          <label
            className="mb-2 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Chế độ xoay vòng
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'none', label: 'Một lần', icon: 'fa-solid fa-ban' },
              { value: 'weekly', label: 'Hàng tuần', icon: 'fa-solid fa-calendar-week' },
              { value: 'monthly', label: 'Hàng tháng', icon: 'fa-solid fa-calendar' },
              { value: 'custom', label: 'Tùy chỉnh', icon: 'fa-solid fa-sliders' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setRotationType(opt.value)}
                className={`flex flex-col items-center rounded-xl border p-3 text-xs transition-all ${
                  rotationType === opt.value ? 'border-[var(--primary)]' : ''
                }`}
                style={{
                  borderColor: rotationType === opt.value ? 'var(--primary)' : 'var(--border)',
                  background: rotationType === opt.value ? 'var(--color-bg-soft-primary)' : 'var(--bg-light)',
                  color: rotationType === opt.value ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                <i className={`${opt.icon} mb-1 text-base`} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={closeModal}
            className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Thêm nhiệm vụ
          </button>
        </div>
      </div>
    </Modal>
  );
}
