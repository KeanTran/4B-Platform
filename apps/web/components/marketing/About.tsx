'use client';

export function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-[1240px] px-[5%] py-[80px]"
    >
      <div className="mb-10 text-center">
        <h2
          className="brand-font mb-3 text-3xl font-extrabold md:text-[36px]"
          style={{ color: 'var(--dark)' }}
        >
          Về Chúng Tôi
        </h2>
        <p
          className="text-base"
          style={{ color: 'var(--text-muted)' }}
        >
          Câu chuyện đằng sau 4B
        </p>
      </div>

      {/* Tầm nhìn & Sứ mệnh */}
      <div className="mb-6 grid gap-6 md:grid-cols-2">
        {/* Tầm nhìn */}
        <div
          className="rounded-2xl p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
          style={{
            background: '#d4ee7d',
          }}
        >
          <h3
            className="brand-font mb-4 text-2xl font-extrabold tracking-wide"
            style={{ color: '#754827' }}
          >
            TẦM NHÌN
          </h3>
          <p
            className="text-base leading-relaxed"
            style={{ color: '#754827' }}
          >
            Trở thành nền tảng giúp việc sống chung trở nên tiện lợi, minh bạch
            và hài hòa hơn.
          </p>
        </div>

        {/* Sứ mệnh */}
        <div
          className="rounded-2xl p-8 text-center transition-all hover:-translate-y-1 hover:shadow-lg"
          style={{
            background: '#fff8b4',
          }}
        >
          <h3
            className="brand-font mb-4 text-2xl font-extrabold tracking-wide"
            style={{ color: '#754827' }}
          >
            SỨ MỆNH
          </h3>
          <p
            className="text-base leading-relaxed"
            style={{ color: '#754827' }}
          >
            Đơn giản hóa việc quản lý chi phí và sinh hoạt, giúp những người ở
            chung giảm bớt những bất tiện, tránh những tình huống khó xử và cùng
            nhau xây dựng một không gian sống công bằng hơn.
          </p>
        </div>
      </div>

      {/* Giá trị cốt lõi */}
      <div
        className="mb-12 rounded-2xl p-8 md:p-10"
        style={{
          background: '#754827',
        }}
      >
        <h3
          className="brand-font mb-6 text-center text-2xl font-extrabold tracking-wide md:text-3xl"
          style={{ color: '#fff08c' }}
        >
          GIÁ TRỊ CỐT LÕI
        </h3>
        <ul className="mx-auto max-w-3xl space-y-3">
          <li className="flex items-start gap-3">
            <span
              className="brand-font mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: '#fff08c' }}
            />
            <p className="text-base leading-relaxed md:text-lg" style={{ color: '#fffdea' }}>
              <span className="font-bold">Better:</span> Không ngừng cải thiện
              trải nghiệm sống chung.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span
              className="brand-font mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: '#fff08c' }}
            />
            <p className="text-base leading-relaxed md:text-lg" style={{ color: '#fffdea' }}>
              <span className="font-bold">Budget:</span> Minh bạch và hợp lý
              trong quản lý tài chính.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span
              className="brand-font mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: '#fff08c' }}
            />
            <p className="text-base leading-relaxed md:text-lg" style={{ color: '#fffdea' }}>
              <span className="font-bold">Build:</span> Cùng xây dựng sự tin
              tưởng và kết nối giữa các thành viên.
            </p>
          </li>
          <li className="flex items-start gap-3">
            <span
              className="brand-font mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: '#fff08c' }}
            />
            <p className="text-base leading-relaxed md:text-lg" style={{ color: '#fffdea' }}>
              <span className="font-bold">Balance:</span> Cân bằng giữa tiền
              bạc - trách nhiệm - mối quan hệ.
            </p>
          </li>
        </ul>
      </div>

      {/* Contact Card */}
      <div
        className="rounded-2xl border p-6 md:p-8"
        style={{
          background: 'var(--color-bg-soft-primary)',
          borderColor: 'var(--color-border-soft-primary)',
        }}
      >
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="text-center md:text-left">
            <h3
              className="mb-1 text-xl font-bold"
              style={{ color: 'var(--dark)' }}
            >
              Liên hệ với 4B
            </h3>
            <p
              className="text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              Đội ngũ 4B luôn sẵn sàng hỗ trợ bạn
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:4bforbetterbalance@gmail.com"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-white/50"
              style={{
                borderColor: 'var(--color-border-soft-primary)',
                color: 'var(--primary-dark)',
                textDecoration: 'none',
              }}
            >
              <i className="fa-solid fa-envelope" />
              4bforbetterbalance@gmail.com
            </a>
            <a
              href="https://www.facebook.com/share/1JFn1i3hji/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
              style={{
                background: '#1877f2',
                textDecoration: 'none',
              }}
            >
              <i className="fa-brands fa-facebook" />
              Facebook
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
