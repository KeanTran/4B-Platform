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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.message.trim()) {
      toast.error('Vui lòng nhập email và nội dung tin nhắn!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Save to localStorage for demo persistence
      try {
        const existing = JSON.parse(localStorage.getItem('4b_chat_messages') || '[]');
        existing.push({
          ...form,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('4b_chat_messages', JSON.stringify(existing));
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
      setIsSubmitted(true);
      toast.success('Tin nhắn đã được gửi tới đội ngũ 4B!');
    }, 600);
  };

  const handleReset = () => {
    setForm({ email: '', tel: '', message: '' });
    setIsSubmitted(false);
  };

  return (
    <aside aria-label="Hỗ trợ trực tuyến" className="fixed bottom-6 right-6 z-50">
      {/* Closed State Bubble Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 rounded-full px-4 py-3 text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
          style={{ background: 'var(--primary)' }}
          aria-label="Mở khung chat hỗ trợ"
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </div>
          <span className="text-sm font-bold tracking-wide">LIVE CHAT</span>
        </button>
      )}

      {/* Open State Chat Window */}
      {isOpen && (
        <div
          className="w-[320px] sm:w-[350px] overflow-hidden rounded-2xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
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
                  Cảm ơn bạn đã liên hệ. Đội ngũ hỗ trợ 4B sẽ phản hồi qua email trong thời gian sớm nhất!
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
                {/* Email input */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    required
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
                  Nếu bạn có bất kỳ câu hỏi hoặc góp ý nào, vui lòng để lại tin nhắn, chúng tôi sẽ phản hồi sớm nhất có thể!
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
