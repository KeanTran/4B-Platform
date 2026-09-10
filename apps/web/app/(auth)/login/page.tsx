'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { BrandLogo } from '@/components/shared/BrandLogo';
import { createClient } from '@/lib/supabase/client';
import { useAppStore } from '@/store/app-store';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setCurrentRoom } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rememberMe, setRememberMe] = useState(true);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email hoặc mật khẩu không chính xác.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Email chưa được xác thực. Vui lòng kiểm tra email của bạn.');
        } else {
          toast.error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        }
        return;
      }

      if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || formData.email.trim(),
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || null,
          avatar_url: data.user.user_metadata?.avatar_url || null,
          phone: data.user.phone || null,
          zalo_id: null,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at || data.user.created_at,
        });

        // Restore room from localStorage or user_metadata
        let room = null;
        try {
          const userRoomStr = localStorage.getItem(`4b_room_${data.user.id}`);
          const lastRoomStr = localStorage.getItem('4b_last_room');
          if (userRoomStr) {
            room = JSON.parse(userRoomStr);
          } else if (lastRoomStr) {
            room = JSON.parse(lastRoomStr);
          } else if (data.user.user_metadata?.room) {
            room = data.user.user_metadata.room;
          }
        } catch (e) {}

        if (!room) {
          room = {
            id: `room-${data.user.id.slice(0, 8)}`,
            name: data.user.user_metadata?.room_name || 'Phòng 302',
            address: '123 Đường ABC, Quận 1, TP.HCM',
            owner_id: data.user.id,
            invite_code: '4B302',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
        setCurrentRoom(room);

        toast.success('Đăng nhập thành công!');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.');
    } finally {
      setIsLoading(false);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'linear-gradient(135deg, var(--bg-light) 0%, #f5f0d8 100%)' }}
    >
      {/* Form Container - Full Width */}
      <div className="flex w-full items-center justify-center p-6">
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
            <h1
              className="brand-font mb-2 text-[32px] font-extrabold"
              style={{ color: 'var(--dark)' }}
            >
              Chào mừng trở lại 👋
            </h1>
            <p
              className="mb-7 text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              Đăng nhập để tiếp tục quản lý phòng trọ và chia chi phí cùng
              bạn bè ở ghép.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-xs font-semibold"
                  style={{ color: 'var(--dark)' }}
                >
                  Email đăng nhập
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@ueh.edu.vn"
                  autoComplete="email"
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
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

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-1 block text-xs font-semibold"
                  style={{ color: 'var(--dark)' }}
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
                  autoComplete="current-password"
                  minLength={8}
                  className="w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:border-[var(--primary)] focus:outline-none"
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

              {/* Options Row */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex cursor-pointer items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  Ghi nhớ đăng nhập
                </label>
                <Link
                  href="/forgot-password"
                  className="font-semibold transition-colors hover:underline"
                  style={{ color: 'var(--primary)', textDecoration: 'none' }}
                >
                  Quên mật khẩu?
                </Link>
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
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket" />
                    Đăng nhập
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div
              className="my-6 flex items-center gap-3 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
              hoặc đăng nhập với
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
            </div>

            {/* Social Buttons */}
            <div className="mb-3 flex gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialLogin('facebook')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:border-[#1877f2] hover:bg-[#1877f2]/5"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <i className="fa-brands fa-facebook text-base" style={{ color: '#1877f2' }} />
                Facebook
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors hover:border-[#ea4335] hover:bg-[#ea4335]/5"
                style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
              >
                <i className="fa-brands fa-google text-base" style={{ color: '#ea4335' }} />
                Google
              </button>
            </div>

            {/* OR Divider */}
            <div
              className="my-4 flex items-center gap-3 text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
              — hoặc —
              <span className="h-px flex-1" style={{ background: 'var(--border)' }} />
            </div>

            {/* Register Button */}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-light)]"
              style={{ borderColor: 'var(--border)', color: 'var(--text-main)' }}
            >
              <i className="fa-solid fa-user-plus" />
              Tạo phòng trọ mới
            </button>

            {/* Terms Note */}
            <p
              className="mt-5 border-t pt-4 text-center text-xs leading-relaxed"
              style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
            >
              Bằng việc đăng nhập, bạn đồng ý với{' '}
              <Link
                href="#"
                className="font-semibold"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Điều khoản sử dụng');
                }}
              >
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link
                href="#"
                className="font-semibold"
                style={{ color: 'var(--primary)', textDecoration: 'none' }}
                onClick={(e) => {
                  e.preventDefault();
                  toast.info('Chính sách bảo mật');
                }}
              >
                Chính sách bảo mật
              </Link>{' '}
              của 4B.
            </p>
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

    </div>
  );
}
