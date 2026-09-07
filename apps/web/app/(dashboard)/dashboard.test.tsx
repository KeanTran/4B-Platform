import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DashboardPage from './dashboard/page';
import SplitPage from './dashboard/split/page';
import DutiesPage from './dashboard/duties/page';
import SettingsPage from './dashboard/settings/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

describe('Dashboard Pages Render & Interaction', () => {
  it('renders Dashboard Overview with summary and member status', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Tổng hóa đơn tháng này/i)).toBeInTheDocument();
    expect(screen.getByText(/Đã thu hồi/i)).toBeInTheDocument();
    expect(screen.getByText(/Còn tồn đọng/i)).toBeInTheDocument();
    expect(screen.getByText(/Danh Sách Thành Viên Phòng/i)).toBeInTheDocument();
  });

  it('renders Advanced Split calculator page', () => {
    render(<SplitPage />);
    expect(screen.getByText(/Xác Nhận Phân Bổ Hóa Đơn/i)).toBeInTheDocument();
    expect(screen.getByText(/Chế độ Chia Đều/i)).toBeInTheDocument();
  });

  it('renders Duty schedule page', () => {
    render(<DutiesPage />);
    expect(screen.getByText(/Lịch Trực Nhật/i)).toBeInTheDocument();
  });

  it('renders Settings page', () => {
    render(<SettingsPage />);
    expect(screen.getAllByText(/Thông Tin Ngân Hàng/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Thông tin thanh toán/i)).toBeInTheDocument();
  });
});
