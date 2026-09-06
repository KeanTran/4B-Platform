'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useUIStore } from '@/store/ui-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

export function AddDutyModal() {
  const { modalOpen, closeModal } = useUIStore();
  const { members } = useAppStore();

  const [title, setTitle] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [rotationType, setRotationType] = useState<string>('none');

  useEffect(() => {
    if (modalOpen === 'add-duty') {
      setTitle('');
      setAssignedTo('');
      setDueDate('');
      setRotationType('none');
    }
  }, [modalOpen]);

  if (modalOpen !== 'add-duty') return null;

  const handleSubmit = () => {
    if (!title.trim() || !assignedTo) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    toast.success('Đã thêm nhiệm vụ thành công!');
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

        {/* Due Date */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Ngày hết hạn (không bắt buộc)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
            }}
          />
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
