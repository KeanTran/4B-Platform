'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { formatVND } from '@/lib/split';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';
import { toast } from 'sonner';

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
  const {
    members,
    setMembers,
    expenses,
    removeMember,
    bankSetting,
    currentRoom,
    user,
    memberPayments,
    toggleMemberPayment,
  } = useAppStore();
  const { openModal, addNotification } = useUIStore();

  const [memberFilter, setMemberFilter] = useState('all');
  const [memberSort, setMemberSort] = useState('default');

  // Compute owner name based on logged-in user
  const ownerDisplayName = useMemo(() => {
    if (user?.full_name?.trim()) return user.full_name.trim();
    if (user?.email) return user.email.split('@')[0];
    return 'Trưởng phòng';
  }, [user]);

  // Initialize members if empty
  useEffect(() => {
    if (members.length === 0) {
      setMembers([
        {
          id: '1',
          room_id: 'room-1',
          user_id: user?.id || 'user-0',
          nickname: `${ownerDisplayName} (Trưởng phòng)`,
          role: 'owner',
          joined_at: new Date().toISOString(),
        },
        {
          id: '2',
          room_id: 'room-1',
          user_id: 'user-1',
          nickname: 'Thành viên 1',
          role: 'member',
          joined_at: new Date().toISOString(),
        },
        {
          id: '3',
          room_id: 'room-1',
          user_id: 'user-2',
          nickname: 'Thành viên 2',
          role: 'member',
          joined_at: new Date().toISOString(),
        },
        {
          id: '4',
          room_id: 'room-1',
          user_id: 'user-3',
          nickname: 'Thành viên 3',
          role: 'member',
          joined_at: new Date().toISOString(),
        },
      ]);
    }
  }, [members.length, setMembers, ownerDisplayName, user?.id]);

  // Sync owner name to member list whenever user changes
  useEffect(() => {
    if (members.length > 0 && user?.full_name) {
      const ownerMember = members.find((m) => m.role === 'owner');
      const expectedNickname = `${ownerDisplayName} (Trưởng phòng)`;
      if (ownerMember && ownerMember.nickname !== expectedNickname) {
        useAppStore.getState().updateMember(ownerMember.id, { nickname: expectedNickname });
      }
    }
  }, [ownerDisplayName, members, user?.full_name]);

  // Calculate real total from expenses (NO mock fallback)
  const totalBill = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  // Calculate allocated amount for each member based on real expenses
  const getMemberAmount = (memberId: string): number => {
    if (expenses.length === 0 || members.length === 0) return 0;

    let total = 0;
    expenses.forEach((expense) => {
      if (expense.allocations && expense.allocations.length > 0) {
        const alloc = expense.allocations.find((a) => a.member_id === memberId);
        if (alloc) {
          total += alloc.amount;
        } else {
          total += Math.floor(expense.amount / members.length);
        }
      } else {
        total += Math.floor(expense.amount / members.length);
      }
    });
    return total;
  };

  // Build members list with dynamic name, computed amount, and payment status
  const membersWithPayment = useMemo(() => {
    return members.map((m) => {
      const isOwner = m.role === 'owner';
      const displayName = isOwner ? `${ownerDisplayName} (Trưởng phòng)` : (m.nickname || 'Thành viên');
      const paid = !!memberPayments[m.id];
      const amount = getMemberAmount(m.id);

      return {
        ...m,
        nickname: displayName,
        paid,
        amount,
      };
    });
  }, [members, ownerDisplayName, memberPayments, expenses]);

  // Real paid & pending calculations
  const paidMembers = membersWithPayment.filter((m) => m.paid);
  const pendingMembers = membersWithPayment.filter((m) => !m.paid);

  const paidCount = paidMembers.length;
  const pendingCount = pendingMembers.length;

  const paidAmount = paidMembers.reduce((sum, m) => sum + m.amount, 0);
  const pendingAmount = totalBill > paidAmount ? totalBill - paidAmount : 0;

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
  } else if (memberSort === 'amount-asc') {
    filteredMembers.sort((a, b) => a.amount - b.amount);
  } else if (memberSort === 'amount-desc') {
    filteredMembers.sort((a, b) => b.amount - a.amount);
  }

  const handleTogglePayment = (memberId: string, currentStatus: boolean, memberName: string) => {
    toggleMemberPayment(memberId);
    const newStatus = !currentStatus;
    toast.success(
      newStatus
        ? `Đã xác nhận ${memberName} đã đóng tiền!`
        : `Đã chuyển ${memberName} sang trạng thái chưa đóng.`
    );
  };

  const handleReset = () => {
    setMemberFilter('all');
    setMemberSort('default');
    setMembers([
      {
        id: '1',
        room_id: 'room-1',
        user_id: user?.id || 'user-0',
        nickname: `${ownerDisplayName} (Trưởng phòng)`,
        role: 'owner',
        joined_at: new Date().toISOString(),
      },
      {
        id: '2',
        room_id: 'room-1',
        user_id: 'user-1',
        nickname: 'Thành viên 1',
        role: 'member',
        joined_at: new Date().toISOString(),
      },
      {
        id: '3',
        room_id: 'room-1',
        user_id: 'user-2',
        nickname: 'Thành viên 2',
        role: 'member',
        joined_at: new Date().toISOString(),
      },
      {
        id: '4',
        room_id: 'room-1',
        user_id: 'user-3',
        nickname: 'Thành viên 3',
        role: 'member',
        joined_at: new Date().toISOString(),
      },
    ]);
    useAppStore.setState({ memberPayments: {} });
    addNotification({
      type: 'system',
      title: 'Đặt lại thành viên',
      message: 'Danh sách thành viên và trạng thái đóng tiền đã được khôi phục về ban đầu.',
    });
    toast.success('Đã đặt lại danh sách thành viên!');
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
      addNotification({
        type: 'system',
        title: 'Xóa thành viên',
        message: `"${member.nickname}" đã được xóa khỏi phòng.`,
      });
      toast.success(`Đã xóa "${member.nickname}" khỏi phòng`);
    }
  };

  // Dynamic bank and QR details from settings
  const bankDisplayName = bankSetting?.bank_name || 'MBBank';
  const bankAccountNumber = bankSetting?.account_number || '090xxx888';
  const bankAccountHolder = bankSetting?.account_name || ownerDisplayName;
  const roomNameClean = (currentRoom?.name || 'Phòng 302').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'PHONG302';
  const transferContent = `4B ${roomNameClean} DONGTIEN`;
  const bankBin = bankSetting?.bank_bin || BANK_CODE_MAP[bankDisplayName] || '970426';
  const qrAmount = pendingMembers[0]?.amount || membersWithPayment[0]?.amount || 0;

  const qrImageUrl = bankSetting
    ? `https://img.vietqr.io/image/${bankBin}-${bankAccountNumber}-compact2.png?amount=${qrAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(bankAccountHolder || '')}`
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
        {/* Banner if no expenses exist yet */}
        {expenses.length === 0 && (
          <div
            className="mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm"
            style={{
              background: 'var(--color-bg-soft-primary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ background: 'var(--primary)' }}
              >
                <i className="fa-solid fa-calculator text-lg" />
              </div>
              <div>
                <h4 className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
                  Chưa có dữ liệu chi tiêu tháng này
                </h4>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Tạo các khoản tiền phòng, điện, nước tại <strong>Chia Tiền Nâng Cao</strong> để hệ thống tự động tính toán tổng quan.
                </p>
              </div>
            </div>
            <Link
              href="/dashboard/split"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--primary)' }}
            >
              <i className="fa-solid fa-plus" />
              Chia tiền ngay
            </Link>
          </div>
        )}

        {/* Stats Grid - 3 cards */}
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          {/* Card 1: Tổng hóa đơn */}
          <div
            className="rounded-2xl border p-5 transition-shadow hover:shadow-md"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Tổng hóa đơn tháng này
            </div>
            <div
              className="brand-font mb-2 text-2xl font-extrabold"
              style={{ color: totalBill > 0 ? 'var(--primary)' : 'var(--dark)' }}
            >
              {formatVND(totalBill)}
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                background: totalBill > 0 ? 'var(--color-bg-soft-primary)' : 'var(--bg-light)',
                color: totalBill > 0 ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              <i className={`fa-solid ${totalBill > 0 ? 'fa-check' : 'fa-info-circle'} text-[10px]`} />
              {totalBill > 0 ? `${expenses.length} khoản chi phí` : 'Chưa có khoản chi nào'}
            </span>
          </div>

          {/* Card 2: Đã thu hồi */}
          <div
            className="rounded-2xl border p-5 transition-shadow hover:shadow-md"
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
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                background: paidCount > 0 ? 'var(--color-bg-soft-primary)' : 'var(--bg-light)',
                color: paidCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              <i className="fa-solid fa-check text-[10px]" />
              {paidCount}/{membersWithPayment.length} thành viên đã đóng
            </span>
          </div>

          {/* Card 3: Còn tồn đọng */}
          <div
            className="rounded-2xl border p-5 transition-shadow hover:shadow-md"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Còn tồn đọng (cần thu)
            </div>
            <div
              className="brand-font mb-2 text-2xl font-extrabold"
              style={{ color: pendingAmount > 0 ? 'var(--danger)' : 'var(--text-muted)' }}
            >
              {formatVND(pendingAmount)}
            </div>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold"
              style={{
                background: pendingAmount > 0 ? 'var(--color-bg-warning-soft)' : 'var(--bg-light)',
                color: pendingAmount > 0 ? 'var(--danger)' : 'var(--text-muted)',
              }}
            >
              <i className={`fa-solid ${pendingAmount > 0 ? 'fa-clock' : 'fa-circle-check'} text-[10px]`} />
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
                <option value="all">Tất cả ({membersWithPayment.length})</option>
                <option value="paid">Đã đóng ({paidCount})</option>
                <option value="pending">Chưa đóng ({pendingCount})</option>
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
                            className="flex h-8 w-8 shrink-0 aspect-square min-w-[32px] min-h-[32px] items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                            style={{ background: member.paid ? 'var(--primary)' : 'var(--accent)' }}
                          >
                            {(member.nickname || 'T').charAt(0)}
                          </div>
                          <div>
                            <span className="font-medium" style={{ color: 'var(--dark)' }}>
                              {member.nickname}
                            </span>
                            {member.role === 'owner' && (
                              <span
                                className="ml-1.5 inline-block rounded-md px-1.5 py-0.2 text-[10px] font-bold text-white"
                                style={{ background: 'var(--primary)' }}
                              >
                                Chủ phòng
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold" style={{ color: 'var(--dark)' }}>
                        {formatVND(member.amount)}
                      </td>
                      <td className="px-4 py-3">
                        {/* Interactive toggle status button */}
                        <button
                          type="button"
                          onClick={() => handleTogglePayment(member.id, member.paid, member.nickname || 'Thành viên')}
                          className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all hover:scale-105 active:scale-95 shadow-sm"
                          style={{
                            background: member.paid ? 'var(--color-bg-soft-primary)' : 'var(--color-bg-warning-soft)',
                            color: member.paid ? 'var(--primary)' : 'var(--danger)',
                            border: `1px solid ${member.paid ? 'var(--primary)' : 'var(--danger)'}40`,
                          }}
                          title="Bấm để chuyển trạng thái Đã đóng / Chưa đóng"
                        >
                          {member.paid ? (
                            <>
                              <i className="fa-solid fa-check text-[10px]" />
                              Đã đóng
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-clock text-[10px]" />
                              Chưa đóng
                            </>
                          )}
                          <span className="opacity-0 group-hover:opacity-70 text-[9px] ml-0.5 transition-opacity">
                            (Đổi)
                          </span>
                        </button>
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
              {qrAmount > 0
                ? `Mã QR thanh toán chính xác: ${formatVND(qrAmount)}`
                : 'Mã QR khớp chính xác số tiền cần trả cho từng cá nhân'}
            </p>

            {/* QR Code Image */}
            <div
              className="mx-auto mb-4 inline-flex items-center justify-center rounded-2xl p-4 shadow-sm"
              style={{ background: 'white' }}
            >
              <img
                src={qrImageUrl}
                alt="VietQR"
                className="h-[210px] w-[210px] sm:h-[230px] sm:w-[230px] object-contain transition-transform hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=230x230&data=4B_${roomNameClean}_${qrAmount}`;
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

        {/* Alert Warning (only show when there are expenses and electricity is prominent) */}
        {expenses.length > 0 && (
          <div
            className="mt-5 rounded-xl border p-4"
            style={{
              background: 'var(--color-bg-soft-primary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-sm" style={{ color: 'var(--primary)' }} />
              <strong className="text-sm" style={{ color: 'var(--primary)' }}>
                Hệ thống 4B đang theo dõi chi phí phòng tự động
              </strong>
            </div>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Đã ghi nhận {expenses.length} khoản chi phí với tổng số tiền {formatVND(totalBill)}. Trạng thái thanh toán của từng thành viên được tự động đồng bộ theo thời gian thực.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
