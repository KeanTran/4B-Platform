'use client';

import { toast } from 'sonner';

export default function AIPage() {
  const handleUpgrade = () => {
    toast.info('Tính năng Pro - Liên hệ support@4b.vn để nâng cấp!');
  };

  return (
    <div className="space-y-5">
      {/* Tab 4B Student Pro AI */}
      <div id="tab-ai">
        {/* AI Card */}
        <div
          className="rounded-2xl border p-5"
          style={{
            background: 'var(--gradient-dark)',
            borderColor: 'var(--dark-surface)',
          }}
        >
          {/* Header */}
          <div
            className="mb-4 flex flex-wrap items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-wand-magic-sparkles text-lg" style={{ color: 'var(--warning)' }} />
              <span className="font-semibold text-white">
                4B Student Pro AI — Phân Tích & Dự Báo Tiết Kiệm
              </span>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{
                background: 'rgba(255, 224, 102, 0.2)',
                color: 'var(--warning)',
              }}
            >
              Pro Feature
            </span>
          </div>

          {/* AI Cards Grid */}
          <div
            className="grid gap-4 md:grid-cols-2"
          >
            {/* Card 1: Dự báo chi phí */}
            <div
              className="rounded-xl border p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <div
                className="mb-2 text-xs font-bold"
                style={{ color: 'var(--primary-light)' }}
              >
                <i className="fa-solid fa-crystal-ball mr-1" />
                AI Dự Báo Chi Phí Tháng T9
              </div>
              <p className="text-sm leading-relaxed text-white/80">
                Dựa trên lịch sử tiêu thụ và xu hướng thời tiết nắng nóng,
                AI dự báo tổng hóa đơn tháng tới của phòng sẽ rơi vào khoảng{' '}
                <strong className="text-white">5,150,000 đ</strong>
                <span className="ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(255, 224, 102, 0.2)', color: 'var(--warning)' }}>
                  +7%
                </span>
                . Nên chủ động chuẩn bị quỹ phòng.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleUpgrade}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/10"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                >
                  <i className="fa-solid fa-chart-line mr-1" />
                  Xem chi tiết
                </button>
              </div>
            </div>

            {/* Card 2: Gợi ý tiết kiệm */}
            <div
              className="rounded-xl border p-4"
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
              }}
            >
              <div
                className="mb-2 text-xs font-bold"
                style={{ color: 'var(--warning)' }}
              >
                <i className="fa-solid fa-lightbulb mr-1" />
                AI Gợi Ý Tiết Kiệm Cá Nhân Hóa
              </div>
              <p className="text-sm leading-relaxed text-white/80">
                Hệ thống nhận thấy phòng chi khoảng{' '}
                <strong className="text-white">280,000 đ/tháng</strong> cho việc
                mua nước đóng chai. AI gợi ý chuyển sang đổi nước bình nhóm lớn
                để tiết kiệm đến{' '}
                <strong className="text-[var(--primary-light)]">15% chi phí</strong>{' '}
                hàng tháng.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={handleUpgrade}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white/10"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                  }}
                >
                  <i className="fa-solid fa-piggy-bank mr-1" />
                  Áp dụng ngay
                </button>
              </div>
            </div>
          </div>

          {/* More AI Features */}
          <div
            className="mt-4 grid gap-3 md:grid-cols-3"
          >
            <div
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'rgba(63, 127, 18, 0.3)' }}
              >
                <i className="fa-solid fa-chart-bar text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Phân Tích Xu Hướng</div>
                <div className="text-xs text-white/60">Theo dõi chi tiêu 3 tháng</div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'rgba(249, 162, 61, 0.3)' }}
              >
                <i className="fa-solid fa-bell text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Nhắc Nhở Thông Minh</div>
                <div className="text-xs text-white/60">Tự động nhắc trước hạn</div>
              </div>
            </div>

            <div
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full"
                style={{ background: 'rgba(0, 132, 255, 0.3)' }}
              >
                <i className="fa-solid fa-users text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">So Sánh Chi Phí</div>
                <div className="text-xs text-white/60">Với các phòng khác</div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA */}
          <div
            className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            style={{
              background: 'rgba(212, 238, 125, 0.1)',
              borderColor: 'rgba(212, 238, 125, 0.2)',
            }}
          >
            <div>
              <div className="text-sm font-semibold text-white">
                Mở khóa tất cả tính năng AI
              </div>
              <div className="text-xs text-white/60">
                Chỉ với 29,000đ/tháng - Giới hạn 100 đề xuất/tháng
              </div>
            </div>
            <button
              onClick={handleUpgrade}
              className="rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 4px 12px rgba(63, 127, 18, 0.4)',
              }}
            >
              <i className="fa-solid fa-rocket mr-1" />
              Nâng cấp Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
