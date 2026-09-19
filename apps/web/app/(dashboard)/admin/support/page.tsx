import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Headphones } from 'lucide-react';
import { AdminSupportPanel } from '@/components/admin/AdminSupportPanel';
import { DashboardPageIntro } from '@/components/shared/DashboardPageIntro';
import { requireAdminAccess } from '@/lib/auth/roles';

export const metadata: Metadata = {
  title: 'Hộp thư hỗ trợ',
  description: 'Tiếp nhận và xử lý yêu cầu Chat Now từ người dùng 4B.',
};

export default async function AdminSupportPage() {
  const access = await requireAdminAccess();
  if (!access.authenticated) redirect('/login?next=%2Fadmin%2Fsupport');
  if (!access.authorized) redirect('/dashboard');

  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <DashboardPageIntro
        icon={Headphones}
        eyebrow="Quản trị hỗ trợ"
        title="Hộp Thư Hỗ Trợ"
        description="Mọi yêu cầu gửi từ Chat Now được lưu tại đây. Admin phản hồi qua email hoặc số điện thoại mà người dùng cung cấp."
      />
      <AdminSupportPanel />
    </div>
  );
}
