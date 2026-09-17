import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AIChatExperience } from './AIChatExperience';

vi.mock('@/components/ai-elements/conversation', () => ({
  Conversation: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ConversationContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  ConversationScrollButton: () => null,
}));

vi.mock('@/components/ai-elements/message', () => ({
  Message: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MessageContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  MessageResponse: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const initialUsage = {
  configured: true,
  plan: 'free',
  used: 0,
  limit: 5,
  remaining: 5,
  periodStart: '2026-09-01',
};

describe('AIChatExperience', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a message to the API and updates the visible quota', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ usage: initialUsage }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: {
            id: 'assistant-1',
            role: 'assistant',
            content: 'Mỗi người đóng **800.000đ**.',
          },
          usage: { ...initialUsage, used: 1, remaining: 4 },
        }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<AIChatExperience />);

    expect(await screen.findByText(/5\/5 lượt còn lại/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Câu hỏi cho 4B Student AI'), {
      target: { value: 'Chia 3.200.000đ cho 4 người' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi câu hỏi' }));

    expect(await screen.findByText('Mỗi người đóng **800.000đ**.')).toBeInTheDocument();
    expect(screen.getByText(/4\/5 lượt còn lại/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenLastCalledWith(
      '/api/ai/chat',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('disables the prompt and explains missing server configuration', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: 'AI đang được cấu hình.',
          usage: { ...initialUsage, configured: false },
        }),
      }),
    );

    render(<AIChatExperience />);

    expect(await screen.findByRole('alert')).toHaveTextContent('AI đang được cấu hình.');
    expect(screen.getByLabelText('Câu hỏi cho 4B Student AI')).toBeDisabled();
  });
});
