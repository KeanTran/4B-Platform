import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { LiveChat } from './LiveChat';

describe('LiveChat', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ message: 'Đã tiếp nhận.' }),
    }));
  });

  it('sends the request to the support inbox API and explains the response channel', async () => {
    render(<LiveChat />);
    fireEvent.click(screen.getByRole('button', { name: 'Mở khung chat hỗ trợ' }));
    fireEvent.change(screen.getByPlaceholderText('Email *'), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Message *'), { target: { value: 'Tôi cần hỗ trợ về gói Pro.' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/support/messages', expect.objectContaining({ method: 'POST' })));
    expect(await screen.findByText(/Dashboard admin/)).toBeInTheDocument();
    expect(screen.getByText(/email hoặc số điện thoại/)).toBeInTheDocument();
  });
});
