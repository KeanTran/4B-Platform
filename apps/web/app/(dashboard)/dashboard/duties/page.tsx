'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';
import type { RoomMember } from '@/types';

const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAY_FULL_LABELS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

interface DutyItem {
  id: string;
  dayOfWeek: number; // 0=T2, 1=T3, ..., 6=CN
  memberId?: string;
  member: string;
  task: string;
  status: 'done' | 'pending';
}

function generateDefaultDuties(membersList: RoomMember[]): DutyItem[] {
  const defaultTasks = [
    { dayOfWeek: 0, task: 'Quét nhà', status: 'done' as const },
    { dayOfWeek: 0, task: 'Lau sàn', status: 'done' as const },
    { dayOfWeek: 1, task: 'Rửa bát', status: 'done' as const },
    { dayOfWeek: 2, task: 'Nấu cơm', status: 'pending' as const },
    { dayOfWeek: 3, task: 'Giặt quần áo', status: 'pending' as const },
    { dayOfWeek: 4, task: 'Mua đồ ăn', status: 'pending' as const },
    { dayOfWeek: 5, task: 'Dọn nhà vệ sinh', status: 'pending' as const },
    { dayOfWeek: 6, task: 'Nấu cơm', status: 'pending' as const },
  ];

  if (membersList.length === 0) {
    return defaultTasks.map((t, idx) => ({
      id: `duty-${idx + 1}`,
      dayOfWeek: t.dayOfWeek,
      member: 'Thành viên',
      task: t.task,
      status: t.status,
    }));
  }

  return defaultTasks.map((t, idx) => {
    const mem = membersList[idx % membersList.length];
    return {
      id: `duty-${idx + 1}`,
      dayOfWeek: t.dayOfWeek,
      memberId: mem?.id || '1',
      member: mem?.nickname || 'Thành viên',
      task: t.task,
      status: t.status,
    };
  });
}

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
  const { members, user, setMembers } = useAppStore();
  const { openModal } = useUIStore();

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => getMonday(new Date()));

  // Compute owner name based on logged-in user to match Tổng quan
  const ownerDisplayName = useMemo(() => {
    if (user?.full_name?.trim()) return user.full_name.trim();
    if (user?.email) return user.email.split('@')[0];
    return 'Trưởng phòng';
  }, [user]);

  // Initialize members if empty to match Tổng quan
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

  const [duties, setDuties] = useState<DutyItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('4b_duties');
        if (saved) {
          return JSON.parse(saved);
        }
      } catch (e) {}
    }
    return [];
  });

  // Dynamic helper to resolve the up-to-date member name for any duty
  const getDutyMemberName = useCallback(
    (duty: DutyItem): string => {
      if (duty.memberId) {
        const m = members.find((mem) => mem.id === duty.memberId);
        if (m?.nickname) return m.nickname;
      }
      // If legacy duty had "Minh Tuấn", map to current room owner
      if (duty.member === 'Minh Tuấn' || duty.member?.includes('Trưởng phòng')) {
        const owner = members.find((m) => m.role === 'owner') || members[0];
        if (owner?.nickname) return owner.nickname;
      }
      // If duty has member name that matches a current member
      const matched = members.find((m) => m.nickname === duty.member);
      if (matched?.nickname) return matched.nickname;

      return duty.member || members[0]?.nickname || 'Thành viên';
    },
    [members]
  );

  // Sync duties whenever members list from Tổng quan changes or initialize duties
  useEffect(() => {
    if (members.length === 0) return;

    setDuties((prevDuties) => {
      if (prevDuties.length === 0) {
        const initial = generateDefaultDuties(members);
        try {
          localStorage.setItem('4b_duties', JSON.stringify(initial));
        } catch (e) {}
        return initial;
      }

      // Check if duties need update (e.g. legacy "Minh Tuấn" or name change)
      const needsSync = prevDuties.some((d) => {
        if (d.member === 'Minh Tuấn') return true;
        if (d.memberId) {
          const found = members.find((m) => m.id === d.memberId);
          return found && found.nickname !== d.member;
        }
        return false;
      });

      if (!needsSync) return prevDuties;

      const updated = prevDuties.map((d, index) => {
        let targetMember = d.memberId ? members.find((m) => m.id === d.memberId) : null;
        if (!targetMember) {
          if (d.member === 'Minh Tuấn' || d.member?.includes('Trưởng phòng')) {
            targetMember = members.find((m) => m.role === 'owner') || members[0];
          } else {
            targetMember = members.find((m) => m.nickname === d.member) || members[index % members.length];
          }
        }

        return {
          ...d,
          memberId: targetMember?.id || d.memberId,
          member: targetMember?.nickname || d.member || 'Thành viên',
        };
      });

      try {
        localStorage.setItem('4b_duties', JSON.stringify(updated));
      } catch (e) {}

      return updated;
    });
  }, [members]);

  const getDutiesForDay = (dayOfWeek: number) => {
    return duties.filter((d) => d.dayOfWeek === dayOfWeek);
  };

  const handleRotateDuty = () => {
    if (members.length === 0) {
      toast.error('Cần có thành viên trong phòng để xoay vòng');
      return;
    }

    const rotatedDuties: DutyItem[] = duties.map((duty) => {
      let currentIndex = -1;
      if (duty.memberId) {
        currentIndex = members.findIndex((m) => m.id === duty.memberId);
      }
      if (currentIndex === -1 && duty.member) {
        currentIndex = members.findIndex((m) => m.nickname === duty.member);
      }
      if (currentIndex === -1 && (duty.member === 'Minh Tuấn' || duty.member?.includes('Trưởng phòng'))) {
        currentIndex = 0;
      }
      if (currentIndex === -1) {
        currentIndex = 0;
      }

      const nextIndex = (currentIndex + 1) % members.length;
      const nextMember = members[nextIndex] || members[0];

      return {
        ...duty,
        memberId: nextMember?.id || duty.memberId,
        member: nextMember?.nickname || 'Thành viên',
      };
    });

    setDuties(rotatedDuties);
    try {
      localStorage.setItem('4b_duties', JSON.stringify(rotatedDuties));
    } catch (e) {}
    toast.success('Đã xoay vòng lịch trực nhật!');
  };

  const handleAddDuty = () => {
    openModal('add-duty');
  };

  // Listen for add-duty modal submission
  const handleAddDutySubmit = useCallback((task: string, memberId: string, dayOfWeek: number) => {
    const member = members.find(m => m.id === memberId);
    const newDuty: DutyItem = {
      id: Math.random().toString(36).substring(7),
      dayOfWeek,
      memberId,
      member: member?.nickname || 'Thành viên',
      task,
      status: 'pending',
    };
    setDuties(prev => {
      const updated = [...prev, newDuty];
      try {
        localStorage.setItem('4b_duties', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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
    setDuties((prev) => {
      const updated = prev.map((d) =>
        d.id === dutyId
          ? { ...d, status: d.status === 'done' ? ('pending' as const) : ('done' as const) }
          : d
      );
      try {
        localStorage.setItem('4b_duties', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    toast.success('Đã cập nhật trạng thái!');
  };

  const handleDeleteDuty = (dutyId: string) => {
    setDuties((prev) => {
      const updated = prev.filter((d) => d.id !== dutyId);
      try {
        localStorage.setItem('4b_duties', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
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
                            {getDutyMemberName(duty)}
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
