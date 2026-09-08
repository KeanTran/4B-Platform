'use client';

import { useState } from 'react';
import { Modal } from './Modal';
import { useUIStore } from '@/store/ui-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

export function EditMemberModal() {
  const { modalOpen, modalData, closeModal, addNotification } = useUIStore();
  const { updateMember } = useAppStore();

  const member = modalData?.member as { id: string; nickname?: string | null; role?: string } | undefined;

  const [name, setName] = useState(member?.nickname || '');
  const [role, setRole] = useState(member?.role || 'member');

  if (modalOpen !== 'edit-member' || !member) return null;

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thành viên');
      return;
    }

    updateMember(member.id, { nickname: name.trim(), role: role as 'owner' | 'admin' | 'member' });
    addNotification({
      type: 'system',
      title: 'Cập nhật thành viên',
      message: `Thông tin của thành viên "${name.trim()}" đã được cập nhật.`,
    });
    toast.success('Đã cập nhật thông tin thành viên');
    closeModal();
  };

  return (
    <Modal id="edit-member" title="Chỉnh sửa thành viên" size="md">
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Tên hiển thị
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên thành viên"
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        {/* Role Select */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Vai trò
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
            }}
          >
            <option value="owner">Trưởng phòng</option>
            <option value="admin">Phó phòng</option>
            <option value="member">Thành viên</option>
          </select>
        </div>

        {/* Payment Status */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Trạng thái thanh toán
          </label>
          <div className="flex gap-3">
            <button
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-light)',
                color: 'var(--text-muted)',
              }}
            >
              <i className="fa-solid fa-clock mr-2" />
              Chưa đóng
            </button>
            <button
              className="flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition-all"
              style={{
                borderColor: 'var(--primary)',
                background: 'var(--color-bg-soft-primary)',
                color: 'var(--primary)',
              }}
            >
              <i className="fa-solid fa-check mr-2" />
              Đã đóng
            </button>
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
            onClick={handleSave}
            className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--gradient-primary)' }}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </Modal>
  );
}
