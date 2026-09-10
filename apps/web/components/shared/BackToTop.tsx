'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Trở về đầu trang"
      className={`fixed bottom-14 right-6 sm:bottom-16 sm:right-8 z-40 flex h-12 w-12 flex-col items-center justify-center rounded-full shadow-md transition-all duration-300 hover:scale-105 hover:bg-neutral-500 hover:shadow-lg ${
        isVisible
          ? 'pointer-events-auto translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-4 opacity-0'
      }`}
      style={{
        background: '#9ca3af',
      }}
    >
      <i className="fa-solid fa-caret-up text-sm text-white leading-none -mb-0.5" />
      <span className="text-[10px] font-extrabold tracking-wider leading-none text-white">TOP</span>
    </button>
  );
}
