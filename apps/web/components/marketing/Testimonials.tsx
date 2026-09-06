'use client';

const TESTIMONIALS = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'Sinh viên năm 3, ĐH Bách Khoa',
    avatar: 'NT',
    avatarColor: 'var(--primary)',
    content:
      'Trước đây mỗi tháng đều phải nhắn nhắc bạn cùng phòng đóng tiền điện, nước. Giờ 4B tự động nhắc, mọi thứ công bằng và minh bạch hơn rất nhiều.',
    rating: 5,
  },
  {
    name: 'Trần Thu Hà',
    role: 'Nhân viên văn phòng, TP.HCM',
    avatar: 'TH',
    avatarColor: 'var(--accent)',
    content:
      'Mình ở ghép với 3 người bạn, việc chia tiền luôn là vấn đề nhạy cảm. Nhờ có 4B mà không còn cãi vã hay hiểu lầm nào về tiền bạc nữa.',
    rating: 5,
  },
  {
    name: 'Lê Hoàng Nam',
    role: 'Sinh viên năm 4, ĐH Kinh tế',
    avatar: 'LH',
    avatarColor: 'var(--dark)',
    content:
      'Tính năng VietQR của 4B quá tiện lợi! Chỉ cần quét mã là chuyển tiền, không cần nhắn tin xác nhận gì thêm. Tiết kiệm được cả tá thời gian.',
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-[80px]"
      style={{ background: 'var(--color-bg-soft-primary)' }}
    >
      <div className="mx-auto max-w-[1240px] px-[5%]">
        <div className="mb-12 text-center">
          <h2
            className="brand-font mb-3 text-3xl font-extrabold md:text-[36px]"
            style={{ color: 'var(--dark)' }}
          >
            Đánh Giá
          </h2>
          <p
            className="text-base"
            style={{ color: 'var(--text-muted)' }}
          >
            Hàng nghìn người đã tin dùng 4B
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl border p-6"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              <div className="mb-4 flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <i
                    key={i}
                    className="fa-solid fa-star text-sm"
                    style={{ color: 'var(--accent)' }}
                  />
                ))}
              </div>

              <p
                className="mb-4 text-sm leading-relaxed"
                style={{ color: 'var(--text-main)' }}
              >
                &ldquo;{testimonial.content}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ background: testimonial.avatarColor }}
                >
                  {testimonial.avatar}
                </div>
                <div>
                  <div
                    className="font-semibold"
                    style={{ color: 'var(--dark)' }}
                  >
                    {testimonial.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
