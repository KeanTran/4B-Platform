'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  'Cách chia tiền điện nước hợp lý?',
  'Tính chi phí cho 4 người ở ghép',
  'Mẹo quản lý tiền bạc khi ở ghép',
  'Cách tạo QR cho thanh toán?',
];

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        'Xin chào! Tôi là trợ lý AI của 4B. Tôi có thể giúp bạn:\n\n• Tính toán và chia chi phí\n• Đề xuất cách phân bổ hợp lý\n• Giải đáp thắc mắc về sử dụng 4B\n\nBạn cần hỗ trợ gì hôm nay?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (will connect to Groq API later)
    setTimeout(() => {
      const responses = [
        'Dựa trên tình huống của bạn, tôi khuyên nên chia tiền theo công thức: Tổng chi phí / Số người ở ghép = Số tiền mỗi người đóng.',
        'Để tạo mã QR thanh toán, vào mục "Chia Chi Phí", chọn chi phí cần thanh toán và nhấn "Tạo VietQR".',
        'Mẹo quản lý tiền: Nên thu tiền vào ngày 1 hàng tháng, trước khi phát sinh các khoản chi mới.',
        'Nếu có thành viên sử dụng điện/nước nhiều hơn, có thể tính thêm hệ số cho người đó.',
      ];
      const randomIndex = Math.floor(Math.random() * responses.length);
      const randomResponse = responses[randomIndex] ?? 'Tôi sẵn sàng hỗ trợ bạn!';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating button - góc phải phía dưới */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Mở AI Hỗ Trợ"
          className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 6px 20px rgba(63, 127, 18, 0.4)',
          }}
        >
          <MessageCircle size={26} />
          <span
            className="absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full text-[10px] font-bold text-white"
            style={{ background: 'var(--accent)' }}
          >
            AI
          </span>
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex h-[600px] max-h-[calc(100vh-3rem)] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl"
          style={{
            background: 'var(--surface)',
            borderColor: 'var(--border)',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-4 py-3"
            style={{
              background: 'var(--gradient-primary)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center gap-3 text-white">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <i className="fa-solid fa-robot" />
              </div>
              <div>
                <h3 className="brand-font text-base font-bold">AI Hỗ Trợ</h3>
                <p className="text-xs opacity-80">Trợ lý thông minh 4B</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              aria-label="Đóng chat"
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                      message.role === 'user'
                        ? 'rounded-br-sm'
                        : 'rounded-bl-sm'
                    }`}
                    style={
                      message.role === 'user'
                        ? {
                            background: 'var(--gradient-primary)',
                            color: 'white',
                          }
                        : {
                            background: 'var(--bg-light)',
                            color: 'var(--text-main)',
                          }
                    }
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <p
                      className="mt-1 text-[10px] opacity-70"
                      style={
                        message.role === 'user'
                          ? { color: 'rgba(255,255,255,0.7)' }
                          : { color: 'var(--text-muted)' }
                      }
                    >
                      {message.timestamp.toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-sm px-4 py-3"
                    style={{ background: 'var(--bg-light)' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full"
                          style={{ background: 'var(--primary)', animationDelay: '0ms' }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full"
                          style={{ background: 'var(--primary)', animationDelay: '150ms' }}
                        />
                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full"
                          style={{ background: 'var(--primary)', animationDelay: '300ms' }}
                        />
                      </div>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        Đang xử lý...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Suggestions */}
          {messages.length === 1 && (
            <div
              className="border-t px-4 py-2.5"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="mb-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Gợi ý:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(suggestion)}
                    className="rounded-full border px-2.5 py-1 text-[11px] transition-colors hover:bg-[var(--primary-light)]"
                    style={{
                      borderColor: 'var(--border)',
                      color: 'var(--text-main)',
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div
            className="border-t p-3"
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập câu hỏi..."
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:border-[var(--primary)] focus:outline-none"
                style={{
                  background: 'var(--bg-light)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-main)',
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-white transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--gradient-primary)' }}
                aria-label="Gửi"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
