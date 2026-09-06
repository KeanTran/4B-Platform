'use client';

import { useState } from 'react';
import { Modal } from '@/components/shared/Modal';
import { useUIStore } from '@/store/ui-store';

export function DemoModal() {
  const { modalOpen, closeModal } = useUIStore();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const isOpen = modalOpen === 'demo';

  const handleClose = () => {
    closeModal();
    setCurrentStep(1);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
      window.location.href = '/register';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal id="demo">
      <div className="w-full max-w-[720px]">
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--border)' }}
        >
          <span
            className="text-base font-extrabold"
            style={{ color: 'var(--dark)' }}
          >
            <i className="fa-solid fa-play-circle mr-1.5" style={{ color: 'var(--primary)' }} />
            Xem Demo 4B — 3 Bước Đơn Giản
          </span>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border text-sm"
            style={{
              background: 'var(--bg-light)',
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
            }}
            aria-label="Đóng demo"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Step 1 */}
          <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
            <h3
              className="mb-1.5 text-lg font-extrabold"
              style={{ color: 'var(--dark)' }}
            >
              Bước 1: Tạo phòng trọ & thêm thành viên
            </h3>
            <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              Điền tên phòng, email, mật khẩu — phòng của bạn sẽ được tạo trong 10 giây.
            </p>
            <div
              className="rounded-xl border border-dashed p-4"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="rounded-lg border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div
                  className="mb-2.5 flex items-center gap-2 border-b px-3 py-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <i className="fa-solid fa-shield-halved text-sm" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
                    Tạo Tài Khoản Phòng Trọ
                  </span>
                </div>
                <div className="space-y-1.5 p-3">
                  {[
                    { label: 'Tên phòng:', value: 'Phòng 302 - UEH' },
                    { label: 'Email:', value: 'tuan@ueh.edu.vn' },
                    { label: 'Số thành viên:', value: '4 người' },
                    { label: 'Trưởng phòng:', value: 'Minh Tuấn' },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                      style={{ background: 'var(--bg-light)' }}
                    >
                      <span style={{ color: 'var(--dark)', fontWeight: 600 }}>{item.label}</span>
                      <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
            <h3
              className="mb-1.5 text-lg font-extrabold"
              style={{ color: 'var(--dark)' }}
            >
              Bước 2: Thêm hóa đơn & chia tự động
            </h3>
            <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              Nhập tổng hóa đơn (tiền điện, nước, phòng...) — 4B chia đều/tỷ lệ/ngày ở cho cả phòng.
            </p>
            <div
              className="rounded-xl border border-dashed p-4"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="rounded-lg border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div
                  className="mb-2.5 flex items-center gap-2 border-b px-3 py-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <i className="fa-solid fa-calculator text-sm" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
                    Chia Chi Phí Tháng 8
                  </span>
                </div>
                <div className="space-y-1.5 p-3">
                  {[
                    { name: 'Minh Tuấn', amount: '1,200,000 đ', paid: true },
                    { name: 'Hà Linh', amount: '1,200,000 đ', paid: false },
                    { name: 'Phú Quý', amount: '1,200,000 đ', paid: false },
                    { name: 'Thanh Ngân', amount: '1,200,000 đ', paid: false },
                  ].map((member, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                      style={{ background: 'var(--bg-light)' }}
                    >
                      <span style={{ color: 'var(--dark)', fontWeight: 600 }}>{member.name}</span>
                      <div className="flex items-center gap-2">
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{member.amount}</span>
                        <span
                          className="rounded-full px-2 py-0.5 text-xs font-semibold"
                          style={{
                            background: member.paid ? 'var(--color-bg-soft-primary)' : 'rgba(217, 56, 30, 0.15)',
                            color: member.paid ? 'var(--primary-dark)' : 'var(--danger)',
                          }}
                        >
                          {member.paid ? 'Đã đóng' : 'Chưa đóng'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
            <h3
              className="mb-1.5 text-lg font-extrabold"
              style={{ color: 'var(--dark)' }}
            >
              Bước 3: Tạo mã VietQR chuyển khoản 1-chạm
            </h3>
            <p className="mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              Mỗi thành viên có mã QR riêng — quét là chuyển khoản đúng số tiền, đúng nội dung. Xong!
            </p>
            <div
              className="rounded-xl border border-dashed p-4"
              style={{
                background: 'var(--bg-light)',
                borderColor: 'var(--border)',
              }}
            >
              <div
                className="rounded-lg border"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
              >
                <div
                  className="mb-2.5 flex items-center gap-2 border-b px-3 py-2"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <i className="fa-solid fa-qrcode text-sm" style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--dark)' }}>
                    VietQR — Hà Linh
                  </span>
                </div>
                <div className="p-3">
                  <div className="mb-3 flex justify-center">
                    <div
                      className="rounded-xl border p-3"
                      style={{ background: 'white' }}
                    >
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=BANK_TRANSFER|MB|090xxx888|1200000|4B_PHONG302_HALINH"
                        alt="VietQR demo"
                        className="h-[120px] w-[120px]"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { label: 'Ngân hàng:', value: 'MBBank' },
                      { label: 'Số tiền:', value: '1,200,000 đ' },
                      { label: 'Nội dung:', value: '4B PHONG302 KHALINH' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
                        style={{ background: 'var(--bg-light)' }}
                      >
                        <span style={{ color: 'var(--dark)', fontWeight: 600 }}>{item.label}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between border-t px-5 py-4"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-light)',
          }}
        >
          <button
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-main)',
              background: 'var(--surface)',
            }}
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            Trước
          </button>

          <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            Bước {currentStep} / {totalSteps}
          </span>

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md transition-all"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
            }}
          >
            {currentStep === totalSteps ? (
              <>
                Bắt Đầu Ngay
                <i className="fa-solid fa-rocket text-xs" />
              </>
            ) : (
              <>
                Tiếp
                <i className="fa-solid fa-arrow-right text-xs" />
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
