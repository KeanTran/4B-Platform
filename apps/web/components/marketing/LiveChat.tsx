'use client';

import { useState } from 'react';
import { Mail, Phone, Edit3, MessageCircle, Minus, X, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: '',
    tel: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.email.trim() || !form.message.trim()) {
      toast.error('Vui lòng nhập email và nội dung tin nhắn!');
      return;
    }

    const website = String(new FormData(e.currentTarget).get('company') ?? '');
    try {
      setLoading(true);
      const response = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email.trim(),
          phone: form.tel.trim(),
          message: form.message.trim(),
          source_path: window.location.pathname,
          website,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? 'Không thể gửi yêu cầu hỗ trợ.');

      setIsSubmitted(true);
      toast.success(result.message ?? 'Yêu cầu đã vào hộp thư hỗ trợ của 4B!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể gửi yêu cầu hỗ trợ.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ email: '', tel: '', message: '' });
    setIsSubmitted(false);
  };

  return (
    <aside aria-label="Hỗ trợ trực tuyến" className="fixed bottom-4 right-4 z-50 max-w-[calc(100vw-32px)] sm:bottom-0 sm:right-8">
      {/* Closed State Bar Button matching reference design */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all duration-200 hover:brightness-105 active:scale-[0.99] sm:h-auto sm:w-52 sm:justify-between sm:rounded-b-none sm:rounded-t-xl sm:px-5 sm:py-2.5"
          style={{ background: 'var(--primary)' }}
          aria-label="Mở khung chat hỗ trợ"
        >
          <MessageCircle className="h-5 w-5 sm:hidden" aria-hidden="true" />
          <span className="hidden text-base font-bold tracking-wide sm:inline">Chat Now</span>
          <span className="hidden select-none text-xl font-bold leading-none transition-transform duration-200 group-hover:scale-110 sm:inline">+</span>
        </button>
      )}

      {/* Open State Chat Window */}
      {isOpen && (
        <div
          className="w-[320px] sm:w-[350px] max-w-full overflow-hidden rounded-t-2xl border border-b-0 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: 'var(--primary)' }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-extrabold tracking-wider text-sm">LIVE CHAT</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 hover:bg-black/10 transition-colors"
                aria-label="Thu nhỏ khung chat"
                title="Thu nhỏ"
              >
                <Minus className="h-5 w-5 stroke-[3]" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-md p-1 hover:bg-black/10 transition-colors sm:hidden"
                aria-label="Đóng khung chat"
                title="Đóng"
              >
                <X className="h-4 w-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {isSubmitted ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-[var(--primary)] mb-3" />
                <h4 className="font-bold text-base mb-1" style={{ color: 'var(--dark)' }}>
                  Gửi thành công!
                </h4>
                <p className="text-xs text-[var(--text-muted)] mb-5 leading-relaxed">
                  Yêu cầu đã vào Hộp thư hỗ trợ trong Dashboard admin. 4B sẽ phản hồi qua email hoặc số điện thoại bạn cung cấp.
                </p>
                <button
                  onClick={handleReset}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--primary)' }}
                >
                  Gửi tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="absolute -left-[9999px] h-px w-px opacity-0"
                />
                {/* Email input */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
                    maxLength={254}
                    placeholder="Email *"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{
                      background: 'var(--color-bg-soft-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--dark)',
                    }}
                  />
                </div>

                {/* Tel input */}
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="tel"
                    minLength={6}
                    maxLength={32}
                    placeholder="Tel"
                    value={form.tel}
                    onChange={(e) => setForm({ ...form, tel: e.target.value })}
                    className="w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    style={{
                      background: 'var(--color-bg-soft-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--dark)',
                    }}
                  />
                </div>

                {/* Message input */}
                <div className="relative">
                  <Edit3 className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  <textarea
                    required
                    minLength={10}
                    maxLength={2000}
                    rows={4}
                    placeholder="Message *"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                    style={{
                      background: 'var(--color-bg-soft-primary)',
                      borderColor: 'var(--border)',
                      color: 'var(--dark)',
                    }}
                  />
                </div>

                {/* Description Note */}
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Đây là hộp thư hỗ trợ, không phải chat tức thời. Admin sẽ tiếp nhận trong Dashboard và phản hồi qua thông tin liên hệ của bạn.
                </p>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:opacity-95 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: 'var(--primary)' }}
                >
                  {loading ? (
                    'Đang gửi...'
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      SUBMIT
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
