'use client';

const FEATURES = [
  {
    icon: 'fa-calculator',
    title: 'Tự Động Chia Đều',
    description:
      'Chỉ cần nhập tổng hóa đơn điện/nước/internet, 4B sẽ tự động tính và phân bổ cho từng thành viên một cách công bằng.',
    color: 'var(--primary)',
    bgColor: 'var(--color-bg-soft-primary)',
    borderColor: 'var(--color-border-soft-primary)',
  },
  {
    icon: 'fa-qrcode',
    title: 'VietQR 1-Chạm',
    description:
      'Tạo mã QR thanh toán cho từng thành viên. Bạn cùng phòng chỉ cần quét và chuyển khoản — không cần nhắn tin đòi.',
    color: 'var(--accent)',
    bgColor: 'var(--accent-light)',
    borderColor: '#f9c78a',
  },
  {
    icon: 'fa-bell',
    title: 'Nhắc Nhở Tự Động',
    description:
      'Hệ thống tự động nhắc nhở qua Zalo Bot khi đến hạn đóng tiền. Không còn cảnh quên hay lười nhắc.',
    color: '#0084ff',
    bgColor: '#e6f0ff',
    borderColor: '#b3d1ff',
  },
  {
    icon: 'fa-scale-balanced',
    title: 'Sòng Phẳng & Minh Bạch',
    description:
      'Mọi khoản thu chi được ghi lại rõ ràng. Không ai phải nghi ngờ ai, không còn tranh chấp tiền bạc.',
    color: 'var(--primary)',
    bgColor: 'var(--color-bg-soft-primary)',
    borderColor: 'var(--color-border-soft-primary)',
  },
  {
    icon: 'fa-robot',
    title: 'AI Hỗ Trợ Thông Minh',
    description:
      'Trợ lý AI giúp trả lời câu hỏi về phân bổ chi phí, đề xuất cách chia hợp lý dựa trên tình huống thực tế.',
    color: 'var(--dark)',
    bgColor: 'var(--bg-light)',
    borderColor: 'var(--border)',
  },
  {
    icon: 'fa-mobile-screen',
    title: 'Mobile-First',
    description:
      'Giao diện được tối ưu cho điện thoại — nơi sinh viên sử dụng nhiều nhất. Mọi thao tác chỉ trong vài tap.',
    color: 'var(--danger)',
    bgColor: 'var(--color-bg-warning-soft)',
    borderColor: 'var(--color-border-warning-soft)',
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="mx-auto max-w-[1240px] px-[5%] py-[80px]"
    >
      <div className="mb-12 text-center">
        <h2
          className="brand-font mb-3 text-3xl font-extrabold md:text-[36px]"
          style={{ color: 'var(--dark)' }}
        >
          Tính Năng Nổi Bật
        </h2>
        <p
          className="text-base"
          style={{ color: 'var(--text-muted)' }}
        >
          Tất cả những gì bạn cần để quản lý phòng trọ dễ dàng
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, index) => (
          <div
            key={index}
            className="group rounded-2xl border p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
            }}
          >
            <div
              className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              style={{
                background: feature.bgColor,
                borderWidth: 1,
                borderColor: feature.borderColor,
                borderStyle: 'solid',
              }}
            >
              <i
                className={`fa-solid ${feature.icon} text-2xl`}
                style={{ color: feature.color }}
              />
            </div>
            <h3
              className="mb-2 text-lg font-bold"
              style={{ color: 'var(--dark)' }}
            >
              {feature.title}
            </h3>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
