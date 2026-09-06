'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';

const MOCK_DUTIES = [
  { id: '1', day: 1, member: 'Minh Tuấn', task: 'Quét nhà', status: 'done' as const },
  { id: '2', day: 1, member: 'Thành viên 1', task: 'Lau sàn', status: 'done' as const },
  { id: '3', day: 2, member: 'Thành viên 2', task: 'Rửa bát', status: 'done' as const },
  { id: '4', day: 3, member: 'Thành viên 3', task: 'Nấu cơm', status: 'pending' as const },
  { id: '5', day: 4, member: 'Minh Tuấn', task: 'Giặt quần áo', status: 'pending' as const },
  { id: '6', day: 5, member: 'Thành viên 1', task: 'Mua đồ ăn', status: 'pending' as const },
  { id: '7', day: 6, member: 'Thành viên 2', task: 'Dọn nhà vệ sinh', status: 'pending' as const },
  { id: '8', day: 7, member: 'Thành viên 3', task: 'Nấu cơm', status: 'pending' as const },
];

const MONTHS = [
  { value: '2026-09', label: 'Tháng 9' },
  { value: '2026-10', label: 'Tháng 10' },
  { value: '2026-11', label: 'Tháng 11' },
];

interface DutyItem {
  id: string;
  day: number;
  member: string;
  task: string;
  status: 'done' | 'pending';
}

export default function DutiesPage() {
  const { members } = useAppStore();
  const { openModal } = useUIStore();

  const [selectedMonth, setSelectedMonth] = useState('2026-09');
  const [duties, setDuties] = useState<DutyItem[]>(MOCK_DUTIES);

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

  const getDutiesForDay = (day: number) => {
    return duties.filter((d) => d.day === day);
  };

  const handleRotateDuty = () => {
    // Rotate duties among members
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
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-light)',
                  color: 'var(--text-main)',
                }}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
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

          {/* Info Alert */}
          <div
            className="mx-4 mt-4 flex items-center gap-2 rounded-xl p-3 text-xs"
            style={{
              background: 'var(--color-bg-soft-primary)',
              color: 'var(--text-muted)',
            }}
          >
            <i className="fa-solid fa-info-circle" style={{ color: 'var(--primary)' }} />
            Click vào công việc để chỉnh sửa hoặc kéo thả để đổi lịch với thành viên khác.
          </div>

          {/* Duty Grid - 4 columns */}
          <div
            className="grid gap-3 p-4 md:grid-cols-4"
            style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
          >
            {[...Array(31)].map((_, index) => {
              const day = index + 1;
              const dayDuties = getDutiesForDay(day);
              const today = new Date().getDate();
              const isToday = day === today && selectedMonth === '2026-09';

              return (
                <div
                  key={day}
                  className={`min-h-[120px] rounded-xl border p-2 transition-all hover:-translate-y-1 hover:shadow-md ${
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
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className={`text-sm font-bold ${isToday ? 'rounded-full bg-[var(--primary)] px-2 py-0.5 text-white' : ''}`}
                      style={isToday ? {} : { color: 'var(--dark)' }}
                    >
                      {day}
                    </span>
                    {dayDuties.length > 0 && (
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
                        {dayDuties.length}
                      </span>
                    )}
                  </div>

                  {/* Duties */}
                  <div className="space-y-1">
                    {dayDuties.map((duty) => (
                      <button
                        key={duty.id}
                        onClick={() => handleToggleDutyStatus(duty.id)}
                        className="w-full cursor-pointer rounded-lg border p-1.5 text-xs text-left transition-colors hover:border-[var(--primary)]"
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
                    ))}
                  </div>

                  {/* Empty state */}
                  {dayDuties.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                      <span className="text-xs" style={{ color: 'var(--border)' }}>
                        —
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
