'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAY_FULL_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

interface DutyItem {
  id: string;
  dayOfWeek: number; // 0=T2, 1=T3, ..., 6=CN
  member: string;
  task: string;
  status: 'done' | 'pending';
}

const INITIAL_DUTIES: DutyItem[] = [
  { id: '1', dayOfWeek: 0, member: 'Minh Tuấn', task: 'Quét nhà', status: 'done' },
  { id: '2', dayOfWeek: 0, member: 'Thành viên 1', task: 'Lau sàn', status: 'done' },
  { id: '3', dayOfWeek: 1, member: 'Thành viên 2', task: 'Rửa bát', status: 'done' },
  { id: '4', dayOfWeek: 2, member: 'Thành viên 3', task: 'Nấu cơm', status: 'pending' },
  { id: '5', dayOfWeek: 3, member: 'Minh Tuấn', task: 'Giặt quần áo', status: 'pending' },
  { id: '6', dayOfWeek: 4, member: 'Thành viên 1', task: 'Mua đồ ăn', status: 'pending' },
  { id: '7', dayOfWeek: 5, member: 'Thành viên 2', task: 'Dọn nhà vệ sinh', status: 'pending' },
  { id: '8', dayOfWeek: 6, member: 'Thành viên 3', task: 'Nấu cơm', status: 'pending' },
];

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

export default function DutiesPage() {
  const { members } = useAppStore();
  const { openModal, modalOpen, modalData, closeModal } = useUIStore();

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [duties, setDuties] = useState<DutyItem[]>(INITIAL_DUTIES);

  // Initialize mock members if empty
  useEffect(() => {
    if (members.length === 0) {
      const mockMembers = [
        { id: '1', room_id: 'room-1', user_id: 'user-1', nickname: 'Minh Tuấn', role: 'owner' as const, joined_at: new Date().toISOString() },
        { id: '2', room_id: 'room-1', user_id: 'user-2', nickname: 'Thành viên 1', role: 'member' as const, joined_at: new Date().toISOString() },
        { id: '3', room_id: 'room-1', user_id: 'user-3', nickname: 'Thành viên 2', role: 'member' as const, joined_at: new Date().toISOString() },
        { id: '4', room_id: 'room-1', user_id: 'user-4', nickname: 'Thành viên 3', role: 'member' as const, joined_at: new Date().toISOString() },
      ];
      mockMembers.forEach(m => {
        useAppStore.getState().addMember(m as any);
      });
    }
  }, [members.length]);

  const getDutiesForDay = (dayOfWeek: number) => {
    return duties.filter((d) => d.dayOfWeek === dayOfWeek);
  };

  const handleRotateDuty = () => {
    const memberNames = members.map((m) => m.nickname || 'Thành viên');
    if (memberNames.length === 0) {
      toast.error('Cần có thành viên trong phòng để xoay vòng');
      return;
    }

    const rotatedDuties: DutyItem[] = duties.map((duty) => {
      const currentIndex = memberNames.indexOf(duty.member);
      const nextIndex = (currentIndex + 1) % memberNames.length;
      const nextMember = memberNames[nextIndex] || 'Thành viên';
      return {
        ...duty,
        member: nextMember,
      };
    });

    setDuties(rotatedDuties);
    toast.success('Đã xoay vòng lịch trực nhật!');
  };

  const handleAddDuty = () => {
    openModal('add-duty');
  };

  // Listen for add-duty modal submission
  // We use a custom callback approach: when modal closes with data, we add the duty
  const handleAddDutySubmit = useCallback((task: string, memberId: string, dayOfWeek: number) => {
    const member = members.find(m => m.id === memberId);
    const newDuty: DutyItem = {
      id: Math.random().toString(36).substring(7),
      dayOfWeek,
      member: member?.nickname || 'Thành viên',
      task,
      status: 'pending',
    };
    setDuties(prev => [...prev, newDuty]);
    toast.success('Đã thêm nhiệm vụ thành công!');
  }, [members]);

  // Expose the callback via a global ref so AddDutyModal can call it
  useEffect(() => {
    (window as any).__addDutyCallback = handleAddDutySubmit;
    return () => {
      delete (window as any).__addDutyCallback;
    };
  }, [handleAddDutySubmit]);

  const handleToggleDutyStatus = (dutyId: string) => {
    setDuties((prev) =>
      prev.map((d) =>
        d.id === dutyId
          ? { ...d, status: d.status === 'done' ? 'pending' : 'done' }
          : d
      )
    );
    toast.success('Đã cập nhật trạng thái!');
  };

  const handleDeleteDuty = (dutyId: string) => {
    setDuties((prev) => prev.filter((d) => d.id !== dutyId));
    toast.success('Đã xóa nhiệm vụ!');
  };

  const prevWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() - 7);
    setCurrentWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + 7);
    setCurrentWeekStart(d);
  };

  const goToThisWeek = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  // Get date for each day of the week
  const getDateForDay = (dayIndex: number): Date => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + dayIndex);
    return d;
  };

  const today = new Date();
  const isThisWeek = getMonday(today).getTime() === currentWeekStart.getTime();

  // Get week range display
  const weekEnd = new Date(currentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekRangeText = `${formatDate(currentWeekStart)} - ${formatDate(weekEnd)}`;

  return (
    <div className="space-y-5">
      {/* Tab Lịch Trực Nhật */}
      <div id="tab-duty">
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
            className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-broom text-lg" style={{ color: 'var(--accent)' }} />
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                Phân Công Lịch Trực Nhật Xoay Vòng
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRotateDuty}
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-light)]"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-main)',
                }}
              >
                <i className="fa-solid fa-rotate mr-1" />
                Xoay Vòng
              </button>
              <button
                onClick={handleAddDuty}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <i className="fa-solid fa-plus mr-1" />
                Thêm
              </button>
            </div>
          </div>

          {/* Week Navigation */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
          >
            <button
              onClick={prevWeek}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--surface)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              <i className="fa-solid fa-chevron-left mr-1" />
              Tuần trước
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold" style={{ color: 'var(--dark)' }}>
                {weekRangeText}
              </span>
              {!isThisWeek && (
                <button
                  onClick={goToThisWeek}
                  className="rounded-full px-2 py-0.5 text-xs font-medium transition-colors hover:bg-[var(--color-bg-soft-primary)]"
                  style={{ color: 'var(--primary)' }}
                >
                  Hôm nay
                </button>
              )}
            </div>
            <button
              onClick={nextWeek}
              className="rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--surface)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              Tuần sau
              <i className="fa-solid fa-chevron-right ml-1" />
            </button>
          </div>

          {/* Info Alert */}
          <div
            className="mx-4 mt-4 flex items-center gap-2 rounded-xl p-3 text-xs"
            style={{
              background: 'var(--color-bg-soft-primary)',
              color: 'var(--text-muted)',
            }}
          >
            <i className="fa-solid fa-info-circle" style={{ color: 'var(--primary)' }} />
            Click vào công việc để đánh dấu hoàn thành. Nhấn nút &quot;Xoay Vòng&quot; để tự động đổi người.
          </div>

          {/* Weekly Grid - 7 columns */}
          <div
            className="grid gap-3 p-4"
            style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
          >
            {DAY_LABELS.map((label, dayIndex) => {
              const dayDuties = getDutiesForDay(dayIndex);
              const dayDate = getDateForDay(dayIndex);
              const isToday = isThisWeek && today.getDay() === (dayIndex === 6 ? 0 : dayIndex + 1);

              return (
                <div
                  key={dayIndex}
                  className={`min-h-[200px] rounded-xl border p-2.5 transition-all ${
                    isToday ? 'ring-2 ring-[var(--primary)]' : ''
                  }`}
                  style={
                    isToday
                      ? {
                          borderColor: 'var(--primary)',
                          background: 'var(--color-bg-soft-primary)',
                        }
                      : {
                          borderColor: 'var(--border)',
                          background: 'var(--bg-light)',
                        }
                  }
                >
                  {/* Day Header */}
                  <div className="mb-2 text-center">
                    <div
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isToday ? '' : ''
                      }`}
                      style={{ color: isToday ? 'var(--primary)' : 'var(--text-muted)' }}
                    >
                      {label}
                    </div>
                    <div
                      className={`mt-0.5 text-lg font-bold ${
                        isToday
                          ? 'mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white text-sm'
                          : ''
                      }`}
                      style={isToday ? {} : { color: 'var(--dark)' }}
                    >
                      {dayDate.getDate()}
                    </div>
                    <div className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {formatDate(dayDate)}
                    </div>
                  </div>

                  {/* Duty Count Badge */}
                  {dayDuties.length > 0 && (
                    <div className="mb-2 flex justify-center">
                      <span
                        className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                        style={{
                          background:
                            dayDuties.every((d) => d.status === 'done')
                              ? 'var(--color-bg-soft-primary)'
                              : 'var(--accent-light)',
                          color:
                            dayDuties.every((d) => d.status === 'done')
                              ? 'var(--primary)'
                              : 'var(--accent)',
                        }}
                      >
                        {dayDuties.length} việc
                      </span>
                    </div>
                  )}

                  {/* Duties */}
                  <div className="space-y-1.5">
                    {dayDuties.map((duty) => (
                      <div
                        key={duty.id}
                        className="group relative rounded-lg border p-1.5 text-xs transition-colors"
                        style={
                          duty.status === 'done'
                            ? {
                                borderColor: 'var(--color-border-soft-primary)',
                                background: 'var(--color-bg-soft-primary)',
                              }
                            : {
                                borderColor: 'var(--accent-light)',
                                background: 'white',
                              }
                        }
                      >
                        <button
                          onClick={() => handleToggleDutyStatus(duty.id)}
                          className="w-full text-left"
                        >
                          <div className="mb-0.5 flex items-center gap-1">
                            {duty.status === 'done' ? (
                              <i className="fa-solid fa-check text-[8px]" style={{ color: 'var(--primary)' }} />
                            ) : (
                              <i className="fa-solid fa-clock text-[8px]" style={{ color: 'var(--accent)' }} />
                            )}
                            <span
                              className="truncate font-semibold"
                              style={{ color: 'var(--dark)' }}
                            >
                              {duty.task}
                            </span>
                          </div>
                          <div className="truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {duty.member}
                          </div>
                        </button>
                        {/* Delete button (visible on hover) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteDuty(duty.id); }}
                          className="absolute -right-1 -top-1 hidden h-4 w-4 items-center justify-center rounded-full text-white group-hover:flex"
                          style={{ background: 'var(--danger)', fontSize: '8px' }}
                          title="Xóa"
                        >
                          <i className="fa-solid fa-times" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Empty state */}
                  {dayDuties.length === 0 && (
                    <div className="flex h-16 items-center justify-center">
                      <span className="text-xs" style={{ color: 'var(--border)' }}>
                        Trống
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div
            className="mx-4 mb-4 flex items-center justify-between rounded-xl border p-3"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-light)' }}
          >
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>
                <i className="fa-solid fa-list-check mr-1" style={{ color: 'var(--primary)' }} />
                Tổng: <strong>{duties.length}</strong> việc
              </span>
              <span>
                <i className="fa-solid fa-check mr-1" style={{ color: 'var(--primary)' }} />
                Hoàn thành: <strong>{duties.filter(d => d.status === 'done').length}</strong>
              </span>
              <span>
                <i className="fa-solid fa-clock mr-1" style={{ color: 'var(--accent)' }} />
                Chưa làm: <strong>{duties.filter(d => d.status === 'pending').length}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
