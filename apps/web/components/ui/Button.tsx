import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-[transform,background-color,box-shadow,color,border-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-light)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'gradient-primary text-white shadow-[var(--shadow-brand-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-brand)]',
        secondary:
          'bg-[var(--primary-light)] text-[var(--primary-dark)] hover:bg-[var(--color-border-soft-primary)]',
        outline:
          'border border-[var(--border)] bg-[var(--surface)] text-[var(--text-heading)] hover:border-[var(--primary)] hover:bg-[var(--color-bg-soft-primary)]',
        ghost:
          'text-[var(--text-main)] hover:bg-[var(--glass-highlight)]',
        danger:
          'bg-[var(--danger)] text-white hover:-translate-y-0.5 hover:brightness-95',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-11 px-6 text-sm',
        lg: 'h-12 px-7 text-sm',
        'icon-sm': 'h-8 w-8 p-0',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';
    return (
      <Component
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { buttonVariants };
