import type { Metadata, Viewport } from 'next';
import { Inter, Lexend } from 'next/font/google';
import { Toaster } from 'sonner';
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';
import { getGoogleSiteVerification, getSiteUrl } from '@/lib/site';
import '../styles/globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const lexend = Lexend({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-lexend',
  display: 'swap',
});
export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: '4B - Quản Lý & Chia Chi Phí Phòng Trọ Thông Minh',
    template: '%s | 4B Platform',
  },
  description:
    '4B - Nền tảng quản lý phòng trọ, chia chi phí tự động, VietQR 1-chạm, Zalo Bot nhắc nợ. Miễn phí cho sinh viên và người ở ghép. For Better Balance.',
  keywords: [
    'chia tiền phòng trọ',
    'quản lý phòng trọ',
    'sinh viên',
    'ở ghép',
    'VietQR',
    'Zalo Bot',
    '4B',
  ],
  authors: [{ name: '4B Platform' }],
  creator: '4B Platform',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    title: '4B - Quản Lý & Chia Chi Phí Phòng Trọ Thông Minh',
    description:
      'Chia chi phí phòng trọ sòng phẳng & êm đẹp. Tự động hóa tính toán, VietQR 1-chạm, Zalo Bot nhắc nợ tự động.',
    siteName: '4B Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: '4B - Quản Lý & Chia Chi Phí Phòng Trọ Thông Minh',
    description:
      'Chia chi phí phòng trọ sòng phẳng & êm đẹp. Tự động hóa tính toán, VietQR 1-chạm, Zalo Bot nhắc nợ tự động.',
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: getGoogleSiteVerification(),
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fffdea' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.variable} ${lexend.variable} font-sans`}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
          toastOptions={{
            style: {
              fontFamily: 'var(--font-inter), sans-serif',
            },
          }}
        />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
