'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';
import { AIChatExperience } from './AIChatExperience';

export function AIChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  if (pathname === '/dashboard/ai') return null;

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Mở 4B Student AI"
          className="group fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[var(--shadow-brand)] transition hover:-translate-y-1 md:bottom-6 md:right-6"
        >
          <MessageCircle size={25} aria-hidden="true" />
          <span className="absolute -right-1 -top-1 rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[9px] font-black text-white">
            AI
          </span>
        </button>
      )}

      {isOpen && (
        <section
          aria-label="4B Student AI"
          className="fixed bottom-3 right-3 z-50 flex h-[min(680px,calc(100vh-1.5rem))] w-[calc(100vw-1.5rem)] max-w-[410px] flex-col overflow-hidden rounded-[24px] border border-[var(--glass-border)] bg-[var(--glass-surface-strong)] shadow-[var(--shadow-glass)] backdrop-blur-[var(--glass-blur)] md:bottom-6 md:right-6 md:max-h-[calc(100vh-3rem)]"
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Đóng 4B Student AI"
            className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-main)] transition hover:bg-[var(--glass-highlight)]"
          >
            <X size={18} aria-hidden="true" />
          </button>
          <AIChatExperience variant="widget" />
        </section>
      )}
    </>
  );
}
