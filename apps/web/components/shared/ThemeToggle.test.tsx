import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.setItem('darkMode', 'disabled');
    document.documentElement.setAttribute('data-theme', 'light');
  });

  it('persists theme changes for every app area', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' }));

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('darkMode')).toBe('enabled');
    expect(screen.getByRole('button', { name: 'Chuyển sang giao diện sáng' })).toBeInTheDocument();
  });
});
