import * as React from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'surface' | 'glass' | 'glass-strong';

const VARIANT_CLASSES: Record<CardVariant, string> = {
  surface: 'border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-soft)]',
  glass: 'glass-surface',
  'glass-strong': 'glass-surface-strong',
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'surface', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-[var(--radius-xl)]', VARIANT_CLASSES[variant], className)}
      {...props}
    />
  ),
);

Card.displayName = 'Card';
