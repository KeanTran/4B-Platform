'use client';

import { useEffect, useCallback } from 'react';
import { useUIStore } from '@/store/ui-store';

interface ModalProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showClose?: boolean;
}

export function Modal({ id, title, children, size = 'md', showClose = true }: ModalProps) {
  const { modalOpen, closeModal } = useUIStore();
  const isOpen = modalOpen === id;

  const handleClose = useCallback(() => {
    closeModal();
  }, [closeModal]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        onKeyDown={(e) => e.key === 'Enter' && handleClose()}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal Content */}
      <div
        className={`relative w-full ${sizeClasses[size]} mx-4 rounded-2xl border p-6 shadow-xl`}
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? `modal-title-${id}` : undefined}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="mb-4 flex items-center justify-between">
            {title && (
              <h2
                id={`modal-title-${id}`}
                className="text-lg font-bold"
                style={{ color: 'var(--dark)' }}
              >
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={handleClose}
                className="rounded-lg p-2 transition-colors hover:bg-[var(--bg-light)]"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        {children}
      </div>
    </div>
  );
}
