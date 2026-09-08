'use client';

const BLOG_POSTS = [
  {
    title: '5 Mẹo Tiết Kiệm Tiền Phòng Trọ Cho Sinh Viên',
    excerpt:
      'Chia sẻ kinh nghiệm quản lý chi phí hiệu quả khi ở ghép. Từ việc chia tiền điện nước công bằng đến mẹo mua sắm tiết kiệm hàng tháng.',
    category: 'Mẹo hay',
    categoryColor: 'var(--primary)',
    date: '05/09/2026',
    author: '4B Team',
    readTime: '5 phút đọc',
    gradient: 'linear-gradient(135deg, #3f7f12 0%, #6ab04c 100%)',
    icon: 'fa-solid fa-lightbulb',
  },
  {
    title: 'Cách Xử Lý Mâu Thuẫn Tiền Bạc Khi Ở Ghép',
    excerpt:
      'Tiền bạc luôn là nguyên nhân hàng đầu gây mâu thuẫn khi ở ghép. Tìm hiểu cách 4B giúp mọi thứ minh bạch và công bằng hơn.',
    category: 'Kinh nghiệm',
    categoryColor: 'var(--accent)',
    date: '01/09/2026',
    author: '4B Team',
    readTime: '7 phút đọc',
    gradient: 'linear-gradient(135deg, #e17055 0%, #fdcb6e 100%)',
    icon: 'fa-solid fa-handshake',
  },
  {
    title: 'VietQR: Chuyển Khoản 1-Chạm Không Cần Nhắn Tin',
    excerpt:
      'Hướng dẫn sử dụng tính năng VietQR của 4B để chuyển khoản đúng số tiền, đúng nội dung. Không cần nhắn xác nhận, mọi thứ tự động.',
    category: 'Hướng dẫn',
    categoryColor: 'var(--dark)',
    date: '28/08/2026',
    author: '4B Team',
    readTime: '4 phút đọc',
    gradient: 'linear-gradient(135deg, #2d3436 0%, #636e72 100%)',
    icon: 'fa-solid fa-qrcode',
  },
];

export function Blog() {
  return (
    <section
      id="blog"
      className="py-[80px]"
      style={{ background: 'var(--color-bg-soft-primary)' }}
    >
      <div className="mx-auto max-w-[1240px] px-[5%]">
        <div className="mb-12 text-center">
          <span
            className="mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'var(--surface)', color: 'var(--primary)', border: '1px solid var(--border)' }}
          >
            <i className="fa-solid fa-newspaper" />
            Blog
          </span>
          <h2
            className="brand-font mb-3 text-3xl font-extrabold md:text-[36px]"
            style={{ color: 'var(--dark)' }}
          >
            Bài Viết Mới Nhất
          </h2>
          <p
            className="text-base"
            style={{ color: 'var(--text-muted)' }}
          >
            Chia sẻ kinh nghiệm, mẹo hay và hướng dẫn sử dụng 4B
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {BLOG_POSTS.map((post, index) => (
            <article
              key={index}
              className="group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                background: 'var(--surface)',
                borderColor: 'var(--border)',
              }}
            >
              {/* Thumbnail */}
              <div
                className="flex h-[180px] items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]"
                style={{ background: post.gradient }}
              >
                <i
                  className={`${post.icon} text-4xl text-white/80 transition-transform duration-300 group-hover:scale-110`}
                />
              </div>

              {/* Content */}
              <div className="p-5">
                {/* Category Badge */}
                <span
                  className="mb-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{
                    background: `${post.categoryColor}15`,
                    color: post.categoryColor,
                  }}
                >
                  {post.category}
                </span>

                {/* Title */}
                <h3
                  className="mb-2 text-base font-bold leading-snug transition-colors group-hover:text-[var(--primary)]"
                  style={{ color: 'var(--dark)' }}
                >
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p
                  className="mb-4 text-sm leading-relaxed line-clamp-3"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {post.excerpt}
                </p>

                {/* Footer */}
                <div
                  className="flex items-center justify-between border-t pt-3"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white"
                      style={{ background: 'var(--primary)' }}
                    >
                      4B
                    </div>
                    <div>
                      <div className="text-xs font-medium" style={{ color: 'var(--dark)' }}>
                        {post.author}
                      </div>
                      <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {post.date}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    <i className="fa-regular fa-clock mr-1" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Link */}
        <div className="mt-8 text-center">
          <button
            className="inline-flex items-center gap-2 rounded-xl border px-6 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--primary)',
            }}
          >
            Xem tất cả bài viết
            <i className="fa-solid fa-arrow-right text-xs" />
          </button>
        </div>
      </div>
    </section>
  );
}
