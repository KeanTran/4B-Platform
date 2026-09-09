'use client';

import { useState, useEffect } from 'react';
import { formatVND } from '@/lib/split';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';
import { toast } from 'sonner';

type SplitMode = 'equal' | 'ratio' | 'days';

export default function SplitPage() {
  const { members, expenses, addExpense, deleteExpense, clearAllExpenses, user } = useAppStore();
  const { openModal } = useUIStore();

  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseValue, setExpenseValue] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [splitAmounts, setSplitAmounts] = useState<number[]>([]);

  // Ratio state: map member index -> percentage
  const [memberRatios, setMemberRatios] = useState<Record<string, number>>({});
  // Days state: map member index -> days stayed
  const [memberDays, setMemberDays] = useState<Record<string, number>>({});

  const ownerDisplayName = user?.full_name?.trim() || (user?.email ? user.email.split('@')[0] : 'Trưởng phòng');

  // Initialize members if empty
  useEffect(() => {
    if (members.length === 0) {
      const initialMembers = [
        { id: '1', room_id: 'room-1', user_id: user?.id || 'user-1', nickname: `${ownerDisplayName} (Trưởng phòng)`, role: 'owner' as const, joined_at: new Date().toISOString() },
        { id: '2', room_id: 'room-1', user_id: 'user-2', nickname: 'Thành viên 1', role: 'member' as const, joined_at: new Date().toISOString() },
        { id: '3', room_id: 'room-1', user_id: 'user-3', nickname: 'Thành viên 2', role: 'member' as const, joined_at: new Date().toISOString() },
        { id: '4', room_id: 'room-1', user_id: 'user-4', nickname: 'Thành viên 3', role: 'member' as const, joined_at: new Date().toISOString() },
      ];
      initialMembers.forEach(m => {
        useAppStore.getState().addMember(m as any);
      });
    }
  }, [members.length, ownerDisplayName, user?.id]);

  // Initialize ratios and days when members change
  useEffect(() => {
    if (members.length > 0) {
      const defaultRatios: Record<string, number> = {};
      const defaultDays: Record<string, number> = {};
      const equalRatio = Math.floor(100 / members.length);
      members.forEach((m, i) => {
        if (!memberRatios[m.id]) {
          // Last member gets the remainder to make sure it sums to 100
          defaultRatios[m.id] = i === members.length - 1
            ? 100 - equalRatio * (members.length - 1)
            : equalRatio;
        } else {
          defaultRatios[m.id] = memberRatios[m.id] ?? equalRatio;
        }
        if (!memberDays[m.id]) {
          defaultDays[m.id] = 30;
        } else {
          defaultDays[m.id] = memberDays[m.id] ?? 30;
        }
      });
      setMemberRatios(defaultRatios);
      setMemberDays(defaultDays);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.length]);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setExpenseValue(value);
  };

  const handleRatioChange = (memberId: string, value: string) => {
    const num = parseInt(value, 10);
    setMemberRatios(prev => ({
      ...prev,
      [memberId]: isNaN(num) ? 0 : Math.min(100, Math.max(0, num)),
    }));
  };

  const handleDaysChange = (memberId: string, value: string) => {
    const num = parseInt(value, 10);
    setMemberDays(prev => ({
      ...prev,
      [memberId]: isNaN(num) ? 0 : Math.max(0, num),
    }));
  };

  const totalRatio = Object.values(memberRatios).reduce((sum, r) => sum + r, 0);
  const totalDays = Object.values(memberDays).reduce((sum, d) => sum + d, 0);

  const handleApplyExpense = () => {
    if (!expenseTitle || !expenseValue) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const total = parseInt(expenseValue, 10) || 0;
    const amounts: number[] = [];

    if (splitMode === 'equal') {
      const perPerson = Math.floor(total / members.length);
      for (let i = 0; i < members.length; i++) {
        amounts.push(perPerson + (i < (total % members.length) ? 1 : 0));
      }
    } else if (splitMode === 'ratio') {
      if (totalRatio !== 100) {
        toast.error(`Tổng tỷ lệ phải bằng 100% (hiện tại: ${totalRatio}%)`);
        return;
      }
      let allocated = 0;
      members.forEach((m, i) => {
        const ratio = memberRatios[m.id] || 0;
        if (i === members.length - 1) {
          amounts.push(total - allocated);
        } else {
          const amount = Math.floor(total * ratio / 100);
          amounts.push(amount);
          allocated += amount;
        }
      });
    } else if (splitMode === 'days') {
      if (totalDays === 0) {
        toast.error('Tổng số ngày phải lớn hơn 0');
        return;
      }
      let allocated = 0;
      members.forEach((m, i) => {
        const days = memberDays[m.id] || 0;
        if (i === members.length - 1) {
          amounts.push(total - allocated);
        } else {
          const amount = Math.floor(total * days / totalDays);
          amounts.push(amount);
          allocated += amount;
        }
      });
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

  const handleDeleteExpense = (id: string, title: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa khoản chi "${title}"?`)) {
      deleteExpense(id);
      toast.success(`Đã xóa khoản chi "${title}" thành công!`);
    }
  };

  const handleClearAllExpenses = () => {
    if (expenses.length === 0) return;
    if (window.confirm('Bạn có chắc muốn xóa TOÀN BỘ lịch sử các khoản chi phí không? Hệ thống sẽ đặt lại toàn bộ tổng quan thu chi.')) {
      clearAllExpenses();
      toast.success('Đã xóa toàn bộ lịch sử chi phí!');
    }
  };

  const handleResetForm = () => {
    setExpenseTitle('');
    setExpenseValue('');
    setShowPreview(false);
    toast.info('Đã xóa dữ liệu nhập biểu mẫu.');
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

            {/* ========== RATIO INPUT SECTION ========== */}
            {splitMode === 'ratio' && members.length > 0 && (
              <div
                className="mb-4 rounded-xl border p-4"
                style={{
                  background: 'var(--bg-light)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Nhập tỷ lệ % cho từng thành viên
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{
                      background: totalRatio === 100 ? 'var(--color-bg-soft-primary)' : 'var(--color-bg-warning-soft)',
                      color: totalRatio === 100 ? 'var(--primary)' : 'var(--danger)',
                    }}
                  >
                    Tổng: {totalRatio}%
                  </span>
                </div>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: 'var(--primary)' }}
                      >
                        {(member.nickname || 'T').charAt(0)}
                      </div>
                      <span className="flex-1 text-sm font-medium" style={{ color: 'var(--dark)' }}>
                        {member.nickname}
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={memberRatios[member.id] || 0}
                          onChange={(e) => handleRatioChange(member.id, e.target.value)}
                          className="w-16 rounded-lg border px-2 py-1.5 text-center text-sm font-semibold transition-colors focus:border-[var(--primary)] focus:outline-none"
                          style={{
                            borderColor: 'var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--primary)',
                          }}
                        />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>%</span>
                      </div>
                      {expenseValue && (
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          ≈ {formatVND(Math.floor((parseInt(expenseValue, 10) || 0) * (memberRatios[member.id] || 0) / 100))}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {totalRatio !== 100 && (
                  <div
                    className="mt-2 flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium"
                    style={{ background: 'var(--color-bg-warning-soft)', color: 'var(--danger)' }}
                  >
                    <i className="fa-solid fa-triangle-exclamation" />
                    Tổng tỷ lệ phải bằng 100%. Hiện tại: {totalRatio}% ({totalRatio > 100 ? 'vượt' : 'thiếu'} {Math.abs(100 - totalRatio)}%)
                  </div>
                )}
              </div>
            )}

            {/* ========== DAYS INPUT SECTION ========== */}
            {splitMode === 'days' && members.length > 0 && (
              <div
                className="mb-4 rounded-xl border p-4"
                style={{
                  background: 'var(--bg-light)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                    Nhập số ngày ở cho từng thành viên
                  </span>
                  <span
                    className="rounded-full px-2 py-0.5 text-xs font-bold"
                    style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                  >
                    Tổng: {totalDays} ngày
                  </span>
                </div>
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 rounded-lg border bg-white px-3 py-2.5"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ background: 'var(--primary)' }}
                      >
                        {(member.nickname || 'T').charAt(0)}
                      </div>
                      <span className="flex-1 text-sm font-medium" style={{ color: 'var(--dark)' }}>
                        {member.nickname}
                      </span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max="31"
                          value={memberDays[member.id] || 0}
                          onChange={(e) => handleDaysChange(member.id, e.target.value)}
                          className="w-16 rounded-lg border px-2 py-1.5 text-center text-sm font-semibold transition-colors focus:border-[var(--primary)] focus:outline-none"
                          style={{
                            borderColor: 'var(--border)',
                            background: 'var(--surface)',
                            color: 'var(--primary)',
                          }}
                        />
                        <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>ngày</span>
                      </div>
                      {expenseValue && totalDays > 0 && (
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                          ≈ {formatVND(Math.floor((parseInt(expenseValue, 10) || 0) * (memberDays[member.id] || 0) / totalDays))}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

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

            {/* Apply & Reset Form Buttons */}
            <div className="flex flex-wrap items-center gap-3">
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

              {(expenseTitle || expenseValue) && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  title="Xóa thông tin vừa nhập"
                >
                  <i className="fa-solid fa-rotate-left" />
                  Xóa nội dung nhập
                </button>
              )}
            </div>
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
              className="flex items-center justify-between border-b px-4 py-3"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-clock-rotate-left text-sm" style={{ color: 'var(--primary)' }} />
                <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                  Lịch Sử Các Khoản Chi Phí
                </span>
                <span
                  className="ml-1 rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                >
                  {expenses.length}
                </span>
              </div>

              {/* Clear All Expenses */}
              <button
                type="button"
                onClick={handleClearAllExpenses}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 dark:border-red-900/40 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Xóa tất cả các khoản chi"
              >
                <i className="fa-solid fa-trash text-[10px]" />
                Xóa tất cả
              </button>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--bg-light)]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
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

                  <div className="flex items-center gap-3">
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

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteExpense(expense.id, expense.title)}
                      className="rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Xóa khoản chi này"
                      aria-label="Xóa khoản chi"
                    >
                      <i className="fa-solid fa-trash text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
