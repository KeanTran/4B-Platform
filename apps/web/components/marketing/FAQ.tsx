'use client';

import { useState } from 'react';

const FAQS = [
  {
    question: '4B có miễn phí không?',
    answer:
      'Có. Bạn có thể vào thẳng Dashboard, dùng các công cụ cơ bản và quản lý phòng tối đa 4 thành viên mà không cần thẻ tín dụng.',
  },
  {
    question: 'Tôi có cần đăng nhập trước khi dùng không?',
    answer:
      'Không. Dashboard, công cụ chia tiền, lịch trực và 4B AI đều có thể mở ở chế độ khách. Dữ liệu khách được lưu trên thiết bị; đăng nhập khi bạn muốn dùng không gian riêng và chuẩn bị đồng bộ.',
  },
  {
    question: 'Free và Pro khác nhau như thế nào?',
    answer:
      'Free giữ lại toàn bộ trải nghiệm thiết yếu với hạn mức phù hợp cho phòng nhỏ. Pro tăng số thành viên, lượt dùng AI, thời gian lưu lịch sử và mở các báo cáo nâng cao.',
  },
  {
    question: 'Tôi có thể thử AI trước khi nâng cấp Pro không?',
    answer:
      'Có. Gói Free có một số lượt hỏi AI mỗi tháng để bạn trải nghiệm. Pro dành cho người cần sử dụng thường xuyên hơn.',
  },
  {
    question: '4B có hỗ trợ thanh toán qua VietQR không?',
    answer:
      'Có! 4B tích hợp VietQR, cho phép tạo mã QR thanh toán cho từng thành viên. Người cần đóng tiền chỉ cần quét mã QR và chuyển khoản — không cần nhắn tin xác nhận.',
  },
  {
    question: 'Hệ thống nhắc nhở qua Zalo hoạt động như thế nào?',
    answer:
      'Khi đến hạn đóng tiền, 4B sẽ tự động gửi nhắc nhở qua Zalo Bot. Không cần cài đặt phức tạp, chỉ cần kết nối Zalo OA của 4B.',
  },
  {
    question: 'Dữ liệu của tôi có an toàn không?',
    answer:
      'Cam kết bảo mật dữ liệu là ưu tiên hàng đầu của 4B. Tất cả dữ liệu được mã hóa và lưu trữ an toàn. Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba.',
  },
  {
    question: 'Tôi có thể dùng 4B trên điện thoại không?',
    answer:
      'Có! 4B được thiết kế mobile-first, hoạt động tốt trên mọi thiết bị từ điện thoại đến máy tính bàn. Giao diện tự động thích ứng với kích thước màn hình.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="mx-auto max-w-[1240px] px-[5%] py-[80px]"
    >
      <div className="mb-12 text-center">
        <h2
          className="brand-font mb-3 text-3xl font-extrabold md:text-[36px]"
          style={{ color: 'var(--dark)' }}
        >
          Câu Hỏi Thường Gặp
        </h2>
        <p
          className="text-base"
          style={{ color: 'var(--text-muted)' }}
        >
          Giải đáp những thắc mắc phổ biến
        </p>
      </div>

      <div className="mx-auto max-w-[800px] space-y-4">
        {FAQS.map((faq, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[var(--bg-light)]"
            >
              <span
                className="font-semibold"
                style={{ color: 'var(--dark)' }}
              >
                {faq.question}
              </span>
              <i
                className={`fa-solid fa-chevron-down transition-transform ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
                style={{ color: 'var(--text-muted)' }}
              />
            </button>
            {openIndex === index && (
              <div
                className="border-t p-4 text-sm leading-relaxed"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p
          className="mb-4 text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          Vẫn còn thắc mắc?
        </p>
        <a
          href="mailto:4bforbetterbalance@gmail.com"
          className="inline-flex items-center gap-2 rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-[var(--primary-light)]"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--dark)',
            textDecoration: 'none',
          }}
        >
          <i className="fa-solid fa-envelope" />
          Liên hệ hỗ trợ
        </a>
      </div>
    </section>
  );
}
