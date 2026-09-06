'use client';

import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useUIStore } from '@/store/ui-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { formatVND } from '@/lib/split';

export function AddExpenseModal() {
  const { modalOpen, closeModal } = useUIStore();
  const { members, addExpense } = useAppStore();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('other');
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { value: 'rent', label: 'Tiền thuê', icon: 'fa-solid fa-home' },
    { value: 'electric', label: 'Tiền điện', icon: 'fa-solid fa-bolt' },
    { value: 'water', label: 'Tiền nước', icon: 'fa-solid fa-faucet' },
    { value: 'internet', label: 'Internet', icon: 'fa-solid fa-wifi' },
    { value: 'other', label: 'Khác', icon: 'fa-solid fa-ellipsis' },
  ];

  useEffect(() => {
    if (modalOpen === 'add-expense') {
      setTitle('');
      setAmount('');
      setCategory('other');
      setShowPreview(false);
    }
  }, [modalOpen]);

  if (modalOpen !== 'add-expense') return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setAmount(value);
  };

  const handleSubmit = () => {
    if (!title.trim() || !amount) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const totalAmount = parseInt(amount, 10) || 0;
    const perPerson = Math.floor(totalAmount / members.length);

    setShowPreview(true);
  };

  const handleConfirm = () => {
    const totalAmount = parseInt(amount, 10) || 0;
    const perPerson = Math.floor(totalAmount / members.length);

    const newExpense = {
      id: Math.random().toString(36).substring(7),
      room_id: '',
      created_by: '',
      title: title.trim(),
      amount: totalAmount,
      category: category as 'rent' | 'electric' | 'water' | 'internet' | 'other',
      due_date: null,
      paid_by: '',
      paid_at: null,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      allocations: members.map((m, i) => ({
        id: Math.random().toString(36).substring(7),
        expense_id: '',
        member_id: m.id,
        amount: perPerson + (i < (totalAmount % members.length) ? 1 : 0),
        status: 'pending' as const,
        paid_at: null,
        payment_method: null,
        created_at: new Date().toISOString(),
      })),
    };

    addExpense(newExpense);
    toast.success('Đã thêm hóa đơn thành công!');
    closeModal();
  };

  return (
    <Modal id="add-expense" title="Thêm Hóa Đơn Mới" size="md">
      <div className="space-y-4">
        {/* Category Selection */}
        <div>
          <label
            className="mb-2 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Loại chi phí
          </label>
          <div className="grid grid-cols-5 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex flex-col items-center rounded-xl border p-3 text-xs transition-all ${
                  category === cat.value ? 'border-[var(--primary)]' : ''
                }`}
                style={{
                  borderColor: category === cat.value ? 'var(--primary)' : 'var(--border)',
                  background: category === cat.value ? 'var(--color-bg-soft-primary)' : 'var(--bg-light)',
                  color: category === cat.value ? 'var(--primary)' : 'var(--text-muted)',
                }}
              >
                <i className={`${cat.icon} mb-1 text-lg`} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Tên khoản chi / Hóa đơn
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="VD: Tiền điện T8, Mua nước bình..."
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
            }}
          />
        </div>

        {/* Amount Input */}
        <div>
          <label
            className="mb-1 block text-xs font-semibold"
            style={{ color: 'var(--dark)' }}
          >
            Số tiền tổng (đ)
          </label>
          <input
            type="text"
            value={amount}
            onChange={handleAmountChange}
            placeholder="VD: 1200000"
            className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
            }}
          />
          {amount && (
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Mỗi thành viên: {formatVND(Math.floor(parseInt(amount, 10) / members.length))}
            </p>
          )}
        </div>

        {/* Preview */}
        {showPreview && (
          <div
            className="rounded-xl border p-4"
            style={{
              background: 'var(--color-bg-soft-primary)',
              borderColor: 'var(--color-border-soft-primary)',
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                Xem trước phân bổ:
              </span>
              <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>
                Tổng: {formatVND(parseInt(amount, 10) || 0)}
              </span>
            </div>
            <div className="space-y-2">
              {members.map((member, index) => {
                const totalAmount = parseInt(amount, 10) || 0;
                const perPerson = Math.floor(totalAmount / members.length);
                const extra = index < (totalAmount % members.length) ? 1 : 0;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border bg-white px-3 py-2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span className="text-sm font-medium" style={{ color: 'var(--dark)' }}>
                      {member.nickname || 'Thành viên'}
                    </span>
                    <span className="font-semibold" style={{ color: 'var(--primary)' }}>
                      {formatVND(perPerson + extra)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={closeModal}
            className="flex-1 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Hủy
          </button>
          {!showPreview ? (
            <button
              onClick={handleSubmit}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Xem trước
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-xl px-4 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Xác nhận & Lưu
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
