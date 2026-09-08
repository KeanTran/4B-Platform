'use client';

import { useState, useEffect } from 'react';
import { formatVND } from '@/lib/split';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';
import { toast } from 'sonner';

// Mock data for initial state
const MOCK_MEMBERS = [
  { id: '1', name: 'Minh Tuấn (Trưởng phòng)', paid: true, amount: 1200000, role: 'owner' as const },
  { id: '2', name: 'Thành viên 1', paid: false, amount: 1200000, role: 'member' as const },
  { id: '3', name: 'Thành viên 2', paid: false, amount: 1200000, role: 'member' as const },
  { id: '4', name: 'Thành viên 3', paid: false, amount: 1200000, role: 'member' as const },
];

const BANK_CODE_MAP: Record<string, string> = {
  Vietcombank: '970436',
  BIDV: '970418',
  VietinBank: '970415',
  Agribank: '970405',
  TPBank: '970423',
  MBBank: '970426',
  VPBank: '970432',
  ACB: '970416',
  Sacombank: '970403',
  Techcombank: '970407',
};

export default function DashboardPage() {
  const { members, setMembers, expenses, removeMember, bankSetting, currentRoom } = useAppStore();
  const { openModal } = useUIStore();

  const [memberFilter, setMemberFilter] = useState('all');
  const [memberSort, setMemberSort] = useState('default');

  // Initialize with mock data if empty
  useEffect(() => {
    if (members.length === 0) {
      setMembers(MOCK_MEMBERS.map((m, i) => ({
        id: m.id,
        room_id: 'room-1',
        user_id: `user-${i}`,
        nickname: m.name,
        role: m.role,
        joined_at: new Date().toISOString(),
      })));
    }
  }, [members.length, setMembers]);

  // Calculate totals from expenses
  const totalBill = expenses.reduce((sum, e) => sum + e.amount, 0) || 4800000;
  const paidAmount = expenses
    .filter((e) => e.status === 'paid')
    .reduce((sum, e) => sum + e.amount, 0) || 1200000;
  const pendingAmount = totalBill - paidAmount;

  // Use members from store with payment status
  const membersWithPayment = members.map((m, i) => ({
    ...m,
    paid: i === 0, // First member paid for demo
    amount: Math.floor(totalBill / members.length) || 1200000,
  }));

  // Filter and sort members
  let filteredMembers = [...membersWithPayment];
  if (memberFilter === 'paid') {
    filteredMembers = filteredMembers.filter((m) => m.paid);
  } else if (memberFilter === 'pending') {
    filteredMembers = filteredMembers.filter((m) => !m.paid);
  }

  if (memberSort === 'name-asc') {
    filteredMembers.sort((a, b) => (a.nickname || '').localeCompare(b.nickname || ''));
  } else if (memberSort === 'name-desc') {
    filteredMembers.sort((a, b) => (b.nickname || '').localeCompare(a.nickname || ''));
  }

  const paidCount = membersWithPayment.filter((m) => m.paid).length;
  const pendingCount = membersWithPayment.filter((m) => !m.paid).length;

  const handleReset = () => {
    setMemberFilter('all');
    setMemberSort('default');
  };

  const handleEditMember = (member: typeof membersWithPayment[0]) => {
    openModal('edit-member', { member });
  };

  const handleOpenQR = () => {
    openModal('qr-code', {
      members: membersWithPayment.map((m) => ({
        id: m.id,
        name: m.nickname || 'Thành viên',
        amount: m.amount,
      })),
    });
  };

  const handleAddMember = () => {
    openModal('add-member');
  };

  const handleRemoveMember = (member: typeof membersWithPayment[0]) => {
    if (member.role === 'owner') {
      toast.error('Không thể xóa trưởng phòng!');
      return;
    }
    if (window.confirm(`Bạn có chắc muốn xóa "${member.nickname}" khỏi phòng?`)) {
      removeMember(member.id);
      toast.success(`Đã xóa "${member.nickname}" khỏi phòng`);
    }
  };

  // Dynamic bank and QR details from settings
  const bankDisplayName = bankSetting?.bank_name || 'MBBank';
  const bankAccountNumber = bankSetting?.account_number || '090xxx888';
  const bankAccountHolder = bankSetting?.account_name || 'Minh Tuấn';
  const roomNameClean = (currentRoom?.name || 'Phòng 302').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'PHONG302';
  const transferContent = `4B ${roomNameClean} DONGTIEN`;
  const bankBin = bankSetting?.bank_bin || BANK_CODE_MAP[bankDisplayName] || '970426';
  const qrAmount = membersWithPayment[0]?.amount || 1200000;

  const qrImageUrl = bankSetting
    ? `https://img.vietqr.io/image/${bankBin}-${bankAccountNumber}-compact2.png?amount=${qrAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankAccountHolder)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=4B_${roomNameClean}_${qrAmount}`;

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `VietQR_${roomNameClean}.png`;
    link.target = '_blank';
    link.click();
    toast.success('Đang tải mã QR...');
  };

  const handleShareQR = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Mã VietQR ${currentRoom?.name || 'Phòng 302'}`,
          text: `Chuyển khoản đóng tiền phòng: ${bankDisplayName} - ${bankAccountNumber} (${bankAccountHolder})\nNội dung: ${transferContent}`,
          url: qrImageUrl,
        });
        toast.success('Chia sẻ thành công!');
      } catch {
        // User cancelled
      }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(
        `Ngân hàng: ${bankDisplayName}\nSTK: ${bankAccountNumber}\nChủ TK: ${bankAccountHolder}\nNội dung: ${transferContent}`
      );
      toast.success('Đã sao chép thông tin chuyển khoản vào clipboard!');
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab content - Overview */}
      <div id="tab-overview" className="tab-content active">
        {/* Stats Grid - 3 cards */}
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          {/* Card 1: Tổng hóa đơn */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Tổng hóa đơn tháng này
            </div>
            <div className="brand-font mb-2 text-2xl font-extrabold" style={{ color: 'var(--primary)' }}>
              {formatVND(totalBill)}
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
            >
              <i className="fa-solid fa-check text-[10px]" />
              Đã tự động phân bổ
            </span>
          </div>

          {/* Card 2: Đã thu hồi */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Đã thu hồi
            </div>
            <div className="brand-font mb-2 text-2xl font-extrabold" style={{ color: 'var(--dark)' }}>
              {formatVND(paidAmount)}
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
            >
              <i className="fa-solid fa-check text-[10px]" />
              {paidCount} thành viên đã đóng
            </span>
          </div>

          {/* Card 3: Còn tồn đọng */}
          <div
            className="rounded-2xl border p-5"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Còn tồn đọng (cần thu)
            </div>
            <div className="brand-font mb-2 text-2xl font-extrabold" style={{ color: 'var(--danger)' }}>
              {formatVND(pendingAmount)}
            </div>
            <span
              className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{ background: 'var(--color-bg-warning-soft)', color: 'var(--danger)' }}
            >
              <i className="fa-solid fa-clock text-[10px]" />
              {pendingCount} thành viên chưa đóng
            </span>
          </div>
        </div>

        {/* 2-column grid */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: Member table */}
          <div
            className="rounded-2xl border"
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
                <i className="fa-solid fa-users text-sm" style={{ color: 'var(--primary)' }} />
                <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                  Danh Sách Thành Viên Phòng
                </span>
              </div>
              <button
                onClick={handleAddMember}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <i className="fa-solid fa-user-plus mr-1" />
                Thêm thành viên
              </button>
            </div>

            {/* Filter & Sort Bar */}
            <div
              className="flex flex-wrap items-center gap-2 border-b px-4 py-2.5"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
            >
              <label className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Lọc:
              </label>
              <select
                value={memberFilter}
                onChange={(e) => setMemberFilter(e.target.value)}
                className="rounded-lg border px-2 py-1 text-xs"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-main)',
                }}
              >
                <option value="all">Tất cả</option>
                <option value="paid">Đã đóng</option>
                <option value="pending">Chưa đóng</option>
              </select>

              <label className="ml-2 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                Sắp xếp:
              </label>
              <select
                value={memberSort}
                onChange={(e) => setMemberSort(e.target.value)}
                className="rounded-lg border px-2 py-1 text-xs"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-main)',
                }}
              >
                <option value="default">Mặc định</option>
                <option value="name-asc">Tên A → Z</option>
                <option value="name-desc">Tên Z → A</option>
                <option value="amount-asc">Số tiền ↑</option>
                <option value="amount-desc">Số tiền ↓</option>
              </select>

              <button
                onClick={handleReset}
                className="ml-auto rounded-full border px-3 py-1 text-xs font-semibold transition-colors hover:bg-[var(--color-bg-soft-primary)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-rotate-left mr-1" />
                Reset
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className="border-b text-left text-xs font-semibold"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    <th className="px-4 py-2.5">Thành Viên</th>
                    <th className="px-4 py-2.5">Cần Đóng</th>
                    <th className="px-4 py-2.5">Trạng Thái</th>
                    <th className="px-4 py-2.5">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b text-sm transition-colors hover:bg-[var(--bg-light)]"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ background: member.paid ? 'var(--primary)' : 'var(--accent)' }}
                          >
                            {(member.nickname || 'T').charAt(0)}
                          </div>
                          <span style={{ color: 'var(--dark)' }}>{member.nickname}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--dark)' }}>
                        {formatVND(member.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {member.paid ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}
                          >
                            <i className="fa-solid fa-check text-[10px]" />
                            Đã đóng
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{ background: 'var(--color-bg-warning-soft)', color: 'var(--danger)' }}
                          >
                            <i className="fa-solid fa-clock text-[10px]" />
                            Chưa đóng
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="rounded-lg p-1.5 text-xs transition-colors hover:bg-[var(--color-bg-soft-primary)]"
                            style={{ color: 'var(--text-muted)' }}
                            title="Chỉnh sửa"
                          >
                            <i className="fa-solid fa-pen-to-square" />
                          </button>
                          <button
                            onClick={handleOpenQR}
                            className="rounded-lg p-1.5 text-xs transition-colors hover:bg-[var(--color-bg-soft-primary)]"
                            style={{ color: 'var(--primary)' }}
                            title="Tạo mã QR"
                          >
                            <i className="fa-solid fa-qrcode" />
                          </button>
                          {member.role !== 'owner' && (
                            <button
                              onClick={() => handleRemoveMember(member)}
                              className="rounded-lg p-1.5 text-xs transition-colors hover:bg-[var(--color-bg-warning-soft)]"
                              style={{ color: 'var(--danger)' }}
                              title="Xóa thành viên"
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: VietQR Card */}
          <div
            className="rounded-2xl border p-5 text-center"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-3 flex items-center justify-center gap-2">
              <i className="fa-solid fa-qrcode text-sm" style={{ color: 'var(--primary)' }} />
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                Mã VietQR Chuyển Khoản 1-Chạm
              </span>
            </div>
            <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              Mã QR khớp chính xác số tiền cần trả cho từng cá nhân
            </p>

            {/* QR Code Image */}
            <div
              className="mx-auto mb-4 inline-flex items-center justify-center rounded-xl p-4"
              style={{ background: 'white' }}
            >
              <img
                src={qrImageUrl}
                alt="VietQR"
                className="h-[150px] w-[150px] object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=4B_${roomNameClean}_${qrAmount}`;
                }}
              />
            </div>

            {/* QR Meta Info */}
            <div className="space-y-1 text-sm" style={{ color: 'var(--dark)' }}>
              <div>
                Ngân hàng: <strong>{bankDisplayName} - {bankAccountNumber}</strong>
              </div>
              <div>
                Chủ TK: <strong>{bankAccountHolder}</strong>
              </div>
              <div
                className="mx-auto mt-2 inline-block rounded-lg px-3 py-1.5 text-xs"
                style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary-dark)' }}
              >
                Nội dung: <strong>{transferContent}</strong>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={handleOpenQR}
                className="rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:bg-[var(--bg-light)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <i className="fa-solid fa-user-plus mr-1" />
                QR Cá Nhân
              </button>
              <button
                onClick={handleDownloadQR}
                className="rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:bg-[var(--bg-light)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <i className="fa-solid fa-download mr-1" />
                Tải QR
              </button>
              <button
                onClick={handleShareQR}
                className="rounded-lg border px-4 py-2 text-xs font-semibold transition-colors hover:bg-[var(--bg-light)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <i className="fa-solid fa-share mr-1" />
                Chia sẻ
              </button>
            </div>
          </div>
        </div>

        {/* Alert Warning */}
        <div
          className="mt-5 rounded-xl border p-4"
          style={{
            background: 'var(--color-bg-warning-soft)',
            borderColor: 'var(--color-border-warning-soft)',
          }}
        >
          <strong className="text-sm" style={{ color: 'var(--danger)' }}>
            Cảnh Báo Chi Phí: Tiền điện tháng này tăng quá 20%!
          </strong>
          <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
            Tiền điện tháng 8 (1,200,000đ) tăng đột biến so với trung bình 3 tháng trước (950,000đ).
            Vui lòng kiểm tra lại thiết bị điện.
          </p>
        </div>
      </div>
    </div>
  );
}
