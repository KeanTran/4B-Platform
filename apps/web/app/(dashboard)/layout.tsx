'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { AIChatWidget } from '@/components/shared/AIChatWidget';
import { EditMemberModal, QRCodeModal, AddExpenseModal, AddDutyModal, AddMemberModal, NotificationDropdown } from '@/components/shared';
import { useAppStore } from '@/store/app-store';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { toast } from 'sonner';
import type { User } from '@/types';

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
    requiresAuth: true,
  },
];

function mapAuthUser(authUser: {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  updated_at?: string;
  user_metadata?: Record<string, string | undefined>;
}): User {
  return {
    id: authUser.id,
    email: authUser.email || '',
    full_name:
      authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || null,
    avatar_url: authUser.user_metadata?.avatar_url || null,
    phone: authUser.phone || null,
    zalo_id: null,
    created_at: authUser.created_at,
    updated_at: authUser.updated_at || authUser.created_at,
  };
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const {
    user,
    logout,
    currentRoom,
    activateWorkspace,
    workspaceReady,
  } = useAppStore();

  // Resolve auth before rendering workspace data so a previous account can never
  // flash inside a guest or another user's session.
  useEffect(() => {
    let cancelled = false;

    const initializeWorkspace = async () => {
      let appUser: User | null = null;

      if (isSupabaseConfigured()) {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            appUser = mapAuthUser(data.user);
          }
        } catch (error) {
          console.error('Không thể khôi phục phiên đăng nhập:', error);
        }
      }

      if (cancelled) return;

      activateWorkspace(appUser);
      setSessionReady(true);
    };

    void initializeWorkspace();
    return () => {
      cancelled = true;
    };
  }, [activateWorkspace]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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
    router.push('/dashboard');
    router.refresh();
  };

  const getNavHref = (item: (typeof NAV_ITEMS)[number]) =>
    item.requiresAuth && !user
      ? `/login?next=${encodeURIComponent(item.href)}`
      : item.href;

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  if (!sessionReady || !workspaceReady) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: 'var(--bg-light)', color: 'var(--text-muted)' }}
      >
        <div className="flex items-center gap-3 text-sm font-medium">
          <i className="fa-solid fa-circle-notch animate-spin text-[var(--primary)]" />
          Đang chuẩn bị không gian của bạn...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-light)' }}>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 hidden h-full flex-col border-r transition-all duration-300 md:flex ${
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
              {user?.email || 'Dữ liệu lưu trên thiết bị'}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1" style={{ listStyle: 'none' }}>
            {NAV_ITEMS.map((item, index) => (
              <li key={index}>
                <Link
                  href={getNavHref(item)}
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
                  {sidebarOpen && item.requiresAuth && !user && (
                    <i className="fa-solid fa-lock ml-auto text-[10px]" />
                  )}
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
            aria-label={sidebarOpen ? 'Thu gọn thanh điều hướng' : 'Mở rộng thanh điều hướng'}
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

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <>
          <button
            type="button"
            aria-label="Đóng menu Dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-[min(82vw,320px)] flex-col border-r shadow-2xl md:hidden"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-14 items-center justify-between border-b px-4"
              style={{ borderColor: 'var(--border)' }}
            >
              <Link href="/" className="flex items-center gap-2 no-underline">
                <BrandLogo height={32} />
                <span className="brand-font text-xl font-extrabold" style={{ color: 'var(--dark)' }}>
                  4B
                </span>
              </Link>
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-xmark" />
              </button>
            </div>

            <div
              className="mx-3 my-3 rounded-xl border p-3"
              style={{
                background: 'var(--color-bg-soft-primary)',
                borderColor: 'var(--color-border-soft-primary)',
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                {user ? 'Phòng đang quản lý' : 'Chế độ dùng thử'}
              </div>
              <div className="brand-font mt-1 text-sm font-bold" style={{ color: 'var(--dark)' }}>
                {currentRoom?.name || 'Không gian dùng thử'}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1" style={{ listStyle: 'none' }}>
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={getNavHref(item)}
                      className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium"
                      style={
                        isActive(item)
                          ? { background: 'var(--gradient-primary)', color: 'white', textDecoration: 'none' }
                          : { color: 'var(--text-muted)', textDecoration: 'none' }
                      }
                    >
                      <i className={`fa-solid ${item.icon} w-5 text-center`} />
                      {item.label}
                      {item.requiresAuth && !user && (
                        <i className="fa-solid fa-lock ml-auto text-[10px]" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main
        className={`min-w-0 flex-1 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-[260px]' : 'md:ml-[72px]'
        }`}
      >
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-3 sm:px-6"
          style={{
            background: 'var(--bg-light)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Mở menu Dashboard"
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg md:hidden"
              style={{ color: 'var(--dark)' }}
            >
              <i className="fa-solid fa-bars" />
            </button>
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
                aria-label={user ? 'Mở menu tài khoản' : 'Mở menu khách'}
                aria-expanded={profileOpen}
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white transition-all hover:ring-2 hover:ring-[var(--primary-light)]"
                style={{ background: 'var(--primary)' }}
              >
                {user?.email?.charAt(0).toUpperCase() || 'G'}
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
                      {user?.email || 'Khách dùng thử'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {user ? 'Dữ liệu riêng của tài khoản' : 'Đang lưu trên thiết bị này'}
                    </div>
                  </div>
                  <div className="py-2">
                    {user ? (
                      <>
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
                      </>
                    ) : (
                      <Link
                        href="/login?next=%2Fdashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-semibold transition-colors hover:bg-[var(--bg-light)]"
                        style={{ color: 'var(--primary)', textDecoration: 'none' }}
                      >
                        <i className="fa-solid fa-right-to-bracket w-5 text-center" />
                        Đăng nhập để đồng bộ
                      </Link>
                    )}
                  </div>
                  <div
                    className="border-t py-2"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-[var(--color-bg-warning-soft)]"
                        style={{ color: 'var(--danger)' }}
                      >
                        <i className="fa-solid fa-right-from-bracket w-5 text-center" />
                        Đăng xuất
                      </button>
                    ) : (
                      <Link
                        href="/register"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                        style={{ color: 'var(--text-main)', textDecoration: 'none' }}
                      >
                        <i className="fa-solid fa-user-plus w-5 text-center" />
                        Tạo tài khoản miễn phí
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {!user && (
          <div
            className="mx-3 mt-3 flex flex-col gap-3 rounded-2xl border p-4 sm:mx-5 sm:flex-row sm:items-center sm:justify-between"
            style={{
              background: 'var(--color-bg-soft-primary)',
              borderColor: 'var(--color-border-soft-primary)',
            }}
          >
            <div>
              <div className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
                Bạn đang dùng Dashboard ở chế độ khách
              </div>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                Dữ liệu chỉ được lưu trên thiết bị này. Đăng nhập để chuẩn bị cho đồng bộ cloud.
              </p>
            </div>
            <Link
              href="/login?next=%2Fdashboard"
              className="inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold text-white no-underline"
              style={{ background: 'var(--gradient-primary)' }}
            >
              Đăng nhập tài khoản
            </Link>
          </div>
        )}

        {/* Page Content */}
        <div className="p-3 pb-24 sm:p-5 sm:pb-24 md:pb-5">{children}</div>
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
