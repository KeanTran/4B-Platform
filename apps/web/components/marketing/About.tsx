'use client';

import { BrandLogo } from '@/components/shared/BrandLogo';

export function About() {
  return (
    <section
      id="about"
      className="mx-auto max-w-[1240px] px-[5%] py-[80px]"
    >
      <div className="mb-12 text-center">
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

      {/* Câu chuyện thương hiệu (Brand Story) */}
      <div className="relative mx-auto mb-14 max-w-4xl">
        {/* Paperclip decoration on top right */}
        <div className="absolute -top-5 right-8 z-10 hidden sm:block">
          <svg
            className="h-14 w-8 drop-shadow-md"
            viewBox="0 0 32 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 14V42C12 45.3137 14.6863 48 18 48C21.3137 48 24 45.3137 24 42V16C24 10.4772 19.5228 6 14 6C8.47715 6 4 10.4772 4 16V46C4 53.732 10.268 60 18 60C25.732 60 32 53.732 32 46V16"
              stroke="#8e9aa4"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Note Card */}
        <div
          className="relative overflow-hidden rounded-[28px] border-2 p-6 shadow-lg transition-all sm:rounded-[36px] sm:p-10 md:p-12"
          style={{
            background: 'linear-gradient(180deg, #fdfae2 0%, #fefce8 100%)',
            borderColor: '#7ea500',
            boxShadow: '0 12px 32px rgba(126, 165, 0, 0.08), 0 2px 6px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header: Megaphone & Title */}
          <div className="mb-7 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-transform hover:rotate-6 sm:h-14 sm:w-14"
              style={{ background: '#e2f0a8' }}
            >
              <i className="fa-solid fa-bullhorn text-xl sm:text-2xl" style={{ color: '#527a00' }} />
            </div>
            <h3
              className="brand-font text-center text-2xl font-extrabold uppercase tracking-wide sm:text-3xl md:text-[32px]"
              style={{ color: '#6d4522' }}
            >
              CÂU CHUYỆN THƯƠNG HIỆU
            </h3>
          </div>

          {/* Content Paragraphs */}
          <div
            className="space-y-4 text-justify text-[15px] leading-relaxed sm:text-base sm:leading-[1.8] md:text-[16px]"
            style={{ color: '#44352b' }}
          >
            <p>
              Có những lúc, chúng ta phải rời xa gia đình để bắt đầu một hành trình mới, vì sự nghiệp, vì tương lai. Giữa thành phố xa lạ, ai cũng mong có một nơi để trở về, có những người cùng nấu một bữa cơm sau ngày dài, cùng kể nhau nghe những câu chuyện chẳng đầu chẳng cuối, hay đơn giản là có một người bạn bên cạnh để hành trình xa nhà trở nên bớt cô đơn.
            </p>

            <p>
              Tại <span className="inline-flex items-center gap-1 font-bold" style={{ color: '#4d7600' }}><BrandLogo height={20} className="inline-block -mt-0.5" /> 4B</span> ( For Better Balance ), chúng tôi tin rằng khoảng thời gian ở ghép không chỉ là sự chia sẻ một không gian sống, mà còn là nơi vun đắp những tình bạn chân thành nhất của tuổi trẻ. Nền tảng <span className="inline-flex items-center gap-1 font-bold" style={{ color: '#4d7600' }}><BrandLogo height={20} className="inline-block -mt-0.5" /> 4B</span> cung cấp cho bạn một trợ lý quản lý thông minh để mọi sinh hoạt chung luôn giữ được nét hài hòa và trọn vẹn.
            </p>

            <p>
              Bắt đầu từ sự kết hợp giữa công nghệ tính toán minh bạch và sự thấu hiểu tâm lý lứa tuổi sinh viên. Bạn không còn phải ngần ngại hay băn khoăn mỗi khi đến kỳ thanh toán hóa đơn. Và sau đó, hệ thống tự động của chúng tôi sẽ tiếp nối, tỉ mỉ xử lý từng con số, phân bổ chi phí sòng phẳng và gửi nhắc nhở riêng tư bằng tất cả sự tinh tế.
            </p>

            <p>
              Tình bạn sinh viên càng trong sáng, chân thành thì càng trở thành ký ức vô giá theo thời gian. Sự minh bạch và rõ ràng chính là chiếc chìa khóa bền vững nhất để giữ gìn sự gắn kết ấy.
            </p>

            <p>
              Chúng tôi ra đời để giúp bạn xóa bỏ những thoáng e ngại, tranh cãi không đáng có về tiền bạc hay công việc nhà. Không còn những lo âu về sự thiếu sòng phẳng làm tổn thương tình bạn. Tại đây, bạn trọn vẹn tận hưởng cuộc sống ở ghép vui vẻ, và chúng tôi là người đồng hành giữ gìn sự êm đẹp cho không gian sống của bạn.
            </p>
          </div>
        </div>
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

    </section>
  );
}
