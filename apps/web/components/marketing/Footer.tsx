'use client';

import Link from 'next/link';
import { BrandLogo } from '@/components/shared/BrandLogo';

const FOOTER_LINKS = {
  product: {
    title: 'Sản phẩm',
    links: [
      { label: 'Tính năng', href: '#features' },
      { label: 'Bảng giá', href: '#pricing' },
      { label: 'Đánh giá', href: '#testimonials' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  company: {
    title: 'Công ty',
    links: [
      { label: 'Về chúng tôi', href: '#about' },
      { label: 'Liên hệ', href: 'mailto:4bforbetterbalance@gmail.com' },
      { label: 'Facebook', href: 'https://www.facebook.com/share/1JFn1i3hji/?mibextid=wwXIfr' },
    ],
  },
  legal: {
    title: 'Pháp lý',
    links: [
      { label: 'Điều khoản sử dụng', href: '#' },
      { label: 'Chính sách bảo mật', href: '#' },
    ],
  },
};

export function Footer() {
  return (
    <footer
      className="border-t"
      style={{
        background: 'var(--dark)',
        borderColor: 'var(--color-footer-divider)',
      }}
    >
      {/* Main Footer */}
      <div className="mx-auto max-w-[1240px] px-[5%] py-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand Column */}
          <div>
            <Link href="/" className="mb-4 inline-flex items-center gap-2 no-underline">
              <BrandLogo height={40} />
              <span
                className="brand-font text-2xl font-extrabold"
                style={{ color: 'var(--color-text-cream)' }}
              >
                4B
              </span>
            </Link>
            <p
              className="mb-4 text-sm leading-relaxed"
              style={{ color: 'var(--color-text-cream-soft)' }}
            >
              Giải pháp chia chi phí phòng trọ sòng phẳng & êm đẹp. Tự động hóa tính toán,
              VietQR 1-chạm, nhắc nợ tự động.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="mailto:4bforbetterbalance@gmail.com"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--color-text-cream)' }}
              >
                <i className="fa-solid fa-envelope text-sm" />
              </a>
              <a
                href="https://www.facebook.com/share/1JFn1i3hji/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:opacity-80"
                style={{ background: '#1877f2', color: 'white' }}
              >
                <i className="fa-brands fa-facebook text-sm" />
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(FOOTER_LINKS).map((section, index) => (
            <div key={index}>
              <h4
                className="mb-4 text-sm font-bold uppercase tracking-wider"
                style={{ color: 'var(--color-text-cream)' }}
              >
                {section.title}
              </h4>
              <ul className="space-y-2" style={{ listStyle: 'none' }}>
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:underline"
                      style={{ color: 'var(--color-footer-link)', textDecoration: 'none' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        className="border-t px-[5%] py-6"
        style={{ borderColor: 'var(--color-footer-divider)' }}
      >
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 text-center md:flex-row">
          <p
            className="text-sm"
            style={{ color: 'var(--color-footer-bottom)' }}
          >
            &copy; {new Date().getFullYear()} 4B — For Better Balance. Made with{' '}
            <i className="fa-solid fa-heart" style={{ color: 'var(--danger)' }} /> for students.
          </p>
          <p
            className="text-sm"
            style={{ color: 'var(--color-footer-bottom)' }}
          >
            4bforbetterbalance@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}
