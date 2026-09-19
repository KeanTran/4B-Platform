'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = saved === 'enabled' || (saved === null && prefersDark);

    setIsDark(shouldUseDark);
    document.documentElement.setAttribute('data-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  const toggleDarkMode = () => {
    setIsDark((current) => {
      const next = !current;
      document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
      window.localStorage.setItem('darkMode', next ? 'enabled' : 'disabled');
      return next;
    });
  };

  return (
    <Button
      type="button"
      onClick={toggleDarkMode}
      aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      variant="ghost"
      size="icon"
      className={cn('shrink-0', className)}
    >
      {isDark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
    </Button>
  );
}
