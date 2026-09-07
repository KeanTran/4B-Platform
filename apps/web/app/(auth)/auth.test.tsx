import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import LoginPage from './login/page';
import RegisterPage from './register/page';
import ForgotPasswordPage from './forgot-password/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/login',
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock Supabase
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '123', email: 'test@example.com' } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: '123' }, session: null }, error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
    },
  }),
}));

describe('Authentication Pages', () => {
  describe('LoginPage', () => {
    it('renders login form properly', () => {
      render(<LoginPage />);
      expect(screen.getByPlaceholderText('student@ueh.edu.vn')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Ít nhất 8 ký tự')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Đăng Nhập/i })).toBeInTheDocument();
    });

    it('shows validation errors when submitting empty form', async () => {
      render(<LoginPage />);
      const submitBtn = screen.getByRole('button', { name: /Đăng Nhập/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập email')).toBeInTheDocument();
        expect(screen.getByText('Vui lòng nhập mật khẩu')).toBeInTheDocument();
      });
    });

    it('shows error for invalid email format', async () => {
      render(<LoginPage />);
      const emailInput = screen.getByPlaceholderText('student@ueh.edu.vn');
      fireEvent.change(emailInput, { target: { name: 'email', value: 'invalid-email' } });
      const passInput = screen.getByPlaceholderText('Ít nhất 8 ký tự');
      fireEvent.change(passInput, { target: { name: 'password', value: '12345678' } });

      const submitBtn = screen.getByRole('button', { name: /Đăng Nhập/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Email không hợp lệ')).toBeInTheDocument();
      });
    });
  });

  describe('RegisterPage', () => {
    it('renders register form properly', () => {
      render(<RegisterPage />);
      expect(screen.getByPlaceholderText('Nguyễn Văn A')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('email@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Tạo Tài Khoản/i })).toBeInTheDocument();
    });

    it('validates empty inputs and password confirmation mismatch', async () => {
      render(<RegisterPage />);
      const submitBtn = screen.getByRole('button', { name: /Tạo Tài Khoản/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập họ tên')).toBeInTheDocument();
        expect(screen.getByText('Vui lòng nhập email')).toBeInTheDocument();
        expect(screen.getByText('Vui lòng nhập mật khẩu')).toBeInTheDocument();
      });
    });

    it('validates password length and matching passwords', async () => {
      render(<RegisterPage />);
      fireEvent.change(screen.getByPlaceholderText('Nguyễn Văn A'), { target: { value: 'Test User' } });
      fireEvent.change(screen.getByPlaceholderText('email@example.com'), { target: { value: 'test@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('Ít nhất 8 ký tự'), { target: { value: '123' } });
      fireEvent.change(screen.getByPlaceholderText('Nhập lại mật khẩu'), { target: { value: '12345678' } });

      const submitBtn = screen.getByRole('button', { name: /Tạo Tài Khoản/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Mật khẩu phải có ít nhất 8 ký tự')).toBeInTheDocument();
        expect(screen.getByText('Mật khẩu xác nhận không khớp')).toBeInTheDocument();
      });
    });
  });

  describe('ForgotPasswordPage', () => {
    it('renders forgot password form and validates email', async () => {
      render(<ForgotPasswordPage />);
      expect(screen.getByPlaceholderText('student@ueh.edu.vn')).toBeInTheDocument();
      const submitBtn = screen.getByRole('button', { name: /Gửi email đặt lại/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Vui lòng nhập email')).toBeInTheDocument();
      });
    });
  });
});
