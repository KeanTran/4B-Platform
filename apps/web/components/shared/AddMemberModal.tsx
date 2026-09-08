'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useUIStore } from '@/store/ui-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

export function AddMemberModal() {
  const { modalOpen, closeModal, addNotification } = useUIStore();
  const { addMember, members } = useAppStore();

  const [name, setName] = useState('');

  useEffect(() => {
    if (modalOpen === 'add-member') {
      setName('');
    }
  }, [modalOpen]);

  if (modalOpen !== 'add-member') return null;

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên thành viên');
      return;
    }

    const newMember = {
      id: Math.random().toString(36).substring(7),
      room_id: 'room-1',
      user_id: `user-${members.length + 1}`,
      nickname: name.trim(),
      role: 'member' as const,
      joined_at: new Date().toISOString(),
    };

    addMember(newMember);
    addNotification({
      type: 'system',
      title: 'Thành viên mới',
      message: `"${name.trim()}" đã được thêm vào phòng.`,
    });
    toast.success(`Đã thêm thành viên "${name.trim()}" thành công!`);
    closeModal();
  };

  return (
    <Modal id="add-member" title="Thêm Thành Viên Mới" size="md">
      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Tên thành viên
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Nhập tên thành viên mới..."
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
            }}
            autoFocus
          />
        </div>

        {/* Info */}
        <div
          className="rounded-xl border p-3"
          style={{
            background: 'var(--color-bg-soft-primary)',
            borderColor: 'var(--color-border-soft-primary)',
          }}
        >
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-circle-info mr-1" style={{ color: 'var(--primary)' }} />
            Thành viên mới sẽ được thêm với vai trò &quot;Thành viên&quot;. Bạn có thể thay đổi vai trò sau.
          </p>
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
            <i className="fa-solid fa-user-plus mr-2" />
            Thêm thành viên
          </button>
        </div>
      </div>
    </Modal>
  );
}
