'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

export function RegisterSection() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // TODO: Connect to Supabase auth
      // For now, simulate registration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
      router.push('/login');
    } catch {
      toast.error('Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <section
      id="register"
      className="py-[80px]"
      style={{ background: 'var(--color-bg-soft-primary)' }}
    >
      <div className="mx-auto max-w-[1240px] px-[5%]">
        <div className="mx-auto max-w-[480px]">
          <div className="mb-8 text-center">
            <h2
              className="brand-font mb-2 text-3xl font-extrabold md:text-[36px]"
              style={{ color: 'var(--dark)' }}
            >
              Bắt Đầu Ngay
            </h2>
            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Tạo tài khoản miễn phí trong vài giây
            </p>
          </div>

          <div
            className="rounded-2xl border p-6 md:p-8"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--text-main)' }}
                >
                  Họ tên
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: errors.name ? 'var(--danger)' : 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                />
                {errors.name && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--text-main)' }}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: errors.email ? 'var(--danger)' : 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                />
                {errors.email && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--text-main)' }}
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ít nhất 8 ký tự"
                  className="w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: errors.password ? 'var(--danger)' : 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                />
                {errors.password && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: 'var(--text-main)' }}
                >
                  Xác nhận mật khẩu
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                  style={{
                    background: 'var(--bg-light)',
                    borderColor: errors.confirmPassword ? 'var(--danger)' : 'var(--border)',
                    color: 'var(--text-main)',
                  }}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
                }}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-rocket" />
                    Tạo Tài Khoản Miễn Phí
                  </>
                )}
              </button>
            </form>

            <div
              className="mt-6 border-t pt-6 text-center text-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              <p style={{ color: 'var(--text-muted)' }}>
                Đã có tài khoản?{' '}
                <Link
                  href="/login"
                  className="font-semibold hover:underline"
                  style={{ color: 'var(--primary)', textDecoration: 'none' }}
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>

          <p
            className="mt-4 text-center text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            Bằng việc đăng ký, bạn đồng ý với{' '}
            <a href="#" className="underline hover:no-underline">
              Điều khoản sử dụng
            </a>{' '}
            và{' '}
            <a href="#" className="underline hover:no-underline">
              Chính sách bảo mật
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
