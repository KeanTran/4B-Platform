'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { AIChatWidget } from '@/components/shared/AIChatWidget';
import { EditMemberModal, QRCodeModal, AddExpenseModal, AddDutyModal, AddMemberModal, NotificationDropdown } from '@/components/shared';
import { useAppStore } from '@/store/app-store';
import { useUIStore } from '@/store/ui-store';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const NAV_ITEMS = [
  {
    label: 'Tổng Quan Thu Chi',
    href: '/dashboard',
    icon: 'fa-chart-pie',
    exact: true,
  },
  {
    label: 'Chia Tiền Nâng Cao',
    href: '/dashboard/split',
    icon: 'fa-calculator',
  },
  {
    label: 'Lịch Trực Nhật',
    href: '/dashboard/duties',
    icon: 'fa-broom',
  },
  {
    label: '4B Student Pro AI',
    href: '/dashboard/ai',
    icon: 'fa-wand-magic-sparkles',
    accentColor: 'var(--accent)',
  },
  {
    label: 'Cài Đặt',
    href: '/dashboard/settings',
    icon: 'fa-gear',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, setUser, logout, currentRoom } = useAppStore();
  const { notifications, markAsRead, markAllAsRead } = useUIStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Sync Supabase user session to AppStore if not loaded yet
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser && !user) {
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || null,
          avatar_url: authUser.user_metadata?.avatar_url || null,
          phone: authUser.phone || null,
          zalo_id: null,
          created_at: authUser.created_at,
          updated_at: authUser.updated_at || authUser.created_at,
        });
      }
    });
  }, [user, setUser]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Lỗi đăng xuất Supabase:', error);
    }
    logout();
    toast.success('Đã đăng xuất thành công!');
    router.push('/login');
    router.refresh();
  };

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-light)' }}>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full flex-col border-r transition-all duration-300 ${
          sidebarOpen ? 'w-[260px]' : 'w-[72px]'
        }`}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex h-14 items-center border-b px-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <Link href="/" className="flex items-center gap-2 no-underline">
            <BrandLogo height={32} />
            {sidebarOpen && (
              <span
                className="brand-font text-xl font-extrabold"
                style={{ color: 'var(--dark)' }}
              >
                4B
              </span>
            )}
          </Link>
        </div>

        {/* Room Info Card */}
        {sidebarOpen && (
          <div
            className="mx-3 my-3 rounded-xl p-3"
            style={{
              background: 'var(--color-bg-soft-primary)',
              border: '1px solid var(--color-border-soft-primary)',
            }}
          >
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Phòng đang quản lý
            </div>
            <div className="brand-font text-sm font-bold" style={{ color: 'var(--dark)' }}>
              {currentRoom?.name || 'Chưa có phòng'}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {user?.email || 'Chưa đăng nhập'}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1" style={{ listStyle: 'none' }}>
            {NAV_ITEMS.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive(item) ? 'text-white' : ''
                  }`}
                  style={
                    isActive(item)
                      ? {
                          background: 'var(--gradient-primary)',
                          color: 'white',
                          textDecoration: 'none',
                        }
                      : {
                          color: 'var(--text-muted)',
                          textDecoration: 'none',
                        }
                  }
                >
                  <i
                    className={`fa-solid ${item.icon} w-5 text-center ${item.accentColor ? '' : ''}`}
                    style={item.accentColor ? { color: item.accentColor } : {}}
                  />
                  {sidebarOpen && item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Zalo Bot Button */}
        <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => toast.success('Đã gửi nhắc nhở Zalo đến 3 thành viên!')}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-all hover:opacity-90"
            style={{
              background: '#0068ff',
              boxShadow: '0 4px 12px rgba(0, 104, 255, 0.3)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 50 50" fill="currentColor">
              <path d="M25,2C12.318,2,2,12.318,2,25c0,5.374,1.781,10.289,4.75,14.219L2,47l5.563-2.781C10.219,46.562,17.045,49,24.5,49 c0.552,0,1-0.448,1-1v-3.5h-2v3.448C12.5,47.276,5.224,40,5.224,40v-2.776C7.448,35.776,10.224,33,13.724,33v-2 c0-2.209,1.791-4,4-4h4c1.105,0,2,0.895,2,2v4c0,1.105-0.895,2-2,2h-2v3.5C22.5,37.276,25.776,40,29.776,40V33 c3.5,0,6.276,2.776,8.5,5.224V40c0,2.209-1.791,4-4,4h-1.5c-2.209,0-4-1.791-4-4v-2h2v2c0,1.105,0.895,2,2,2h4 c2.209,0,4-1.791,4-4V18.5c0-2.5-2.5-5.5-5.5-5.5C32.5,13,30,15,30,18.5v2h-2v-2c0-1.105-0.895-2-2-2h-4c-2.209,0-4,1.791-4,4v2 c-3.5,0-6.276-2.776-8.5-5.224V25c0-2.5,2.5-5.5,5.5-5.5h5c1.105,0,2-0.895,2-2V11.5C28.5,6,33.5,2,38,2 c6.893,0,12.5,5.607,12.5,12.5c0,2.5-0.5,5-1.5,7.5c-0.5,1-1.5,2-2.5,2c-1,0-2-0.5-2.5-1c-0.5-0.5-1.5-1-2-1c-1.5,0-3,1-3,3 c0,1,0.5,2,1.5,3c1,1,2,2.5,2,4.5c0,2.5-1.5,5-4,6.5c-1.5,1-3,1.5-4.5,1.5c-0.5,0-0.5,0-1-0.5c-0.5-0.5-1-1-1-1.5 c0-0.5,0-1-0.5-1s-0.5,0.5-0.5,1c0,0.5,0,1,0.5,1.5c0.5,0.5,1,1,1.5,1.5c1.5,1,3,1.5,5,1.5c2,0,4-0.5,5.5-1.5 c2-1.5,3-3,3-5c0-1-0.5-2-1-3c-1-1-1.5-2-1.5-3c0-1,0.5-2,1.5-3c0.5,0,1,0.5,1.5,1c0.5,0.5,1.5,1,2.5,1c1.5,0,2.5-1,3-2 c0.5-1,1-2.5,1-4C48,8.929,43.929,2,38,2H25z"/>
            </svg>
            {sidebarOpen && (
              <span className="font-medium">Zalo Bot Nhắc Nợ</span>
            )}
          </button>
        </div>

        {/* Collapse Button */}
        <div className="border-t p-3" style={{ borderColor: 'var(--border)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex w-full items-center justify-center rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-[var(--bg-light)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <i
              className={`fa-solid fa-chevron-left transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
            />
            {sidebarOpen && <span className="ml-2">Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[260px]' : 'ml-[72px]'}`}
      >
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-6"
          style={{
            background: 'var(--bg-light)',
            borderColor: 'var(--border)',
          }}
        >
          <div>
            <h1
              className="brand-font text-lg font-bold"
              style={{ color: 'var(--dark)' }}
            >
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white transition-all hover:ring-2 hover:ring-[var(--primary-light)]"
                style={{ background: 'var(--primary)' }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'M'}
              </button>
              {profileOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border shadow-lg"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <div
                    className="border-b px-4 py-3"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="font-semibold" style={{ color: 'var(--dark)' }}>
                      {user?.email || 'Người dùng'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user?.email || 'minhtuan@gmail.com'}
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-light)]"
                      style={{ color: 'var(--text-main)', textDecoration: 'none' }}
                    >
                      <i className="fa-solid fa-user w-5 text-center" style={{ color: 'var(--text-muted)' }} />
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-light)]"
                      style={{ color: 'var(--text-main)', textDecoration: 'none' }}
                    >
                      <i className="fa-solid fa-gear w-5 text-center" style={{ color: 'var(--text-muted)' }} />
                      Cài đặt
                    </Link>
                  </div>
                  <div
                    className="border-t py-2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[var(--color-bg-warning-soft)]"
                      style={{ color: 'var(--danger)' }}
                    >
                      <i className="fa-solid fa-right-from-bracket w-5 text-center" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-5">{children}</div>
      </main>

      {/* AI Chat Widget - Floating ở góc phải phía dưới */}
      <AIChatWidget />

      {/* Global Modals */}
      <EditMemberModal />
      <QRCodeModal />
      <AddExpenseModal />
      <AddDutyModal />
      <AddMemberModal />
    </div>
  );
}
