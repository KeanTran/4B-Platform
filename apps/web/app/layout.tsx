import type { Metadata } from 'next';
import { Inter, Lexend } from 'next/font/google';
import { Toaster } from 'sonner';
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
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
  themeColor: '#3f7f12',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
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
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lexend:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
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
              fontFamily: 'Inter, sans-serif',
            },
          }}
        />
      </body>
    </html>
  );
}
