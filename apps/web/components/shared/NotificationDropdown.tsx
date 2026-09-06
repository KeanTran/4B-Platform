'use client';

import { useState, useRef, useEffect } from 'react';
import { useUIStore } from '@/store/ui-store';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { notifications, markAsRead, markAllAsRead, removeNotification } = useUIStore();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'expense':
        return 'fa-file-invoice-dollar';
      case 'payment':
        return 'fa-check-circle';
      case 'duty':
        return 'fa-calendar-check';
      default:
        return 'fa-bell';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'expense':
        return 'var(--accent)';
      case 'payment':
        return 'var(--primary)';
      case 'duty':
        return 'var(--accent)';
      default:
        return 'var(--primary)';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 transition-colors hover:bg-[var(--bg-light)]"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Thông báo"
      >
        <i className="fa-solid fa-bell" />
        {unreadCount > 0 && (
          <span
            className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: 'var(--danger)' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border shadow-lg"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <span className="font-semibold" style={{ color: 'var(--dark)' }}>
              Thông báo
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium transition-colors hover:text-[var(--primary)]"
                style={{ color: 'var(--primary)' }}
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <i className="fa-solid fa-bell-slash text-3xl" style={{ color: 'var(--border)' }} />
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Không có thông báo nào
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`relative border-b px-4 py-3 transition-colors hover:bg-[var(--bg-light)] ${
                    !notification.read ? '' : 'opacity-60'
                  }`}
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: 'var(--color-bg-soft-primary)' }}
                    >
                      <i
                        className={`fa-solid ${getIcon(notification.type)}`}
                        style={{ color: getIconColor(notification.type) }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold" style={{ color: 'var(--dark)' }}>
                          {notification.title}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNotification(notification.id);
                          }}
                          className="flex-shrink-0 rounded p-1 transition-colors hover:bg-[var(--color-bg-soft-primary)]"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <i className="fa-solid fa-times text-xs" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[10px]" style={{ color: 'var(--border)' }}>
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  {!notification.read && (
                    <span
                      className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full"
                      style={{ background: 'var(--primary)' }}
                    />
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div
              className="border-t px-4 py-3 text-center"
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                className="text-sm font-medium transition-colors hover:text-[var(--primary)]"
                style={{ color: 'var(--text-muted)' }}
              >
                Xem tất cả ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
