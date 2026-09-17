'use client';

import { FormEvent, useEffect, useState } from 'react';
import { ArrowUp, LoaderCircle, Sparkles } from 'lucide-react';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import type { AIUsageSnapshot } from '@/lib/ai/usage';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatExperienceProps {
  variant?: 'page' | 'widget';
}

interface AIResponse {
  message?: ChatMessage;
  usage?: AIUsageSnapshot;
  error?: string;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Chào bạn! Mình là **4B Student AI**. Hãy kể tình huống ở ghép của bạn — mình có thể giúp chia chi phí, lên lịch việc nhà hoặc soạn một tin nhắn dễ nói với bạn cùng phòng.',
};

const SUGGESTIONS = [
  'Chia 3.200.000đ tiền nhà cho 4 người thế nào?',
  'Lập lịch dọn phòng công bằng cho 3 người',
  'Soạn tin nhắn nhắc bạn cùng phòng trả tiền điện',
];

function createMessageId() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

export function AIChatExperience({ variant = 'page' }: AIChatExperienceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [usage, setUsage] = useState<AIUsageSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUsage() {
      try {
        const response = await fetch('/api/ai/usage', { cache: 'no-store' });
        const data = (await response.json()) as AIResponse;
        if (!active) return;
        if (data.usage) setUsage(data.usage);
        if (!response.ok) setError(data.error || 'Chưa thể tải lượt dùng AI.');
      } catch {
        if (active) setError('Không thể kết nối tới AI lúc này.');
      }
    }

    void loadUsage();
    return () => {
      active = false;
    };
  }, []);

  const canSend =
    Boolean(input.trim()) &&
    !isLoading &&
    usage?.configured !== false &&
    (usage?.remaining ?? 1) > 0;

  async function sendMessage(content: string) {
    const trimmed = content.trim();
    if (!trimmed || isLoading || usage?.configured === false) return;

    if (usage && usage.remaining <= 0) {
      setError('Bạn đã dùng hết lượt AI trong tháng này.');
      return;
    }

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content: trimmed,
    };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages
            .filter((message) => message.id !== WELCOME_MESSAGE.id)
            .slice(-10)
            .map(({ role, content: messageContent }) => ({
              role,
              content: messageContent,
            })),
        }),
      });
      const data = (await response.json()) as AIResponse;

      if (data.usage) setUsage(data.usage);
      if (!response.ok || !data.message) {
        setError(data.error || 'AI chưa thể phản hồi. Vui lòng thử lại.');
        return;
      }

      setMessages((current) => [...current, data.message!]);
    } catch {
      setError('Mất kết nối với AI. Vui lòng kiểm tra mạng và thử lại.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (canSend) void sendMessage(input);
  }

  const isWidget = variant === 'widget';
  const limitLabel = usage
    ? `${usage.remaining}/${usage.limit} lượt còn lại`
    : 'Đang tải hạn mức…';

  return (
    <div
      className={`flex min-h-0 flex-col overflow-hidden ${
        isWidget ? 'h-full' : 'h-[min(720px,calc(100vh-13rem))] min-h-[560px]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--glass-highlight)] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-bold text-[var(--text-heading)]">
              4B Student AI
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              AI thật · câu trả lời có thể cần kiểm tra lại
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[var(--glass-border-accent)] bg-[var(--surface)] px-3 py-1 text-[11px] font-bold text-[var(--primary-dark)]">
          {usage?.plan === 'pro' ? 'Pro' : 'Free'} · {limitLabel}
        </span>
      </div>

      <Conversation className="min-h-0 bg-[var(--glass-surface)]">
        <ConversationContent className="gap-5 p-4 md:p-5">
          {messages.map((message) => (
            <Message from={message.role} key={message.id}>
              <MessageContent
                className={
                  message.role === 'user'
                    ? '!rounded-2xl !rounded-br-sm !bg-[var(--primary)] !px-4 !py-3 !text-white'
                    : 'rounded-2xl rounded-bl-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-sm'
                }
              >
                {message.role === 'assistant' ? (
                  <MessageResponse>{message.content}</MessageResponse>
                ) : (
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                )}
              </MessageContent>
            </Message>
          ))}

          {isLoading && (
            <Message from="assistant">
              <MessageContent className="rounded-2xl rounded-bl-sm border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <span className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                  <LoaderCircle className="animate-spin" size={16} aria-hidden="true" />
                  Đang suy nghĩ…
                </span>
              </MessageContent>
            </Message>
          )}
        </ConversationContent>
        <ConversationScrollButton aria-label="Cuộn xuống tin nhắn mới nhất" />
      </Conversation>

      <div className="border-t border-[var(--border)] bg-[var(--glass-surface-strong)] p-3 md:p-4">
        {messages.length === 1 && !isLoading && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInput(suggestion)}
                className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-left text-xs text-[var(--text-main)] transition-colors hover:border-[var(--primary)] hover:bg-[var(--color-bg-soft-primary)]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mb-2 rounded-xl border border-[var(--color-border-warning-soft)] bg-[var(--color-bg-warning-soft)] px-3 py-2 text-xs text-[var(--color-danger-text)]" role="alert">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <label htmlFor={`ai-prompt-${variant}`} className="sr-only">
            Câu hỏi cho 4B Student AI
          </label>
          <textarea
            id={`ai-prompt-${variant}`}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (canSend) void sendMessage(input);
              }
            }}
            rows={1}
            maxLength={2_000}
            disabled={isLoading || usage?.configured === false}
            placeholder={usage?.configured === false ? 'AI chưa được cấu hình' : 'Hỏi về chi phí, việc nhà, giao tiếp…'}
            className="max-h-28 min-h-11 flex-1 resize-y rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-main)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Gửi câu hỏi"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-white shadow-[var(--shadow-brand-sm)] transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
          >
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-[var(--text-muted)]">
          Free {usage?.plan === 'free' ? usage.limit : 5} lượt/tháng · Pro 100 lượt/tháng
        </p>
      </div>
    </div>
  );
}
