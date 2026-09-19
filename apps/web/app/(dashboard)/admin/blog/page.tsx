import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Newspaper } from 'lucide-react';
import { AdminBlogPanel } from '@/components/admin/AdminBlogPanel';
import { DashboardPageIntro } from '@/components/shared/DashboardPageIntro';
import { requireAdminAccess } from '@/lib/auth/roles';

export const metadata: Metadata = {
  title: 'Quản lý Blog',
  description: 'Quản lý nội dung, quy trình xuất bản và thông tin SEO cho Blog 4B.',
};

export default async function AdminBlogPage() {
  const access = await requireAdminAccess();
  if (!access.authenticated) redirect('/login?next=%2Fadmin%2Fblog');
  if (!access.authorized) redirect('/dashboard');

  return (
    <div className="mx-auto max-w-[1480px] space-y-5">
      <DashboardPageIntro
        icon={Newspaper}
        eyebrow="Quản trị nội dung"
        title="Quản Lý Blog"
        description="Tạo quy trình biên tập tập trung: đọc bài gửi, chỉnh nội dung và metadata, rồi quyết định bài nào được xuất bản trên cộng đồng 4B."
      />
      <AdminBlogPanel />
    </div>
  );
}
