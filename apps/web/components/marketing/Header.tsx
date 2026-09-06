'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/shared/BrandLogo';

const NAV_LINKS = [
  { href: '#features', label: 'Tính Năng', icon: 'star' },
  { href: '#about', label: 'Về Chúng Tôi', icon: 'building' },
  { href: '#pricing', label: 'Gói Dịch Vụ', icon: 'tag' },
  { href: '#testimonials', label: 'Đánh Giá', icon: 'quote-left' },
  { href: '#faq', label: 'FAQ', icon: 'circle-question' },
  { href: '#register', label: 'Đăng Ký', icon: 'user-plus' },
] as const;

export function Header() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    if (saved === 'enabled' || (saved === null && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
    localStorage.setItem('darkMode', next ? 'enabled' : 'disabled');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b backdrop-blur-md"
        style={{
          background: 'rgba(255, 253, 234, 0.95)',
          borderColor: 'var(--border)',
          padding: '12px 5%',
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 no-underline" style={{ color: 'var(--dark)' }}>
          <BrandLogo height={38} />
          <span className="brand-font text-2xl font-extrabold tracking-tight" style={{ color: 'var(--dark)' }}>
            4B
          </span>
        </Link>

        <ul className="hidden items-center gap-8 md:flex" style={{ listStyle: 'none' }}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="nav-link group relative inline-flex items-center gap-1.5 pb-1 text-sm font-semibold transition-colors"
                style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {link.label}
                {/* Underline animation */}
                <span
                  className="absolute bottom-0 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full"
                  style={{ background: 'var(--primary)' }}
                />
                {/* Dot indicator on hover */}
                <span
                  className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 scale-0 rounded-full transition-transform duration-200 group-hover:scale-100"
                  style={{ background: 'var(--accent)' }}
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="rounded-full border px-3 py-2 text-sm font-semibold transition-all hover:bg-[var(--primary-light)]"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-main)',
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => setMobileMenuOpen((s) => !s)}
            aria-label="Menu"
            className="flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg md:hidden"
            style={{ background: 'var(--bg-light)', border: 'none' }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            href="/login"
            className="hidden md:inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              background: 'var(--gradient-primary)',
              boxShadow: '0 4px 12px rgba(63, 127, 18, 0.3)',
              textDecoration: 'none',
            }}
          >
            <i className="fa-solid fa-right-to-bracket" />
            Đăng Nhập
          </Link>
        </div>
      </header>

      {/* Mobile menu drawer */}
      <nav
        aria-hidden={!mobileMenuOpen}
        className={`fixed right-0 top-0 z-[60] h-screen w-[280px] transition-transform duration-300 md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'var(--surface)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
          padding: '16px 20px',
        }}
      >
        <div className="mb-4 flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
          <span className="brand-font text-xl font-extrabold" style={{ color: 'var(--dark)' }}>
            4B
          </span>
          <button
            onClick={closeMobileMenu}
            aria-label="Đóng menu"
            className="flex h-9 w-9 items-center justify-center rounded-full"
            style={{ background: 'var(--bg-light)', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        <ul className="flex flex-col gap-1" style={{ listStyle: 'none' }}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-md px-4 py-3.5 text-sm font-semibold transition-colors"
                style={{
                  color: 'var(--dark)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--primary-light)';
                  e.currentTarget.style.color = 'var(--primary-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--dark)';
                }}
              >
                <i className={`fa-solid fa-${link.icon} text-[var(--primary)]`} style={{ width: 20 }} />
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-4">
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-md px-4 py-3.5 text-sm font-semibold"
              style={{ color: 'var(--dark)', textDecoration: 'none', background: 'var(--bg-light)' }}
            >
              <i className="fa-solid fa-right-to-bracket text-[var(--primary)]" />
              Đăng Nhập
            </Link>
          </li>
        </ul>
      </nav>

      {/* Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={closeMobileMenu}
          className="fixed inset-0 z-[55] bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}
    </>
  );
}
