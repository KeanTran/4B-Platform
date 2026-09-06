'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { useUIStore } from '@/store/ui-store';

export function Hero() {
  const { openModal } = useUIStore();

  const scrollToRegister = useCallback(() => {
    const el = document.getElementById('register');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section
      className="mx-auto grid max-w-[1240px] items-center gap-10 px-[5%] pt-[140px] pb-[60px] md:grid-cols-[1.1fr_0.9fr]"
      style={{ paddingTop: '140px' }}
    >
      <div>
        <div className="mb-4">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-semibold"
            style={{
              background: 'var(--primary-light)',
              color: 'var(--dark)',
              borderColor: '#b8df4d',
            }}
          >
            <i className="fa-solid fa-heart" style={{ color: 'var(--danger)' }} />
            Khởi tạo từ chính trải nghiệm ở ghép sinh viên
          </span>
        </div>

        <h1
          className="brand-font mb-5 text-[34px] font-extrabold leading-tight tracking-tight md:text-[44px]"
          style={{ color: 'var(--dark)' }}
        >
          Giải pháp chia chi phí phòng trọ{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #3f7f12, #f9a23d)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            sòng phẳng & êm đẹp
          </span>
        </h1>

        <p
          className="mb-6 max-w-[560px] text-[15px] leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          4B tự động hóa việc tính toán phân bổ hóa đơn, khởi tạo VietQR 1-chạm và nhắc đóng tiền tự
          động qua Zalo Bot. Xóa bỏ hoàn toàn cảm giác e ngại khi phải trực tiếp đòi tiền bạn cùng
          phòng.
        </p>

        <div
          className="mb-7 flex flex-col gap-5 border-t border-dashed pt-2.5 md:flex-row"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px]"
              style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
            >
              <i className="fa-solid fa-house-user" />
            </div>
            <div>
              <strong className="block text-[14px] font-bold" style={{ color: 'var(--dark)' }}>
                10,000+
              </strong>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Phòng trọ tin dùng
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px]"
              style={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
            >
              <i className="fa-solid fa-graduation-cap" />
            </div>
            <div>
              <strong className="block text-[14px] font-bold" style={{ color: 'var(--dark)' }}>
                50,000+
              </strong>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Sinh viên sử dụng
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px]"
              style={{ background: 'var(--primary-light)', color: 'var(--accent)' }}
            >
              <i className="fa-solid fa-star" />
            </div>
            <div>
              <strong className="block text-[14px] font-bold" style={{ color: 'var(--dark)' }}>
                4.9 / 5.0
              </strong>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Đánh giá hài lòng
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/register"
            onClick={scrollToRegister}
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
              textDecoration: 'none',
            }}
          >
            <i className="fa-solid fa-plus" />
            Tạo Phòng Trọ Ngay
          </Link>

          <button
            type="button"
            onClick={() => openModal('demo')}
            className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[13px] font-bold transition-colors hover:bg-[var(--primary-light)]"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--dark)',
              background: 'var(--surface)',
            }}
          >
            <i className="fa-solid fa-play" />
            Xem Demo
          </button>
        </div>
      </div>

      {/* Preview Window */}
      <div
        className="overflow-hidden rounded-3xl border shadow-[0_10px_30px_-10px_rgba(63,127,18,0.15)]"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-[18px] py-3"
          style={{
            background: 'var(--color-window-header-bg)',
            borderColor: 'var(--border)',
          }}
        >
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#ef4444' }} />
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#f9a23d' }} />
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: '#3f7f12' }} />
          <span
            className="ml-2 text-[12px] font-semibold"
            style={{ color: 'var(--text-muted)' }}
          >
            4B — Demo Phòng 302
          </span>
        </div>

        <div className="p-[22px]">
          <div
            className="mb-3.5 flex items-start gap-2.5 rounded-[10px] border p-3"
            style={{
              background: 'var(--color-bg-soft-primary)',
              borderColor: 'var(--color-border-soft-primary)',
            }}
          >
            <div className="text-[20px]" style={{ color: 'var(--primary)' }}>
              <i className="fa-solid fa-circle-check" />
            </div>
            <div>
              <div className="text-[13px] font-bold" style={{ color: 'var(--dark)' }}>
                Sổ Thu Chi Tháng 8
              </div>
              <div className="text-[11px]" style={{ color: 'var(--primary-dark)' }}>
                Đã tự động chia đều tiền nhà & điện nước cho 4 thành viên!
              </div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div
              className="rounded-[10px] border p-3"
              style={{ background: 'var(--bg-light)', borderColor: 'var(--border)' }}
            >
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Tổng chi tháng này
              </div>
              <div
                className="brand-font text-[17px] font-extrabold"
                style={{ color: 'var(--primary)' }}
              >
                4,800,000 đ
              </div>
            </div>
            <div
              className="rounded-[10px] border p-3"
              style={{ background: 'var(--bg-light)', borderColor: 'var(--border)' }}
            >
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Mỗi người đóng
              </div>
              <div
                className="brand-font text-[17px] font-extrabold"
                style={{ color: 'var(--dark)' }}
              >
                1,200,000 đ
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToRegister}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[13px] font-bold text-white shadow-md transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
              border: 'none',
            }}
          >
            <i className="fa-solid fa-rocket" />
            Trải Nghiệm Khởi Tạo Thật
          </button>
        </div>
      </div>
    </section>
  );
}
