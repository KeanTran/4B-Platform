'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store/app-store';

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setCurrentRoom } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ tên';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Họ tên phải có ít nhất 2 ký tự';
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
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            full_name: formData.name.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('Email này đã được đăng ký. Vui lòng đăng nhập.');
        } else {
          toast.error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
        return;
      }

      if (data.session && data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || formData.email.trim(),
          full_name: formData.name.trim(),
          avatar_url: null,
          phone: null,
          zalo_id: null,
          created_at: data.user.created_at,
          updated_at: data.user.created_at,
        });

        const initialRoom = {
          id: `room-${data.user.id.slice(0, 8)}`,
          name: 'Phòng 302',
          address: '123 Đường ABC, Quận 1, TP.HCM',
          owner_id: data.user.id,
          invite_code: '4B302',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setCurrentRoom(initialRoom);

        toast.success('Đăng ký thành công! Đang chuyển đến bảng điều khiển...');
        router.push('/dashboard');
        router.refresh();
      } else {
        // Fallback: try signing in immediately with password in case signUp didn't auto-create session
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password,
        });

        if (signInData?.session && signInData?.user) {
          setUser({
            id: signInData.user.id,
            email: signInData.user.email || formData.email.trim(),
            full_name: formData.name.trim(),
            avatar_url: null,
            phone: null,
            zalo_id: null,
            created_at: signInData.user.created_at,
            updated_at: signInData.user.created_at,
          });

          const initialRoom = {
            id: `room-${signInData.user.id.slice(0, 8)}`,
            name: 'Phòng 302',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            owner_id: signInData.user.id,
            invite_code: '4B302',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setCurrentRoom(initialRoom);

          toast.success('Đăng ký thành công! Đang chuyển đến bảng điều khiển...');
          router.push('/dashboard');
          router.refresh();
        } else {
          toast.success('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.');
          router.push('/login');
        }
      }
    } catch (err: any) {
      toast.error(err?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
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

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      toast.info(`Đang chuyển hướng đến ${provider === 'google' ? 'Google' : 'Facebook'}...`);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(`Đăng nhập qua ${provider} thất bại: ${error.message}`);
      }
    } catch (err: any) {
      toast.error(`Lỗi: ${err?.message || 'Không thể chuyển hướng đăng nhập'}`);
    }
  };

  return (
    <div className="w-full max-w-[400px]">
      {/* Logo */}
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 no-underline">
          <BrandLogo height={48} />
          <span
            className="brand-font text-3xl font-extrabold"
            style={{ color: 'var(--dark)' }}
          >
            4B
          </span>
        </Link>
        <p
          className="mt-2 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Tạo tài khoản miễn phí
        </p>
      </div>

      {/* Form */}
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
              autoComplete="name"
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
              autoComplete="email"
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
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Ít nhất 8 ký tự"
                autoComplete="new-password"
                className="w-full rounded-lg border px-4 py-3 pr-12 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
                style={{
                  background: 'var(--bg-light)',
                  borderColor: errors.password ? 'var(--danger)' : 'var(--border)',
                  color: 'var(--text-main)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
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
              autoComplete="new-password"
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
                Tạo Tài Khoản
              </>
            )}
          </button>
        </form>

        {/* Social Login */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t" style={{ borderColor: 'var(--border)' }} />
          <span
            className="absolute px-3 text-xs"
            style={{ background: 'var(--surface)', color: 'var(--text-muted)' }}
          >
            hoặc đăng ký bằng
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all hover:bg-[var(--bg-light)] active:scale-95"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            <i className="fa-brands fa-facebook text-base" style={{ color: '#1877f2' }} />
            Facebook
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all hover:bg-[var(--bg-light)] active:scale-95"
            style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
          >
            <i className="fa-brands fa-google text-base" style={{ color: '#ea4335' }} />
            Google
          </button>
        </div>

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

      <p
        className="mt-6 text-center text-xs"
        style={{ color: 'var(--text-muted)' }}
      >
        <Link href="/" className="hover:underline" style={{ textDecoration: 'none' }}>
          &larr; Quay lại trang chủ
        </Link>
      </p>
    </div>
  );
}
