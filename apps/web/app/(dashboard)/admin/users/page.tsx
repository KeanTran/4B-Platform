import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { AdminUsersPanel } from '@/components/admin/AdminUsersPanel';
import { DashboardPageIntro } from '@/components/shared/DashboardPageIntro';
import { requireAdminAccess } from '@/lib/auth/roles';

export const metadata: Metadata = {
  title: 'Quản lý người dùng',
  description: 'Quản lý vai trò admin và user trong hệ thống 4B.',
};

export default async function AdminUsersPage() {
  const access = await requireAdminAccess();
  if (!access.authenticated) redirect('/login?next=%2Fadmin%2Fusers');
  if (!access.authorized) redirect('/dashboard');

  return (
    <div className="mx-auto max-w-[1320px] space-y-5">
      <DashboardPageIntro
        icon={ShieldCheck}
        eyebrow="Quản trị hệ thống"
        title="Phân quyền Admin / User"
        description="Theo dõi tài khoản và cấp quyền quản trị. Mọi thay đổi vai trò được xác thực lại ở server."
      />
      <AdminUsersPanel />
    </div>
  );
}
