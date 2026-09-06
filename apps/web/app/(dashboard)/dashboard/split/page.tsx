'use client';

import { useState, useEffect } from 'react';
import { formatVND } from '@/lib/split';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';
import { toast } from 'sonner';

type SplitMode = 'equal' | 'ratio' | 'days';

export default function SplitPage() {
  const { members, expenses, addExpense } = useAppStore();
  const { openModal } = useUIStore();

  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<number[]>([]);

  // Initialize mock members if empty
  useEffect(() => {
    if (members.length === 0) {
      const mockMembers = [
        { id: '1', room_id: 'room-1', user_id: 'user-1', nickname: 'Minh Tuấn (Trưởng phòng)', role: 'owner' as const, joined_at: new Date().toISOString() },
        { id: '2', room_id: 'room-1', user_id: 'user-2', nickname: 'Thành viên 1', role: 'member' as const, joined_at: new Date().toISOString() },
        { id: '3', room_id: 'room-1', user_id: 'user-3', nickname: 'Thành viên 2', role: 'member' as const, joined_at: new Date().toISOString() },
        { id: '4', room_id: 'room-1', user_id: 'user-4', nickname: 'Thành viên 3', role: 'member' as const, joined_at: new Date().toISOString() },
      ];
      mockMembers.forEach(m => {
        useAppStore.getState().addMember(m as any);
      });
    }
  }, [members.length]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setExpenseValue(value);
  };

  const handleApplyExpense = () => {
    if (!expenseTitle || !expenseValue) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const total = parseInt(expenseValue, 10) || 0;
    const perPerson = Math.floor(total / members.length);
    const amounts: number[] = [];

    for (let i = 0; i < members.length; i++) {
      amounts.push(perPerson + (i < (total % members.length) ? 1 : 0));
    }

    setSplitAmounts(amounts);
    setShowPreview(true);
    toast.success('Đã phân bổ chi phí thành công!');
  };

  const handleConfirmExpense = () => {
    if (!expenseTitle || !expenseValue) return;

    const total = parseInt(expenseValue, 10) || 0;

    const newExpense = {
      id: Math.random().toString(36).substring(7),
      room_id: 'room-1',
      created_by: 'user-1',
      title: expenseTitle,
      amount: total,
      category: 'other' as const,
      due_date: null,
      paid_by: 'user-1',
      paid_at: null,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      allocations: members.map((m, i) => ({
        id: Math.random().toString(36).substring(7),
        expense_id: '',
        member_id: m.id,
        amount: splitAmounts[i] || 0,
        status: 'pending' as const,
        paid_at: null,
        payment_method: null,
        created_at: new Date().toISOString(),
      })),
    };

    addExpense(newExpense);
    setShowPreview(false);
    setExpenseTitle('');
    setExpenseValue('');
    setSplitAmounts([]);
    toast.success('Đã lưu hóa đơn thành công!');
  };

  const getModeDescription = () => {
    switch (splitMode) {
      case 'equal':
        return 'Chế độ Chia Đều: Số tiền sẽ tự động phân bổ bằng nhau cho toàn bộ thành viên trong phòng.';
      case 'ratio':
        return 'Chế độ Chia Theo Tỷ Lệ %: Nhập tỷ lệ phần trăm cho từng thành viên để phân bổ chi phí.';
      case 'days':
        return 'Chế độ Chia Theo Số Ngày Ở: Áp dụng cho thành viên ở không đủ tháng, số tiền sẽ được tính theo số ngày thực tế.';
    }
  };

  const handleAddNewExpense = () => {
    openModal('add-expense');
  };

  return (
    <div className="space-y-5">
      {/* Tab Split */}
      <div id="tab-split">
        {/* Main Card */}
        <div
          className="rounded-2xl border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-calculator text-sm" style={{ color: 'var(--primary)' }} />
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                Thêm Hóa Đơn & Tự Động Chia Chi Phí
              </span>
            </div>
            <button
              onClick={handleAddNewExpense}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--gradient-primary)' }}
            >
              <i className="fa-solid fa-plus mr-1" />
              Thêm nhanh
            </button>
          </div>

          <div className="p-4">
            {/* Split Mode Buttons */}
            <div
              className="mb-4 flex gap-2 rounded-xl p-1"
              style={{
                background: 'var(--bg-light)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                onClick={() => setSplitMode('equal')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  splitMode === 'equal' ? 'text-white shadow-md' : ''
                }`}
                style={
                  splitMode === 'equal'
                    ? { background: 'var(--surface)', color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                Chia Đều
              </button>
              <button
                onClick={() => setSplitMode('ratio')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  splitMode === 'ratio' ? 'text-white shadow-md' : ''
                }`}
                style={
                  splitMode === 'ratio'
                    ? { background: 'var(--surface)', color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                Chia Theo Tỷ Lệ %
              </button>
              <button
                onClick={() => setSplitMode('days')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                  splitMode === 'days' ? 'text-white shadow-md' : ''
                }`}
                style={
                  splitMode === 'days'
                    ? { background: 'var(--surface)', color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }
                    : { color: 'var(--text-muted)' }
                }
              >
                Chia Theo Số Ngày Ở
              </button>
            </div>

            {/* Form Grid */}
            <div
              className="mb-4 grid gap-3 md:grid-cols-2"
              style={{ gridTemplateColumns: '2fr 1fr' }}
            >
              <div>
                <label
                  className="mb-1 block text-xs font-semibold"
                  style={{ color: 'var(--dark)' }}
                >
                  Tên khoản chi / Hóa đơn
                </label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="VD: Tiền điện T8, Mua nước bình..."
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
              <div>
                <label
                  className="mb-1 block text-xs font-semibold"
                  style={{ color: 'var(--dark)' }}
                >
                  Số tiền tổng (đ)
                </label>
                <input
                  type="text"
                  value={expenseValue}
                  onChange={handleValueChange}
                  placeholder="VD: 1200000"
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>
            </div>

            {/* Info Box */}
            <div
              className="mb-4 rounded-xl border p-3.5"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
              }}
            >
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <i className="fa-solid fa-circle-info mr-1" style={{ color: 'var(--primary)' }} />
                {getModeDescription()}
              </p>
            </div>

            {/* Apply Button */}
            <button
              onClick={handleApplyExpense}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
              }}
            >
              <i className="fa-solid fa-check" />
              Xác Nhận Phân Bổ Hóa Đơn
            </button>
          </div>
        </div>

        {/* Preview Results */}
        {showPreview && (
          <div
            className="mt-4 rounded-2xl border p-4"
            style={{
              background: 'var(--color-bg-soft-primary)',
              borderColor: 'var(--color-border-soft-primary)',
            }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                Kết quả phân bổ cho {members.length} thành viên:
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: 'var(--primary)' }}
              >
                Tổng: {formatVND(parseInt(expenseValue, 10) || 0)}
              </span>
            </div>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border bg-white px-4 py-2.5"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      {(member.nickname || 'T').charAt(0)}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                      {member.nickname}
                    </span>
                  </div>
                  <span
                    className="font-bold"
                    style={{ color: 'var(--primary)' }}
                  >
                    {formatVND(splitAmounts[index] || 0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/50"
                style={{ borderColor: 'var(--color-border-soft-primary)', color: 'var(--primary-dark)' }}
              >
                <i className="fa-solid fa-pen mr-1" />
                Chỉnh sửa lại
              </button>
              <button
                onClick={handleConfirmExpense}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-white"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <i className="fa-solid fa-check" />
                Xác nhận & Lưu
              </button>
            </div>
          </div>
        )}

        {/* Expense History */}
        {expenses.length > 0 && (
          <div
            className="mt-5 rounded-2xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="flex items-center gap-2 border-b px-4 py-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <i className="fa-solid fa-clock-rotate-left text-sm" style={{ color: 'var(--primary)' }} />
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                Lịch Sử Các Khoản Chi Phí
              </span>
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-xs font-bold"
                style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
              >
                {expenses.length}
              </span>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {expenses.slice(0, 5).map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{ background: 'var(--color-bg-soft-primary)' }}
                    >
                      <i className="fa-solid fa-file-invoice-dollar" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--dark)' }}>
                        {expense.title}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {new Date(expense.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: 'var(--primary)' }}>
                      {formatVND(expense.amount)}
                    </div>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs"
                      style={{
                        background: expense.status === 'paid' ? 'var(--color-bg-soft-primary)' : 'var(--color-bg-warning-soft)',
                        color: expense.status === 'paid' ? 'var(--primary)' : 'var(--danger)',
                      }}
                    >
                      {expense.status === 'paid' ? (
                        <>
                          <i className="fa-solid fa-check text-[8px]" />
                          Đã thanh toán
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-clock text-[8px]" />
                          Chưa thanh toán
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {expenses.length > 5 && (
              <div
                className="border-t px-4 py-3 text-center"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  className="text-sm font-medium transition-colors hover:text-[var(--primary)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Xem tất cả ({expenses.length} khoản)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
