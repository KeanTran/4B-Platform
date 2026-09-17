import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { About } from './About';
import { Features } from './Features';
import { Hero } from './Hero';
import { HowItWorks } from './HowItWorks';
import { Pricing } from './Pricing';
import { ProSpotlight } from './ProSpotlight';

describe('Phase 3 marketing storefront', () => {
  it('keeps the brand slogan and makes the public Dashboard the primary path', () => {
    render(<Hero />);

    expect(screen.getByText('4B · For Better Balance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Dùng Dashboard miễn phí/i })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });

  it('presents each core tool as a directly accessible product', () => {
    render(<Features />);

    expect(screen.getByText('Dashboard phòng')).toBeInTheDocument();
    expect(screen.getByText('Chia tiền linh hoạt')).toBeInTheDocument();
    expect(screen.getByText('4B Student Pro AI')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Dùng công cụ/i })).toHaveLength(6);
  });

  it('explains onboarding and the Free-to-Pro AI model', () => {
    const { unmount } = render(<HowItWorks />);
    expect(screen.getByText('Mở phòng dùng thử')).toBeInTheDocument();
    expect(screen.getByText('Chia sẻ kết quả')).toBeInTheDocument();
    unmount();

    render(<ProSpotlight />);
    expect(screen.getByText(/Dùng AI miễn phí/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Thử 4B AI/i })).toHaveAttribute(
      'href',
      '/dashboard/ai',
    );
  });

  it('shows clear Free and Pro limits while preserving the About Us story', () => {
    const { unmount } = render(<Pricing />);
    expect(screen.getByText('5 lượt hỏi 4B AI mỗi tháng')).toBeInTheDocument();
    expect(screen.getByText('100 lượt hỏi 4B AI mỗi tháng')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đăng ký trải nghiệm Pro/i })).toHaveAttribute(
      'href',
      '/register?plan=pro',
    );
    unmount();

    render(<About />);
    expect(screen.getByText('CÂU CHUYỆN THƯƠNG HIỆU')).toBeInTheDocument();
    expect(screen.getByText(/Có những lúc, chúng ta phải rời xa gia đình/i)).toBeInTheDocument();
    expect(screen.getByText('GIÁ TRỊ CỐT LÕI')).toBeInTheDocument();
  });
});
