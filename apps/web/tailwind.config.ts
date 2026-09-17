import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand primary
        brand: {
          primary: 'var(--primary)',
          'primary-dark': 'var(--primary-dark)',
          'primary-light': 'var(--primary-light)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          light: 'var(--accent-light)',
        },
        warning: 'var(--warning)',
        dark: {
          DEFAULT: 'var(--dark)',
          surface: 'var(--dark-surface)',
        },
        danger: 'var(--danger)',
        success: 'var(--success)',
        surface: 'var(--surface)',
        'bg-light': 'var(--bg-light)',
        'text-main': 'var(--text-main)',
        'text-muted': 'var(--text-muted)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-lexend)', 'var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        xl: 'var(--radius-xl)',
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
      boxShadow: {
        'brand': 'var(--shadow-brand)',
        'brand-md': 'var(--shadow-brand-sm)',
        'soft': 'var(--shadow-soft)',
        'glass': 'var(--shadow-glass)',
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-dark': 'var(--gradient-dark)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.2)' },
        },
        'typing-bounce': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-6px)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease',
        'slide-in': 'slide-in 0.3s ease',
        'slide-up': 'slide-up 0.4s ease',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'typing-bounce': 'typing-bounce 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
