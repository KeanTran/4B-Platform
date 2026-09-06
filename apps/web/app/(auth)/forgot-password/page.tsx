'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/shared/BrandLogo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không hợp lệ');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Connect to Supabase auth
      // const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      //   redirectTo: `${window.location.origin}/reset-password`,
      // });

      // Simulate sending email
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsSuccess(true);
      toast.success('Đã gửi email đặt lại mật khẩu!');
    } catch {
      setError('Không thể gửi email. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-[460px] text-center">
          <div
            className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: 'var(--color-bg-soft-primary)' }}
          >
            <i
              className="fa-solid fa-envelope-circle-check text-3xl"
              style={{ color: 'var(--primary)' }}
            />
          </div>
          <h1
            className="brand-font mb-3 text-2xl font-extrabold"
            style={{ color: 'var(--dark)' }}
          >
            Kiểm tra email của bạn
          </h1>
          <p
            className="mb-6 text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
            <strong style={{ color: 'var(--dark)' }}>{email}</strong>
            <br />
            Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
          </p>
          <p
            className="mb-6 text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
            <button
              onClick={() => setIsSuccess(false)}
              className="font-semibold underline"
              style={{ color: 'var(--primary)' }}
            >
              thử lại
            </button>
            .
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
              textDecoration: 'none',
            }}
          >
            <i className="fa-solid fa-right-to-bracket" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'linear-gradient(135deg, var(--bg-light) 0%, #f5f0d8 100%)' }}
    >
      {/* Left side - Form */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-[460px]">
          {/* Logo */}
          <Link href="/" className="mb-8 flex items-center gap-3 no-underline">
            <BrandLogo height={44} />
            <span
              className="brand-font text-[28px] font-extrabold"
              style={{ color: 'var(--dark)' }}
            >
              4B
            </span>
          </Link>

          {/* Form Card */}
          <div
            className="rounded-3xl border p-10 shadow-lg"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: '0 20px 60px rgba(78, 120, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div
              className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: 'var(--color-bg-soft-primary)' }}
            >
              <i
                className="fa-solid fa-key text-2xl"
                style={{ color: 'var(--primary)' }}
              />
            </div>

            <h1
              className="brand-font mb-2 text-2xl font-extrabold"
              style={{ color: 'var(--dark)' }}
            >
              Quên mật khẩu?
            </h1>
            <p
              className="mb-6 text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              Không sao cả! Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn
              đặt lại mật khẩu.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-semibold"
                  style={{ color: 'var(--dark)' }}
                >
                  Email đã đăng ký
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="student@ueh.edu.vn"
                  autoComplete="email"
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: error ? 'var(--danger)' : 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                />
                {error && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                    {error}
                  </p>
                )}
              </div>

              {/* Info Box */}
              <div
                className="rounded-xl border p-4 text-xs"
                style={{
                  background: 'var(--color-bg-soft-primary)',
                  borderColor: 'var(--color-border-soft-primary)',
                }}
              >
                <p style={{ color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-circle-info mr-1" style={{ color: 'var(--primary)' }} />
                  Email đặt lại mật khẩu sẽ có hiệu lực trong{' '}
                  <strong style={{ color: 'var(--dark)' }}>1 giờ</strong>.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane" />
                    Gửi email đặt lại
                  </>
                )}
              </button>
            </form>

            {/* Back to Login */}
            <div
              className="mt-6 flex items-center justify-center gap-2 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Nhớ mật khẩu rồi?</span>
              <Link
                href="/login"
                className="flex items-center gap-1 font-semibold transition-colors hover:underline"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
              >
                <i className="fa-solid fa-right-to-bracket text-xs" />
                Đăng nhập ngay
              </Link>
            </div>
          </div>

          {/* Back to Home */}
          <Link
            href="/"
            className="mt-6 flex items-center gap-1.5 text-xs font-semibold no-underline transition-colors hover:text-[var(--primary)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <i className="fa-solid fa-arrow-left" />
            Về trang chủ
          </Link>
        </div>
      </div>

      {/* Right side - Illustration (Desktop only) */}
      <div
        className="hidden items-center justify-center p-8 lg:flex lg:w-1/2"
        style={{
          background: 'var(--gradient-dark)',
        }}
      >
        <div className="max-w-[400px] text-center">
          <div
            className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            <i className="fa-solid fa-shield-halved text-4xl text-[var(--primary-light)]" />
          </div>
          <h2
            className="brand-font mb-3 text-2xl font-bold text-white"
          >
            Bảo mật tài khoản của bạn
          </h2>
          <p
            className="text-sm leading-relaxed text-white/70"
          >
            Chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu an toàn đến email của bạn.
            Đảm bảo giữ email này riêng tư.
          </p>

          <div className="mt-8 space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <i className="fa-solid fa-lock text-[var(--primary-light)]" />
              Mật khẩu được mã hóa an toàn
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <i className="fa-solid fa-clock text-[var(--primary-light)]" />
              Link có hiệu lực trong 1 giờ
            </div>
            <div className="flex items-center gap-3 text-sm text-white/70">
              <i className="fa-solid fa-envelope text-[var(--primary-light)]" />
              Email được gửi qua Resend
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
