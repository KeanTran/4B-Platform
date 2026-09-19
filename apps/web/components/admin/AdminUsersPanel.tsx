'use client';

import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import type { AdminUserSummary, AppRole } from '@/types/auth';

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadUsers() {
      try {
        const response = await fetch('/api/admin/users', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? 'Không thể tải người dùng.');
        if (active) {
          setUsers(result.users);
          setCurrentUserId(result.current_user_id);
        }
      } catch (error) {
        if (active) toast.error(error instanceof Error ? error.message : 'Không thể tải người dùng.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadUsers();
    return () => { active = false; };
  }, []);

  async function changeRole(userId: string, role: AppRole) {
    const previousRole = users.find((user) => user.id === userId)?.role;
    setUsers((current) => current.map((user) => user.id === userId ? { ...user, role } : user));
    setUpdatingId(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Không thể cập nhật vai trò.');
      toast.success(role === 'admin' ? 'Đã cấp quyền admin.' : 'Đã chuyển về quyền user.');
    } catch (error) {
      if (previousRole) {
        setUsers((current) => current.map((user) => user.id === userId ? { ...user, role: previousRole } : user));
      }
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật vai trò.');
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <Card variant="surface" className="flex min-h-56 items-center justify-center gap-2 p-6 text-sm" style={{ color: 'var(--text-muted)' }}>
        <Loader2 className="animate-spin" size={18} /> Đang tải danh sách tài khoản…
      </Card>
    );
  }

  return (
    <Card variant="surface" className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary)' }}><UsersRound size={19} /></span>
          <div>
            <h3 className="font-bold" style={{ color: 'var(--text-heading)' }}>Tài khoản hệ thống</h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{users.length} tài khoản</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: 'var(--color-bg-soft-primary)', color: 'var(--primary-dark)' }}><ShieldCheck size={13} />Admin được quản lý vai trò</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead style={{ background: 'var(--bg-light)', color: 'var(--text-muted)' }}>
            <tr>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">Người dùng</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">Ngày tạo</th>
              <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide">Vai trò</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                <td className="px-5 py-4">
                  <p className="font-bold" style={{ color: 'var(--text-heading)' }}>{user.display_name}{user.id === currentUserId ? ' (Bạn)' : ''}</p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                </td>
                <td className="px-5 py-4 text-xs" style={{ color: 'var(--text-muted)' }}>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <select
                      aria-label={`Vai trò của ${user.display_name}`}
                      value={user.role}
                      disabled={updatingId === user.id || user.id === currentUserId}
                      onChange={(event) => void changeRole(user.id, event.target.value as AppRole)}
                      className="h-10 rounded-xl border bg-[var(--surface)] px-3 text-sm font-bold outline-none disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ borderColor: 'var(--border)', color: user.role === 'admin' ? 'var(--primary)' : 'var(--text-main)' }}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    {updatingId === user.id && <Loader2 className="animate-spin" size={15} style={{ color: 'var(--primary)' }} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

