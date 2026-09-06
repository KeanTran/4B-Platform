'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';

const BANK_OPTIONS = [
  { value: '', label: '-- Chọn ngân hàng --' },
  { value: 'Vietcombank', label: 'Vietcombank', bin: '970436' },
  { value: 'BIDV', label: 'BIDV', bin: '970418' },
  { value: 'VietinBank', label: 'VietinBank', bin: '970415' },
  { value: 'Agribank', label: 'Agribank', bin: '970405' },
  { value: 'TPBank', label: 'TPBank', bin: '970423' },
  { value: 'MBBank', label: 'MB Bank', bin: '970426' },
  { value: 'VPBank', label: 'VPBank', bin: '970432' },
  { value: 'ACB', label: 'ACB', bin: '970416' },
  { value: 'Sacombank', label: 'Sacombank', bin: '970403' },
  { value: 'Techcombank', label: 'Techcombank', bin: '970407' },
];

export default function SettingsPage() {
  const {
    bankSetting,
    setBankSetting,
    notificationSettings,
    setNotificationSettings,
    monthlyBudget,
    setMonthlyBudget,
  } = useAppStore();

  const [bankInfo, setBankInfo] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });

  const [budgetValue, setBudgetValue] = useState('');
  const [hasChanges, setHasChanges] = useState({
    bank: false,
    budget: false,
  });

  // Initialize from store
  useEffect(() => {
    if (bankSetting) {
      setBankInfo({
        bankName: bankSetting.bank_name,
        accountNumber: bankSetting.account_number,
        accountHolder: bankSetting.account_name,
      });
    }
    setBudgetValue(monthlyBudget.toString());
  }, [bankSetting, monthlyBudget]);

  const handleBankFieldChange = (field: keyof typeof bankInfo, value: string) => {
    setBankInfo((prev) => ({ ...prev, [field]: value }));
    setHasChanges((prev) => ({ ...prev, bank: true }));
  };

  const handleSaveBankSettings = () => {
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) {
      toast.error('Vui lòng điền đầy đủ thông tin ngân hàng');
      return;
    }

    const selectedBank = BANK_OPTIONS.find((b) => b.value === bankInfo.bankName);

    setBankSetting({
      id: bankSetting?.id || Math.random().toString(36).substring(7),
      user_id: '',
      bank_bin: selectedBank?.bin || '',
      bank_name: bankInfo.bankName,
      account_number: bankInfo.accountNumber,
      account_name: bankInfo.accountHolder,
      is_default: true,
      created_at: bankSetting?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    setHasChanges((prev) => ({ ...prev, bank: false }));
    toast.success('Lưu thông tin ngân hàng thành công!');
  };

  const handleToggleNotification = (key: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [key]: !notificationSettings[key],
    });
    toast.success('Đã cập nhật cài đặt thông báo');
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '');
    setBudgetValue(value);
    setHasChanges((prev) => ({ ...prev, budget: true }));
  };

  const handleSaveBudget = () => {
    const budget = parseInt(budgetValue, 10) || 0;
    if (budget <= 0) {
      toast.error('Ngân sách phải lớn hơn 0');
      return;
    }

    setMonthlyBudget(budget);
    setHasChanges((prev) => ({ ...prev, budget: false }));
    toast.success('Lưu ngân sách thành công!');
  };

  return (
    <div className="space-y-5">
      {/* Tab Settings */}
      <div id="tab-settings">
        {/* Bank Settings Card */}
        <div
          className="rounded-2xl border"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <i className="fa-solid fa-building-columns text-sm" style={{ color: 'var(--primary)' }} />
            <span className="font-semibold" style={{ color: 'var(--dark)' }}>
              Thông Tin Ngân Hàng
            </span>
            {bankSetting && (
              <span
                className="ml-2 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
              >
                <i className="fa-solid fa-check mr-1" />
                Đã lưu
              </span>
            )}
          </div>

          <div className="p-4">
            {/* Info Alert */}
            <div
              className="mb-4 flex gap-3 rounded-xl border p-3 text-xs"
              style={{
                background: 'var(--accent-light)',
                borderColor: 'var(--accent)',
              }}
            >
              <i className="fa-solid fa-circle-info mt-0.5 text-sm" style={{ color: 'var(--accent)' }} />
              <div>
                <strong style={{ color: 'var(--dark)' }}>Thông tin thanh toán</strong>
                <br />
                <span style={{ color: 'var(--text-muted)' }}>
                  Cập nhật thông tin ngân hàng để tạo VietQR thanh toán tự động cho các thành viên.
                </span>
              </div>
            </div>

            {/* Form Grid */}
            <div className="space-y-4">
              <div>
                <label
                  className="mb-1 block text-xs font-semibold"
                  style={{ color: 'var(--dark)' }}
                >
                  Ngân hàng
                </label>
                <select
                  value={bankInfo.bankName}
                  onChange={(e) => handleBankFieldChange('bankName', e.target.value)}
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                >
                  {BANK_OPTIONS.map((bank) => (
                    <option key={bank.value} value={bank.value}>
                      {bank.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-1 block text-xs font-semibold"
                  style={{ color: 'var(--dark)' }}
                >
                  Số tài khoản
                </label>
                <input
                  type="text"
                  value={bankInfo.accountNumber}
                  onChange={(e) => handleBankFieldChange('accountNumber', e.target.value)}
                  placeholder="Nhập số tài khoản"
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
                  Tên chủ tài khoản
                </label>
                <input
                  type="text"
                  value={bankInfo.accountHolder}
                  onChange={(e) => handleBankFieldChange('accountHolder', e.target.value)}
                  placeholder="Nhập tên chủ tài khoản"
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveBankSettings}
                disabled={!hasChanges.bank}
                className="mt-2 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
                }}
              >
                <i className="fa-solid fa-check" />
                Lưu Thông Tin
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
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
            <i className="fa-solid fa-bell text-sm" style={{ color: 'var(--primary)' }} />
            <span className="font-semibold" style={{ color: 'var(--dark)' }}>
              Thông Báo
            </span>
          </div>

          <div className="p-4">
            <div className="space-y-4">
              {/* Expense Reminder */}
              <div
                className="flex items-center justify-between rounded-xl border p-4"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-light)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'var(--color-bg-soft-primary)' }}
                  >
                    <i className="fa-solid fa-bell" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                      Nhắc nhở đóng tiền
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Nhận thông báo khi đến hạn đóng tiền
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('expenseReminder')}
                  className="relative h-7 w-12 cursor-pointer rounded-full p-0.5 transition-colors"
                  style={{ background: notificationSettings.expenseReminder ? 'var(--primary)' : 'var(--border)' }}
                  aria-label="Toggle expense reminder"
                >
                  <div
                    className="h-6 w-6 rounded-full bg-white shadow transition-transform"
                    style={{ transform: notificationSettings.expenseReminder ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>

              {/* Payment Confirmation */}
              <div
                className="flex items-center justify-between rounded-xl border p-4"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-light)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'var(--color-bg-soft-primary)' }}
                  >
                    <i className="fa-solid fa-check-circle" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                      Xác nhận thanh toán
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Nhận thông báo khi có người đóng tiền
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('paymentConfirmation')}
                  className="relative h-7 w-12 cursor-pointer rounded-full p-0.5 transition-colors"
                  style={{ background: notificationSettings.paymentConfirmation ? 'var(--primary)' : 'var(--border)' }}
                  aria-label="Toggle payment confirmation"
                >
                  <div
                    className="h-6 w-6 rounded-full bg-white shadow transition-transform"
                    style={{ transform: notificationSettings.paymentConfirmation ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>

              {/* Duty Reminder */}
              <div
                className="flex items-center justify-between rounded-xl border p-4"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-light)',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: 'var(--color-bg-soft-primary)' }}
                  >
                    <i className="fa-solid fa-calendar-check" style={{ color: 'var(--primary)' }} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                      Nhắc nhở nhiệm vụ
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Nhận thông báo về nhiệm vụ được giao
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleNotification('dutyReminder')}
                  className="relative h-7 w-12 cursor-pointer rounded-full p-0.5 transition-colors"
                  style={{ background: notificationSettings.dutyReminder ? 'var(--primary)' : 'var(--border)' }}
                  aria-label="Toggle duty reminder"
                >
                  <div
                    className="h-6 w-6 rounded-full bg-white shadow transition-transform"
                    style={{ transform: notificationSettings.dutyReminder ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Settings */}
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
            <i className="fa-solid fa-coins text-sm" style={{ color: 'var(--primary)' }} />
            <span className="font-semibold" style={{ color: 'var(--dark)' }}>
              Ngân Sách Hàng Tháng
            </span>
          </div>

          <div className="p-4">
            <div>
              <label
                className="mb-1 block text-xs font-semibold"
                style={{ color: 'var(--dark)' }}
              >
                Giới hạn chi tiêu hàng tháng (VNĐ)
              </label>
              <input
                type="text"
                value={budgetValue}
                onChange={handleBudgetChange}
                placeholder="VD: 2000000"
                className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                style={{
                  background: 'var(--bg-light)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-main)',
                }}
              />
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Bạn sẽ nhận cảnh báo khi chi tiêu vượt quá mức này.
              </p>
            </div>

            <button
              onClick={handleSaveBudget}
              disabled={!hasChanges.budget}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
              }}
            >
              <i className="fa-solid fa-check" />
              Lưu Ngân Sách
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
